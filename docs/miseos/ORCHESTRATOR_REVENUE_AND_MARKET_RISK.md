# MiseOS Orchestrator Revenue and Market-Risk Architecture

> Status: architecture and risk specification  
> Source snapshot: August 2, 2026  
> Added to repository: August 6, 2026  
> Execution posture: service-business components may proceed after compliance review; prediction-market components remain research-only unless jurisdiction and platform eligibility are independently confirmed.

## Executive decision

The heterogeneous agent-orchestration concept is technically useful, but the original operating model mixed a defensible service business with a materially higher-risk market-trading system.

MiseOS therefore separates the design into two capital and permission domains:

```text
MiseOS Revenue Engine
├── compliant prospect discovery
├── website and workflow generation
├── human originality and QA review
├── client approval
├── hardened production deployment
├── invoicing and payment collection
└── protected operating treasury

MiseOS Research Lab
├── public market-data ingestion
├── strategy simulation
├── backtesting
├── paper trading
├── jurisdiction and platform-policy checks
├── independent risk approval
└── separately allocated experimental capital
```

Client payments must never flow automatically into trading contracts. Operating funds, taxes, refunds, payroll, infrastructure, and experimental capital require separate ledgers and approval paths.

---

## 1. Heterogeneous task decomposition

The orchestrator may use parallel specialist pools, but agent counts are capacity settings rather than guarantees of accuracy.

### Pool A — compliant business research

**Purpose:** identify businesses that may benefit from modern web, booking, accessibility, or automation infrastructure.

Approved source classes include:

- official and licensed business-data APIs;
- municipal and state business registries;
- chamber-of-commerce directories where reuse is permitted;
- public business websites;
- user-supplied lead lists;
- manually verified records.

Every lead record should carry:

```json
{
  "source": "provider-or-registry",
  "retrieved_at": "ISO-8601 timestamp",
  "permitted_use": "documented basis",
  "verification_status": "unverified|verified|rejected",
  "confidence": 0.0,
  "deletion_policy": "retention rule"
}
```

Do not scrape or bulk-republish a platform's protected directory when its terms prohibit automated extraction or independent database construction.

### Pool B — document-to-skill parsing

**Purpose:** convert authorized contracts, scripts, catalogs, policies, and operating documents into bounded runtime context.

Required controls:

1. Confirm the operator is authorized to process each document.
2. Classify sensitive data before ingestion.
3. Remove secrets, credentials, payment details, and unnecessary personal data.
4. Record source provenance and document version.
5. Scope generated skills to the current tenant and task.
6. Set expiration and deletion rules for temporary skills.
7. Prevent temporary skills from modifying the base model or leaking into another tenant.

A temporary skill is a task-scoped retrieval and instruction package. It is not model retraining.

### Pool C — multi-format delivery

**Purpose:** generate original, reviewable implementation assets such as:

- Next.js applications;
- Tailwind CSS component systems;
- booking and intake forms;
- structured service catalogs;
- deployment configuration;
- accessibility and performance reports;
- client-facing copy and onboarding material.

No generated asset ships without deterministic checks and human acceptance.

Minimum gates:

```text
lint → typecheck → unit tests → security scan → accessibility scan
     → visual review → content review → client approval → deployment
```

---

## 2. Vision-assisted interface analysis

MoonViT-SO-400M is a native-resolution vision encoder associated with Moonshot AI's multimodal model stack. Its existence supports a vision-assisted design-analysis workflow, but it does not establish that every orchestrated sub-agent automatically uses that encoder.

Permitted use:

- identify abstract hierarchy and navigation patterns;
- detect accessibility and responsive-layout problems;
- infer common interaction conventions;
- compare information density and user journeys;
- create an original design brief.

Prohibited use:

- pixel-for-pixel copying;
- copying protected text, images, illustrations, logos, or trade dress;
- impersonating a competitor;
- cloning a site's distinctive implementation or deceptive interaction patterns.

Use this production wording:

> Vision-capable agents extract abstract layout patterns, information hierarchy, accessibility characteristics, and interaction conventions. Generated sites use original branding, copy, imagery, and component implementations rather than reproducing a competitor's protected expression.

---

## 3. Outreach and commercial compliance

Cold outreach is a regulated operating function, not a consequence-free agent task.

The outreach service must support:

- accurate sender identity;
- non-deceptive subject lines;
- a valid physical postal address;
- a clear opt-out path;
- a durable suppression list;
- timely processing of unsubscribe requests;
- campaign-level source and consent records;
- rate limits and human approval for initial campaigns.

