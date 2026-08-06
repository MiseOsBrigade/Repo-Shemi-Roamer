from __future__ import annotations
import re
from collections import Counter
from .models import Evidence

def canonical_key(item: Evidence) -> str:
    if item.doi: return "doi:"+item.doi.lower().removeprefix("https://doi.org/")
    return re.sub(r"[^a-z0-9]+"," ",item.title.lower()).strip()

def deduplicate(items: list[Evidence]) -> list[Evidence]:
    groups: dict[str,list[Evidence]]={}
    for item in items: groups.setdefault(canonical_key(item),[]).append(item)
    output=[]
    for group in groups.values():
        group.sort(key=lambda x:(x.authority,x.citation_count or 0),reverse=True)
        best=group[0]; best.corroboration=min(1.0,(len({x.provider for x in group})-1)/3)
        best.metadata["corroborating_providers"]=sorted({x.provider for x in group})
        output.append(best)
    return sorted(output,key=lambda x:x.confidence,reverse=True)

def synthesize(items: list[Evidence]) -> dict:
    providers=Counter(x.provider for x in items)
    return {"evidence_count":len(items),"providers":dict(providers),"average_confidence":round(sum(x.confidence for x in items)/max(1,len(items)),3),"high_confidence_count":sum(x.confidence>=.75 for x in items),"items":[x.to_dict() for x in items]}
