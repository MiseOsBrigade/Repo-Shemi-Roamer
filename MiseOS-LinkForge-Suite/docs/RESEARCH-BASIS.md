# Research Basis

The suite's design reflects current evidence and standards:

- GitHub's 2026 maintainer guidance emphasizes SECURITY.md, private vulnerability
  reporting, secret scanning with push protection, Dependabot and dependency
  review, CodeQL, and protected default branches.
- GitHub recommends least-privilege workflow permissions and immutable action
  references for stronger supply-chain integrity.
- GitHub artifact attestations provide provenance for generated artifacts.
- CycloneDX provides a machine-readable SBOM standard.
- W3C PROV-O provides a general provenance vocabulary.
- OpenAlex, Crossref, and Semantic Scholar provide official scholarly metadata
  APIs suitable for evidence enrichment.
- Research on citation-enabled generation shows that citation completeness and
  support remain imperfect, so LinkForge preserves source records and confidence
  separately from generated prose.
- Research on indirect prompt injection shows that external content can blur the
  boundary between data and instructions, motivating explicit trust boundaries
  and constrained tool execution.

See `SOURCES.md` for the source register.
