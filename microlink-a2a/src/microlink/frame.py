from __future__ import annotations

from dataclasses import dataclass
from enum import IntEnum
import hashlib
import hmac
import json
import struct
import time
import uuid
import zlib
from typing import Any, Mapping


MAGIC = b"MLA2"
VERSION = 1
_HEADER = struct.Struct("!4sBBBB16s16s16sQQII32s")
_CRC = struct.Struct("!I")
MAX_PAYLOAD = 1_048_576


class FrameError(ValueError):
    """Raised when a frame is malformed, unauthenticated, stale, or corrupt."""


class MessageType(IntEnum):
    TASK = 1
    OBSERVATION = 2
    EVIDENCE = 3
    PROPOSAL = 4
    APPROVAL_REQUEST = 5
    APPROVAL_DECISION = 6
    STATUS = 7
    CONTROL = 8


@dataclass(frozen=True, slots=True)
class AgentFrame:
    source_agent: uuid.UUID
    destination_agent: uuid.UUID
    channel_id: uuid.UUID
    sequence: int
    timestamp_ns: int
    ttl_ms: int
    message_type: MessageType
    priority: int
    payload: bytes
    flags: int = 0

    @classmethod
    def from_json(
        cls,
        *,
        source_agent: uuid.UUID,
        destination_agent: uuid.UUID,
        channel_id: uuid.UUID,
        sequence: int,
        message_type: MessageType,
        payload: Mapping[str, Any],
        ttl_ms: int = 5_000,
        priority: int = 3,
        flags: int = 0,
        timestamp_ns: int | None = None,
    ) -> "AgentFrame":
        encoded = json.dumps(
            payload,
            separators=(",", ":"),
            sort_keys=True,
            ensure_ascii=False,
        ).encode("utf-8")
        return cls(
            source_agent=source_agent,
            destination_agent=destination_agent,
            channel_id=channel_id,
            sequence=sequence,
            timestamp_ns=time.time_ns() if timestamp_ns is None else timestamp_ns,
            ttl_ms=ttl_ms,
            message_type=message_type,
            priority=priority,
            payload=encoded,
            flags=flags,
        )

    def payload_json(self) -> dict[str, Any]:
        try:
            value = json.loads(self.payload.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise FrameError("payload is not valid UTF-8 JSON") from exc
        if not isinstance(value, dict):
            raise FrameError("payload JSON must be an object")
        return value

    def _validate(self) -> None:
        if not 0 <= self.flags <= 255:
            raise FrameError("flags must fit in one byte")
        if not 0 <= self.priority <= 7:
            raise FrameError("priority must be between 0 and 7")
        if not 0 <= self.sequence < 2**64:
            raise FrameError("sequence is outside uint64 range")
        if not 1 <= self.ttl_ms <= 600_000:
            raise FrameError("ttl_ms must be between 1 and 600000")
        if len(self.payload) > MAX_PAYLOAD:
            raise FrameError(f"payload exceeds {MAX_PAYLOAD} bytes")

    def is_expired(self, *, now_ns: int | None = None) -> bool:
        current = time.time_ns() if now_ns is None else now_ns
        return current > self.timestamp_ns + self.ttl_ms * 1_000_000

    def encode(self, channel_key: bytes) -> bytes:
        self._validate()
        if len(channel_key) < 16:
            raise FrameError("channel key must contain at least 16 bytes")

        unsigned_header = _HEADER.pack(
            MAGIC,
            VERSION,
            self.flags,
            int(self.message_type),
            self.priority,
            self.source_agent.bytes,
            self.destination_agent.bytes,
            self.channel_id.bytes,
            self.sequence,
            self.timestamp_ns,
            self.ttl_ms,
            len(self.payload),
            b"\x00" * 32,
        )
        auth_tag = hashlib.blake2s(
            unsigned_header[:-32] + self.payload,
            key=channel_key,
            digest_size=32,
        ).digest()
        header = unsigned_header[:-32] + auth_tag
        body = header + self.payload
        crc = zlib.crc32(body) & 0xFFFFFFFF
        return body + _CRC.pack(crc)

    @classmethod
    def decode(
        cls,
        wire: bytes,
        channel_key: bytes,
        *,
        now_ns: int | None = None,
        enforce_ttl: bool = True,
    ) -> "AgentFrame":
        minimum = _HEADER.size + _CRC.size
        if len(wire) < minimum:
            raise FrameError("frame is shorter than the fixed header")
        if len(channel_key) < 16:
            raise FrameError("channel key must contain at least 16 bytes")

        body, crc_bytes = wire[:-4], wire[-4:]
        expected_crc = _CRC.unpack(crc_bytes)[0]
        actual_crc = zlib.crc32(body) & 0xFFFFFFFF
        if actual_crc != expected_crc:
            raise FrameError("CRC mismatch")

        unpacked = _HEADER.unpack(body[: _HEADER.size])
        (
            magic,
            version,
            flags,
            message_type,
            priority,
            source_bytes,
            destination_bytes,
            channel_bytes,
            sequence,
            timestamp_ns,
            ttl_ms,
            payload_len,
            auth_tag,
        ) = unpacked

        if magic != MAGIC:
            raise FrameError("invalid frame magic")
        if version != VERSION:
            raise FrameError(f"unsupported version {version}")
        if payload_len > MAX_PAYLOAD:
            raise FrameError("declared payload is too large")
        if len(body) != _HEADER.size + payload_len:
            raise FrameError("payload length does not match frame length")

        payload = body[_HEADER.size :]
        unsigned = body[: _HEADER.size - 32] + (b"\x00" * 32)
        expected_tag = hashlib.blake2s(
            unsigned[:-32] + payload,
            key=channel_key,
            digest_size=32,
        ).digest()
        if not hmac.compare_digest(auth_tag, expected_tag):
            raise FrameError("authentication tag mismatch")

        try:
            kind = MessageType(message_type)
        except ValueError as exc:
            raise FrameError(f"unknown message type {message_type}") from exc

        frame = cls(
            source_agent=uuid.UUID(bytes=source_bytes),
            destination_agent=uuid.UUID(bytes=destination_bytes),
            channel_id=uuid.UUID(bytes=channel_bytes),
            sequence=sequence,
            timestamp_ns=timestamp_ns,
            ttl_ms=ttl_ms,
            message_type=kind,
            priority=priority,
            payload=payload,
            flags=flags,
        )
        frame._validate()
        if enforce_ttl and frame.is_expired(now_ns=now_ns):
            raise FrameError("frame TTL has expired")
        return frame