Do not claim unusually high conversion rates merely because an unsolicited prototype was created in advance. Track actual funnel metrics:

```text
qualified leads
→ verified contacts
→ messages delivered
→ positive replies
→ discovery calls
→ proposals accepted
→ payments collected
→ retained clients
```

---

## 4. Payment architecture

### Production deployment boundary

- `ngrok` is suitable for local webhook development and controlled testing.
- Vite is a development and build tool, not a production payment host.
- Production payment flows require TLS, secure secret storage, verified webhook signatures, idempotency, durable event logs, retry handling, and least-privilege service credentials.

### Provider snapshot

The following comparison is a dated research snapshot and must be revalidated before implementation.

| Parameter | Stripe stablecoin payments | Coinbase Business |
|---|---|---|
| Published fee model | Stripe's US pricing snapshot listed 1.5% of USD transaction value | Account-specific; current fees should be confirmed in the merchant account |
| Merchant settlement | USD in the Stripe balance | USDC by default, with optional USD conversion depending on account capability |
| Custody posture | Stripe-managed payment and fiat settlement | Custodial Coinbase Business account |
| Integration surfaces | Checkout, Elements, Payment Links, Payment Intents | Payment links, invoices, and Coinbase Business payment tooling |
| Verification | Business eligibility and compliance review required | Business eligibility and compliance review required |

The former Coinbase Commerce workflow should not be described as a universal self-custodied, no-KYB, flat-1% path. Coinbase directed Commerce users to migrate to Coinbase Business by March 31, 2026.

### Webhook requirements

```text
receive raw request body
→ verify provider signature
→ reject stale or malformed events
→ acquire idempotency lock
→ persist event
→ process state transition
→ acknowledge
→ retry asynchronously on transient failure
```

Payment success must never be inferred from a browser redirect alone.

---

## 5. Treasury firewall

Client revenue is operating capital first.

Required accounts or ledger buckets:

- operating reserve;
- tax reserve;
- client-refund reserve;
- payroll and contractor obligations;
- infrastructure reserve;
- owner distribution;
- separately approved research capital.

Forbidden transitions:

```text
client payment → automatic market order
refund reserve → trading wallet
payroll reserve → experimental contract
unverified webhook → treasury allocation
```

Every experimental allocation requires:

1. eligibility and jurisdiction result;
2. platform-terms check;
3. written risk classification;
4. maximum-loss amount;
5. human approval;
6. isolated wallet or account;
7. immutable audit record;
8. kill-switch availability.

See `config/miseos/treasury-firewall.policy.json` for a machine-readable policy baseline.

---

## 6. Prediction-market research boundary

### Jurisdiction gate

The prior operating scenario referenced a San Francisco operator. The cited Polymarket documentation listed the United States as blocked from placing orders and provided a geoblock check for builders.

MiseOS must fail closed:

```ts
if (jurisdiction.isBlocked({ platform: "polymarket", user, location })) {
  disableOrderPlacement();
  permitPublicMarketResearchOnly();
}
```

Do not use a VPN, proxy, offshore server, remote agent, or delegated wallet to bypass a geographic restriction.

### Contract-address correction

The earlier design treated this address as the merge target:

```text
0xE111180000d2663C0091e4f400237545B87B996B
```

That address was identified in the source snapshot as the CTF Exchange, not the Conditional Tokens contract exposing the underlying merge operation.

Source-snapshot addresses were:

```text
CTF Exchange
0xE111180000d2663C0091e4f400237545B87B996B

Conditional Tokens
0x4D97DCd97eC945f40cF65F87097ACe5EA0476045

pUSD
0xC011a7E12a19f7B1f670d46F03B03f3342E82DFB

CTF Collateral Adapter
0xADa100874d00e3331D00F2007a9c336a65009718
```

Addresses, ABIs, collateral assets, SDK versions, and adapter flows are mutable external dependencies. Revalidate all of them against official documentation immediately before any authorized integration.

### Spread arithmetic versus realized return

For five complete outcome sets purchased at 0.49 on both sides:

```text
5 × (0.49 + 0.49) = 4.90 gross cost
5 × 1.00 = 5.00 gross collateral value
5.00 - 4.90 = 0.10 theoretical gross spread
0.10 / 4.90 = 2.0408% theoretical gross return
```

This is not a guaranteed or risk-free return.

It is only realized when all required assumptions hold, including complete fills, valid matching positions, available collateral conversion, successful contract execution, and no disqualifying fees, policy blocks, latency, or failure.

Material risks include:

