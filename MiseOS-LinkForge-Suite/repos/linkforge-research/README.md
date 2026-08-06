# LinkForge Research

Evidence enrichment and validation for LinkForge packets.

## Live providers

- OpenAlex scholarly works
- Crossref scholarly metadata
- Semantic Scholar Academic Graph
- OpenAI Responses web search, when configured
- Authorized CSV/JSON exports from Statista, PitchBook, CB Insights, Wiley,
  Quartr, or another licensed source

The licensed-source adapter never scrapes paywalls or bypasses access controls.
It imports data the user is authorized to possess and records the provider,
export timestamp, license note, and file hash.

```bash
python -m pip install -e '.[dev,ai]'
linkforge-research enrich packet/report.json --query "software supply chain security" --output packet/evidence.json
```
