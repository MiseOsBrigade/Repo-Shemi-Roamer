# MiseOS μLink-A2A Photonic Microtile

This repository includes a reference implementation of the MiseOS μLink-A2A electronic–photonic communication layer under [`microlink-a2a/`](microlink-a2a/).

The project models a four-wavelength, 40 Gb/s photonic link for authenticated AI agent messaging. It includes:

- typed task, evidence, proposal, approval, status, and control frames;
- channel-scoped message authentication and CRC integrity checks;
- replay, expiration, membership, and message-class policy enforcement;
- a Python behavioral model and runnable agent-to-agent demo;
- synthesizable SystemVerilog framing skeletons;
- protocol JSON Schema and engineering-boundary documentation;
- automated GitHub Actions validation.

## Run the model

```bash
cd microlink-a2a
PYTHONPATH=src python3 -m unittest discover -s tests -v
PYTHONPATH=src python3 examples/demo.py
```

The model is an architectural and protocol reference. It is not a fabrication-ready photonic integrated circuit layout.
