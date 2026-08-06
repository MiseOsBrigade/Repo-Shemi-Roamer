# MiseOS Architecture Module

This directory contains governance and implementation guidance contributed from the MiseOS orchestration research stream while preserving Repo Shemi Roamer's original read-only mascot scope.

## Documents

- [`ORCHESTRATOR_REVENUE_AND_MARKET_RISK.md`](./ORCHESTRATOR_REVENUE_AND_MARKET_RISK.md) — validated architecture for compliant prospect research, document-to-skill processing, website delivery, payments, treasury separation, and research-only prediction-market analysis.
- [`../../config/miseos/treasury-firewall.policy.json`](../../config/miseos/treasury-firewall.policy.json) — fail-closed machine-readable baseline preventing automatic movement of client revenue into market execution.

## Operating rule

The service-business lane and the market-research lane are separate systems:

```text
client revenue → protected operating treasury
research capital → separately approved simulation or eligible execution
```

External provider fees, platform policies, jurisdiction rules, contract addresses, SDKs, and network support are mutable facts. Revalidate them against authoritative current sources before release or deployment.
