# μLink-A2A Architecture

## Signal path

```text
AI Agent Runtime
      │ typed task/evidence/proposal message
      ▼
Agent Envelope Adapter
      │ canonical JSON or compact binary payload
      ▼
Policy + Capability Gate ───────► deny / approval queue
      │ authorized payload
      ▼
Frame Engine
  sequence │ TTL │ channel │ source/destination │ keyed MAC │ CRC
      ▼
Crypto Interface
  prototype: keyed BLAKE2s
  production: channel MAC + public-key identity attestation
      ▼
SerDes / Lane Scheduler
      ▼
Microring Modulator Bank ── λ0 λ1 λ2 λ3 ── Optical Waveguide
      ▼
Photodiode Bank → TIA → CDR → Deserializer
      ▼
CRC + MAC + replay + TTL validation
      ▼
Destination AI Agent Runtime
```

## Proposed microtile blocks

| Block | Purpose |
|---|---|
| RISC-V or finite-state controller | configuration, telemetry, exception handling |
| Frame DMA | moves messages between agent memory and link FIFOs |
| Policy gate | validates channel, operation, payload class, and destination |
| Replay window | rejects duplicate or stale sequence numbers |
| Crypto port | interfaces with MAC/signature accelerator or secure element |
| 4-lane SerDes | maps frames across optical wavelengths |
| Thermal tuner | holds microring resonators on wavelength |
| Photonic Tx/Rx | modulation, filtering, multiplexing, and detection |
| Telemetry sensors | optical power, temperature, error rate, queue pressure |

## Engineering target, not measured silicon

- Tile envelope: approximately 0.25–1.0 mm² depending on SerDes, security, and tuning circuits
- Four optical lanes at 10 Gb/s each for an initial 40 Gb/s aggregate
- Packet latency objective: below 100 ns inside one package, excluding agent/model computation
- Package-level energy objective: 0.5–2 pJ/bit
- Optical wavelength band: around 1310 or 1550 nm depending on process and packaging

## Agent message classes

- `TASK`
- `OBSERVATION`
- `EVIDENCE`
- `PROPOSAL`
- `APPROVAL_REQUEST`
- `APPROVAL_DECISION`
- `STATUS`
- `CONTROL`

The physical layer remains message-agnostic. MiseOS policies decide which classes each agent may send or receive.
