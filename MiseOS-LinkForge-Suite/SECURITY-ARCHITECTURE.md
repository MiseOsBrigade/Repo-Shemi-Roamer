# Security Architecture

## Input boundary

URLs are normalized, embedded credentials are rejected, DNS answers are checked
for non-public addresses, redirects are revalidated, content types are
allowlisted, and responses are bounded by size and time. Local inputs must be
regular files.

## Model boundary

Source text is wrapped as untrusted data. The summarizer is instructed not to
follow embedded directions. A deterministic scanner records suspicious phrases,
but the design does not treat detection as a complete defense. Tool calls and
privileged actions remain outside the source-controlled context.

## Supply chain

Each repository includes `SECURITY.md`, private-reporting guidance, Dependabot,
CodeQL, branch-rule templates, least-privilege workflows, SBOM generation, and
artifact attestations. Production deployments should pin action dependencies to
verified full commit SHAs and enforce the included ruleset after adapting check
names.

## Data rights

The system does not bypass authentication, robots controls, paywalls, or DRM.
Statista, PitchBook, CB Insights, Wiley, and similar sources are supported via
licensed APIs or user-authorized exports only.
