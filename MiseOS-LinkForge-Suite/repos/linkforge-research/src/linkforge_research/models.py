from __future__ import annotations
from dataclasses import asdict, dataclass, field
from typing import Any

@dataclass(slots=True)
class Evidence:
    title: str
    url: str
    provider: str
    published_at: str | None = None
    authors: list[str] = field(default_factory=list)
    abstract: str | None = None
    doi: str | None = None
    citation_count: int | None = None
    source_type: str = "secondary"
    authority: float = 0.5
    freshness: float = 0.5
    directness: float = 0.5
    corroboration: float = 0.0
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def confidence(self) -> float:
        return round(0.35*self.authority+0.25*self.freshness+0.25*self.directness+0.15*self.corroboration,3)
    def to_dict(self):
        return {**asdict(self),"confidence":self.confidence}
