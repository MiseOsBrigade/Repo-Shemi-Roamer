# Monetization Architecture

## Product ladder

| Tier | Intended user | Offer |
|---|---|---|
| Community | Individual and open-source maintainers | Local CLI, public manifests, core validation, community workflows |
| Pro | Individual professionals and small teams | Hosted runs, private projects, higher limits, premium agent packs |
| Team | Product and platform teams | Shared workspaces, RBAC, approvals, audit history, GitHub App policies |
| Enterprise | Regulated or large organizations | SSO/SAML, private deployment, custom retention, policy packs, support, contractual controls |
| Marketplace | Publishers and buyers | Paid agents, workflows, templates, licensing, verified publisher program |

## Metered units

- Capability executions
- Hosted runner minutes
- Model input/output usage
- Storage and artifact retention
- Private registry items
- Active repositories
- Active organization seats
- Evaluation and proof-gate runs

## Billing boundary

Billing must be an adapter outside the core runtime. Entitlements may authorize a capability, but payment logic must never weaken permission, validation, or proof requirements.

## Marketplace revenue model

- Platform fee on paid agent and workflow transactions.
- Publisher subscriptions for private distribution and analytics.
- Enterprise licensing for curated Brigade packs.
- Services revenue for integration, policy design, and private deployment.

## Required controls before charging customers

1. Stable identity and organization model.
2. Idempotent usage events.
3. Signed webhook verification.
4. Reconciliation between usage, entitlement, and invoice records.
5. Refund and credit policy.
6. Clear data retention and deletion rules.
7. Audit logs for plan and permission changes.
8. No secrets or payment data in registry manifests.
