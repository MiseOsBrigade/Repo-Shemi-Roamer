from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any

@dataclass(slots=True)
class SourceDocument:
    source: str
    normalized_source: str
    title: str
    text: str
    extractor: str
    retrieved_at: str
    canonical_url: str | None = None
    author: str | None = None
    published_at: str | None = None
    description: str | None = None
    headings: list[str] = field(default_factory=list)
    media: list[dict[str, Any]] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    injection_signals: list[str] = field(default_factory=list)
    raw_metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

@dataclass(slots=True)
class SummarySection:
    heading: str
    details: str

@dataclass(slots=True)
class SourceSummary:
    executive_summary: str
    key_points: list[str]
    sections: list[SummarySection]
    actions: list[str]
    risks: list[str]
    verification_questions: list[str]
    method: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
