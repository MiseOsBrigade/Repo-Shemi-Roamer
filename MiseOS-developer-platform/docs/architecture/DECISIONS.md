# Architecture Decision Record Index

## ADR-001 — Registry manifests are the canonical capability contract

**Status:** accepted.

Capabilities are discoverable and versioned through JSON manifests. Runtime code must map manifest handler names to explicit implementations.

## ADR-002 — No arbitrary shell execution in the core runtime

**Status:** accepted.

The core runtime invokes allowlisted handlers. Shell and external-process adapters, when introduced, require explicit policy and isolated execution.

## ADR-003 — Layer 2 agent utility is the product core

**Status:** accepted.

Character IP and marketplace participation are supported surfaces. Governed, measurable agent utility remains the central technical layer.

## ADR-004 — Billing and model providers are adapters

**Status:** accepted.

The catalog and runtime remain provider-neutral. Billing, model, storage, GitHub, and signing integrations sit behind interfaces.

## ADR-005 — Evidence is distinct from confidence

**Status:** accepted.

A model assertion is not proof. Tests, schemas, signatures, policy checks, and observed tool output form the evidence layer.
