# Shimeji Brigade for Repo-Shemi-Roamer

Version **0.8.0** of the Shimeji Brigade candidate runtime package.

This package adds a contained visual-runtime subsystem for Repo-Shemi-Roamer:

- Mizu and Kurogami character registry entries
- deterministic 128×128 PNG frame generation
- seven-state sprite manifests
- CLI validation for PNG signatures and dimensions
- runtime-pack JSON/ZIP export
- Shimeji Mint bridge metadata export
- Character Studio and brand-system documentation

## Commands

```bash
cd shimeji-brigade
npm run build
```

That runs:

```text
candidate frame generation
  → sprite validation
  → runtime pack build
  → mint-ready metadata export
```

## Character mapping

- **Mizu** → page 1, blue-haired Ticket Alchemist
- **Kurogami** → page 2, Chef Sentinel

## Integrity boundary

The generated PNGs are structurally valid candidate frames. They are not claimed as final reference-accurate art. The manifests keep:

```json
{
  "referenceBacked": false,
  "candidateFrames": true,
  "visualApprovalRequired": true
}
```

Visual approval should happen in Character Studio before setting `referenceBacked` to `true`.

## Security boundary

No wallet signing, private keys, seed phrases, RPC credentials, IPFS credentials, or mint transaction code are included. Shimeji Mint remains a separate provenance and publishing boundary.
