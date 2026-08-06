from __future__ import annotations

import os
import sys
import uuid

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from microlink import AgentEndpoint, AgentFrame, MessageType, MicroLinkRouter, PhotonicLink


def main() -> None:
    planner_id = uuid.uuid4()
    verifier_id = uuid.uuid4()
    channel_id = uuid.uuid4()

    planner = AgentEndpoint(
        agent_id=planner_id,
        name="Prompt Pika",
        allowed_send_types=frozenset({MessageType.TASK}),
        allowed_receive_types=frozenset({MessageType.EVIDENCE, MessageType.STATUS}),
    )
    verifier = AgentEndpoint(
        agent_id=verifier_id,
        name="Evidence Scribe",
        allowed_send_types=frozenset({MessageType.EVIDENCE, MessageType.STATUS}),
        allowed_receive_types=frozenset({MessageType.TASK}),
    )

    link = PhotonicLink(wavelengths=4, lane_rate_bps=10e9)
    router = MicroLinkRouter(link)
    router.register_agent(planner)
    router.register_agent(verifier)
    router.create_channel(
        channel_id=channel_id,
        key=b"miseos-demo-channel-key-32bytes!",
        members={planner_id, verifier_id},
    )

    task = AgentFrame.from_json(
        source_agent=planner_id,
        destination_agent=verifier_id,
        channel_id=channel_id,
        sequence=1,
        message_type=MessageType.TASK,
        priority=5,
        ttl_ms=5_000,
        payload={
            "instruction": "Validate the evidence bundle.",
            "capability": "evidence.verify",
            "evidenceRefs": ["sha256:7f83b1657ff1fc53"],
        },
    )
    received = router.send(task)

    print("μLink delivery complete")
    print(f"source:      {planner.name}")
    print(f"destination: {verifier.name}")
    print(f"type:        {received.message_type.name}")
    print(f"payload:     {received.payload_json()}")
    print(f"wire bytes:  {len(received.encode(b'miseos-demo-channel-key-32bytes!'))}")
    print(f"link rate:   {link.aggregate_rate_bps / 1e9:.1f} Gb/s")
    print(
        "serialization: "
        f"{link.serialization_delay_seconds(received.encode(b'miseos-demo-channel-key-32bytes!')) * 1e9:.2f} ns"
    )


if __name__ == "__main__":
    main()
