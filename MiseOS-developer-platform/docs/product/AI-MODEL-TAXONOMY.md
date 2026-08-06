# AI Model and System Taxonomy

This taxonomy prevents architecture discussions from mixing capability claims, business behavior, training methods, and model architecture.

## 1. Capability level

| Level | Meaning | Product treatment |
|---|---|---|
| ANI | Task-bounded artificial intelligence | Current production scope |
| AGI | Human-level general competence across domains | Theoretical; do not claim |
| ASI | Intelligence exceeding humans across essentially all domains | Hypothetical; do not claim |

## 2. Functional depth

| Type | Meaning | Status |
|---|---|---|
| Reactive | Responds only to current input | Production pattern |
| Limited-memory | Uses bounded context, stored state, or retrieved history | Production pattern |
| Theory-of-mind | Reliably models beliefs, intent, and social state | Research goal; avoid product claims |
| Self-aware | Possesses consciousness or subjective selfhood | Conceptual; prohibited marketing claim |

## 3. Business behavior

- **Predictive AI:** estimates future values or classes.
- **Generative AI:** produces text, code, images, audio, video, or structured data.
- **Causal AI:** estimates intervention effects and explains causal relationships under explicit assumptions.
- **Agentic AI:** plans and executes multi-step actions through tools within a bounded authority model.
- **Multimodal AI:** processes more than one modality, such as text and images.
- **Neurosymbolic AI:** combines learned models with rules, constraints, knowledge graphs, or formal reasoning.

## 4. Learning method

- Supervised learning
- Unsupervised learning
- Self-supervised learning
- Semi-supervised learning
- Reinforcement learning
- Preference optimization and human-feedback methods

## 5. Technical architecture

- Transformers and language models
- Small language models (SLMs)
- Vision-language and other multimodal models
- Mixture-of-experts models
- Convolutional neural networks
- Diffusion models
- Generative adversarial networks
- Embedding and reranking models
- Graph neural networks
- Reinforcement-learning policies
- Hybrid reasoning systems

## 6. MiseOS runtime roles

MiseOS should describe models by operational role rather than prestige:

| Role | Responsibility |
|---|---|
| Router | Selects a model or deterministic handler |
| Generator | Produces a candidate artifact |
| Reasoner | Decomposes or evaluates a difficult task |
| Retriever | Finds relevant project context |
| Classifier | Assigns labels, risk, or routing decisions |
| Embedding model | Produces vectors for semantic search |
| Reranker | Reorders retrieved candidates |
| Vision model | Interprets screenshots, diagrams, or media |
| Speech model | Transcribes or synthesizes audio |
| Safety model | Detects policy, secret, or abuse risks |
| Evaluator | Scores quality against explicit criteria |
| Deterministic gate | Enforces schemas, policies, tests, or approvals |

No model receives authority merely because it is more capable. Authority is granted by policy, scoped credentials, and proof gates.
