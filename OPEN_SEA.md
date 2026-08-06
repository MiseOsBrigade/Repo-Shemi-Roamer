# Procedural Open Sea — WebGPU + TSL

This repository includes a production-oriented, full-screen procedural ocean demo packaged as `procedural-open-sea-webgpu.zip`.

The archive contains exactly two directly runnable files:

```text
index.html
main.js
```

A GitHub Actions installer verifies the archive checksum, expands the readable source into `docs/open-sea/`, syntax-checks `main.js`, parses `index.html`, and commits the generated source back to `main` when the package changes.

## Run locally

```bash
unzip procedural-open-sea-webgpu.zip -d open-sea
cd open-sea
python3 -m http.server 8080
```

Open `http://localhost:8080` in a browser with WebGPU enabled.

The demo deliberately has no WebGL fallback. It imports Three.js `0.184.0` and TSL through the pinned import map in `index.html`.

## Included rendering systems

- `WebGPURenderer` and native ES modules.
- Exactly five Gerstner waves.
- Analytic swell derivatives and normals.
- Animated gradient-noise FBM capillary detail.
- Shared analytic sky and water-reflection radiance.
- Fresnel, backlit crests, sun glitter, foam, horizon haze, clouds, sun disk, and halo.
- TSL bloom and ACES filmic tone mapping.
- Damped OrbitControls, camera drift, sea-state/time controls, FPS display, adaptive DPR, hidden-tab pause, touch input, reduced-motion handling, and explicit failure states.
