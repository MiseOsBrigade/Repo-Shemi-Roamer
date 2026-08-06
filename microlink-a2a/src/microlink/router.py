from __future__ import annotations

from dataclasses import dataclass, field
import time
import uuid
from typing import Callable

from .frame import AgentFrame, FrameError, MessageType
from .link import PhotonicLink


class PolicyError(PermissionError):
    """Raised when an agent or message violates channel policy."""


@dataclass(slots=True)
class AgentEndpoint:
    agent_id: uuid.UUID
    name: str
    allowed_send_types: frozenset[MessageType]
    allowed_receive_types: frozenset[MessageType]
    inbox: list[AgentFrame] = field(default_factory=list)
    handler: Callable[[AgentFrame], None] | None = None

    def deliver(self, frame: AgentFrame) -> None:
        self.inbox.append(frame)
        if self.handler is not None:
            self.handler(frame)


@dataclass(slots=True)
class _ChannelState:
    key: bytes
    members: set[uuid.UUID]
    last_sequence_by_sender: dict[uuid.UUID, int] = field(default_factory=dict)


class MicroLinkRouter:
    def __init__(self, link: PhotonicLink) -> None:
        self.link = link
        self._agents: dict[uuid.UUID, AgentEndpoint] = {}
        self._channels: dict[uuid.UUID, _ChannelState] = {}

    def register_agent(self, endpoint: AgentEndpoint) -> None:
        if endpoint.agent_id in self._agents:
            raise PolicyError("agent is already registered")
        self._agents[endpoint.agent_id] = endpoint

    def create_channel(
        self,
        *,
        channel_id: uuid.UUID,
        key: bytes,
        members: set[uuid.UUID],
    ) -> None:
        if channel_id in self._channels:
            raise PolicyError("channel already exists")
        if len(key) < 16:
            raise PolicyError("channel key must contain at least 16 bytes")
        missing = members.difference(self._agents)
        if missing:
            raise PolicyError(f"unknown channel members: {sorted(map(str, missing))}")
        self._channels[channel_id] = _ChannelState(key=key, members=set(members))

    def send(self, frame: AgentFrame, *, now_ns: int | None = None) -> AgentFrame:
        source = self._agents.get(frame.source_agent)
        destination = self._agents.get(frame.destination_agent)
        channel = self._channels.get(frame.channel_id)

        if source is None or destination is None:
            raise PolicyError("source or destination agent is unregistered")
        if channel is None:
            raise PolicyError("channel does not exist")
        if frame.source_agent not in channel.members or frame.destination_agent not in channel.members:
            raise PolicyError("source or destination is not a channel member")
        if frame.message_type not in source.allowed_send_types:
            raise PolicyError(f"{source.name} may not send {frame.message_type.name}")
        if frame.message_type not in destination.allowed_receive_types:
            raise PolicyError(f"{destination.name} may not receive {frame.message_type.name}")

        previous = channel.last_sequence_by_sender.get(frame.source_agent, -1)
        if frame.sequence <= previous:
            raise PolicyError("sequence is stale or replayed")

        current = time.time_ns() if now_ns is None else now_ns
        if frame.is_expired(now_ns=current):
            raise PolicyError("frame expired before transmission")

        wire = frame.encode(channel.key)
        delivered_wire = self.link.transmit(wire)
        try:
            decoded = AgentFrame.decode(
                delivered_wire,
                channel.key,
                now_ns=current,
                enforce_ttl=True,
            )
        except FrameError:
            raise

        channel.last_sequence_by_sender[frame.source_agent] = frame.sequence
        destination.deliver(decoded)
        return decoded
