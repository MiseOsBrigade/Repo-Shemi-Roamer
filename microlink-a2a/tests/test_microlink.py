from __future__ import annotations

import os
import sys
import time
import unittest
import uuid

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from microlink import (
    AgentEndpoint,
    AgentFrame,
    FrameError,
    MessageType,
    MicroLinkRouter,
    PhotonicLink,
    PolicyError,
)


class MicroLinkTests(unittest.TestCase):
    def setUp(self) -> None:
        self.a = uuid.uuid4()
        self.b = uuid.uuid4()
        self.channel = uuid.uuid4()
        self.key = b"0123456789abcdef0123456789abcdef"
        self.router = MicroLinkRouter(PhotonicLink())
        self.router.register_agent(
            AgentEndpoint(
                self.a,
                "A",
                frozenset({MessageType.TASK}),
                frozenset({MessageType.STATUS}),
            )
        )
        self.router.register_agent(
            AgentEndpoint(
                self.b,
                "B",
                frozenset({MessageType.STATUS}),
                frozenset({MessageType.TASK}),
            )
        )
        self.router.create_channel(
            channel_id=self.channel,
            key=self.key,
            members={self.a, self.b},
        )

    def frame(self, *, sequence: int = 1, ttl_ms: int = 5_000, timestamp_ns: int | None = None) -> AgentFrame:
        return AgentFrame.from_json(
            source_agent=self.a,
            destination_agent=self.b,
            channel_id=self.channel,
            sequence=sequence,
            message_type=MessageType.TASK,
            payload={"instruction": "ping"},
            ttl_ms=ttl_ms,
            timestamp_ns=timestamp_ns,
        )

    def test_round_trip(self) -> None:
        delivered = self.router.send(self.frame())
        self.assertEqual(delivered.payload_json()["instruction"], "ping")

    def test_crc_detects_corruption(self) -> None:
        wire = bytearray(self.frame().encode(self.key))
        wire[-8] ^= 0x01
        with self.assertRaisesRegex(FrameError, "CRC mismatch"):
            AgentFrame.decode(bytes(wire), self.key)

    def test_mac_detects_forged_key(self) -> None:
        wire = self.frame().encode(self.key)
        body = bytearray(wire)
        body[-4:] = (0).to_bytes(4, "big")
        # Recompute CRC so authentication, rather than CRC, is the failing layer.
        import zlib
        body[-4:] = (zlib.crc32(body[:-4]) & 0xFFFFFFFF).to_bytes(4, "big")
        with self.assertRaisesRegex(FrameError, "authentication"):
            AgentFrame.decode(bytes(body), b"wrong-key-material-0123456789")

    def test_replay_rejected(self) -> None:
        self.router.send(self.frame(sequence=1))
        with self.assertRaisesRegex(PolicyError, "replayed"):
            self.router.send(self.frame(sequence=1))

    def test_ttl_rejected(self) -> None:
        expired = self.frame(
            timestamp_ns=time.time_ns() - 10_000_000,
            ttl_ms=1,
        )
        with self.assertRaisesRegex(PolicyError, "expired"):
            self.router.send(expired)

    def test_policy_rejects_message_class(self) -> None:
        forbidden = AgentFrame.from_json(
            source_agent=self.a,
            destination_agent=self.b,
            channel_id=self.channel,
            sequence=1,
            message_type=MessageType.CONTROL,
            payload={"command": "override"},
        )
        with self.assertRaisesRegex(PolicyError, "may not send"):
            self.router.send(forbidden)


if __name__ == "__main__":
    unittest.main()