- only one side filling;
- adverse movement before hedge or cancellation;
- stale orders;
- fill-notification latency;
- tick-size and minimum-order constraints;
- insufficient inventory or collateral;
- API, relayer, RPC, custody, collateral, or smart-contract failure;
- incorrect market or condition identifiers;
- fee and maker-incentive changes;
- jurisdiction and platform-policy changes.

Required market-maker controls include inventory skewing, stale-quote cancellation, exposure limits, price guards, fill reconciliation, circuit breakers, and an emergency kill switch.

### Maker incentives

Maker rebates are variable incentives, not guaranteed yield. They depend on platform rules, eligible executed liquidity, payout thresholds, and the applicable fee pool. Treat rebate income as zero in base-case risk models.

---

## 7. Wallet-analysis classification

Historical wallet ranking is a research signal, not arbitrage.

A copy strategy introduces directional and execution risk because the follower typically receives a later price and does not know the leader's complete portfolio, hedge, intent, or wallet cluster.

Correct classification:

```yaml
research_signal: wallet-performance-ranking
strategy_class: speculative-delayed-follow-execution
risk_classification: directional-non-guaranteed-potentially-correlated
permitted_mode: simulation-or-explicitly-authorized-execution
```

A robust research pipeline must address:

- survivorship and selection bias;
- realized versus unrealized P&L;
- transfers misclassified as trades;
- linked wallets controlled by one entity;
- copy latency and price divergence;
- hidden hedges and inventory transfers;
- small samples and regime dependence;
- look-ahead leakage;
- transaction costs and failed transactions.

Example analytical function, retained as research-only pseudocode:

```python
import polars as pl


def extract_candidate_wallets(csv_path: str = "processed/trades.csv") -> pl.DataFrame:
    trades = pl.scan_csv(csv_path)

    return (
        trades
        .group_by("maker")
        .agg(
            pl.len().alias("trades"),
            (pl.col("realized_profit") > 0).mean().alias("observed_win_rate"),
            pl.col("realized_profit").sum().alias("observed_realized_pnl"),
        )
        .filter(
            (pl.col("trades") >= 100)
            & (pl.col("observed_win_rate") > 0.70)
        )
        .sort("observed_realized_pnl", descending=True)
        .head(50)
        .collect(streaming=True)
    )
```

The output is a candidate-research table, not an instruction to trade.

---

## 8. Acceptance criteria

The architecture is ready for service-business implementation only when:

- [ ] all lead sources have documented permitted use;
- [ ] sensitive documents are classified and tenant-isolated;
- [ ] generated sites pass tests, accessibility review, originality review, and client approval;
- [ ] outreach includes identity, address, opt-out, suppression, and audit controls;
- [ ] payment webhooks verify signatures and enforce idempotency;
- [ ] production secrets are not stored in source control;
- [ ] treasury buckets and forbidden transitions are enforced;
- [ ] no client revenue is automatically routed to market execution;
- [ ] research modules default to simulation;
- [ ] jurisdiction and platform-policy checks fail closed;
- [ ] market claims avoid the terms `risk-free`, `guaranteed`, and `instant liquidity` unless objectively and legally supportable;
- [ ] all mutable provider, contract, fee, and eligibility facts are revalidated before release.

---

## 9. Source snapshot

These links were used in the prior validation and are retained for traceability. They are external mutable sources, not vendored guarantees.

- Yelp terms: https://terms.yelp.com/tos/en_ca/20260101_en_ca/
- FTC online advertising and marketing guidance: https://www.ftc.gov/business-guidance/advertising-marketing/online-advertising-marketing
- MoonViT-SO-400M model page: https://huggingface.co/moonshotai/MoonViT-SO-400M
- Stripe pricing: https://stripe.com/pricing
- Coinbase Commerce to Coinbase Business transition: https://help.coinbase.com/en/transitioning-from-coinbase-commerce-to-coinbase-business
- Polymarket geoblock reference: https://docs.polymarket.com/api-reference/geoblock
- Polymarket changelog: https://docs.polymarket.com/changelog
- Polymarket merge reference: https://docs.polymarket.com/trading/ctf/merge
- Polymarket market-maker guidance: https://docs.polymarket.com/market-makers/trading
- Polymarket maker rebates: https://docs.polymarket.com/market-makers/maker-rebates

---

## 10. Non-goals

This document does not provide legal, tax, investment, or jurisdictional approval. It does not authorize access to a restricted platform, guarantee provider availability, or represent that any quoted fee, network, address, or policy remains current after the source-snapshot date.
