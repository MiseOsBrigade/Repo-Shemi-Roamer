# Character Runtime Security

Character art remains passive content. Repo Shemi does not read executable instructions from image pixels, metadata chunks, filenames, or alt text.

## Controls

- Scripts are loaded only from repository-owned JavaScript files.
- GitHub Pages uses a restrictive Content Security Policy.
- Workflow labels are loaded from generated JSON and rendered with DOM text nodes.
- No arbitrary module path is accepted from browser data.
- No wallet, NFT, token, or entitlement state grants code-execution authority.
- Real repository actions must be implemented through a separate authenticated allowlist and audited service.

## Threats explicitly excluded

- PNG or JPEG polyglot execution.
- Steganographic JavaScript decoding.
- `eval`, `new Function`, or dynamic inline code.
- Automatic execution from a character click.
- Secret extraction from traversed repository paths.
