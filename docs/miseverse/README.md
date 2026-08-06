# Miseverse Character Grid

A signed, visual-only character world for Repo Shemi Roamer. Eight supplied character cards are integrated as clickable operators inside a circuit-board city of evidence, work, memory, time, and governance.

## Run

```bash
npm run build:miseverse
npm run verify:miseverse
npm run preview:miseverse
```

Open `http://127.0.0.1:4173/miseverse/`.

## Security invariant

Character images are passive assets. Hotspots and workflow labels come from an Ed25519-signed manifest. A click can only animate allowlisted labels in the browser; it cannot execute repository code or mutate files.
