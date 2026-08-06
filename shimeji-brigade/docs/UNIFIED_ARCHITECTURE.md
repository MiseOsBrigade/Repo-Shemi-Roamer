# Unified Architecture

```text
reference packet
  -> Character Studio workflow
  -> canonical 128x128 master
  -> state frame generation
  -> validation
  -> runtime pack export
  -> Shimeji Mint metadata bridge
```

## Runtime lane

The runtime lane validates sprite packs and exports runtime bundles.

## Studio lane

The studio lane is the creator-facing workflow for upload, crop, cleanup, canonicalization, frame generation, validation, and export.

## Provenance lane

Shimeji Mint remains separate. This package exports clean metadata only.
