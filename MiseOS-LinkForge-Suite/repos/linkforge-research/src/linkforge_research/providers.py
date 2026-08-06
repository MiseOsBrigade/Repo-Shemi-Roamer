from __future__ import annotations
import csv
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Protocol
import httpx
from .models import Evidence

class Provider(Protocol):
    name: str
    def search(self, query: str, limit: int=8) -> list[Evidence]: ...

class OpenAlexProvider:
    name="openalex"
    def search(self, query: str, limit: int=8) -> list[Evidence]:
        params={"search":query,"per-page":min(limit,25),"select":"id,doi,title,display_name,publication_year,publication_date,authorships,cited_by_count,primary_location,abstract_inverted_index,type"}
        headers={}
        if os.getenv("OPENALEX_API_KEY"): params["api_key"]=os.environ["OPENALEX_API_KEY"]
        response=httpx.get("https://api.openalex.org/works",params=params,headers=headers,timeout=25); response.raise_for_status()
        out=[]
        for item in response.json().get("results",[]):
            inv=item.get("abstract_inverted_index") or {}; words=sorted(((pos,word) for word,poses in inv.items() for pos in poses)); abstract=" ".join(word for _,word in words) or None
            authors=[a.get("author",{}).get("display_name") for a in item.get("authorships",[]) if a.get("author",{}).get("display_name")]
            url=((item.get("primary_location") or {}).get("landing_page_url") or item.get("doi") or item.get("id"))
            out.append(Evidence(item.get("display_name") or item.get("title") or "Untitled",url,self.name,item.get("publication_date"),authors,abstract,item.get("doi"),item.get("cited_by_count"),"academic",0.88,0.7,0.72,metadata={"type":item.get("type")}))
        return out

class CrossrefProvider:
    name="crossref"
    def search(self, query: str, limit: int=8) -> list[Evidence]:
        headers={"User-Agent":f"MiseOS-LinkForge/1.0 (mailto:{os.getenv('LINKFORGE_CONTACT_EMAIL','research@example.invalid')})"}
        response=httpx.get("https://api.crossref.org/works",params={"query.bibliographic":query,"rows":min(limit,20),"select":"DOI,title,author,published,URL,abstract,is-referenced-by-count,type"},headers=headers,timeout=25); response.raise_for_status()
        out=[]
        for item in response.json().get("message",{}).get("items",[]):
            dates=((item.get("published") or {}).get("date-parts") or [[]])[0]; published="-".join(str(x) for x in dates) if dates else None
            authors=[" ".join(filter(None,[a.get("given"),a.get("family")])) for a in item.get("author",[])]
            title=(item.get("title") or ["Untitled"])[0]
            out.append(Evidence(title,item.get("URL") or f"https://doi.org/{item.get('DOI')}",self.name,published,authors,item.get("abstract"),item.get("DOI"),item.get("is-referenced-by-count"),"academic",0.9,0.68,0.7,metadata={"type":item.get("type")}))
        return out

class SemanticScholarProvider:
    name="semantic-scholar"
    def search(self, query: str, limit: int=8) -> list[Evidence]:
        headers={}; key=os.getenv("SEMANTIC_SCHOLAR_API_KEY")
        if key: headers["x-api-key"]=key
        params={"query":query,"limit":min(limit,20),"fields":"title,url,year,authors,abstract,citationCount,externalIds,publicationDate,venue"}
        response=httpx.get("https://api.semanticscholar.org/graph/v1/paper/search",params=params,headers=headers,timeout=25); response.raise_for_status()
        out=[]
        for item in response.json().get("data",[]):
            doi=(item.get("externalIds") or {}).get("DOI")
            out.append(Evidence(item.get("title") or "Untitled",item.get("url") or (f"https://doi.org/{doi}" if doi else ""),self.name,item.get("publicationDate") or str(item.get("year") or ""),[a.get("name") for a in item.get("authors",[]) if a.get("name")],item.get("abstract"),doi,item.get("citationCount"),"academic",0.86,0.68,0.7,metadata={"venue":item.get("venue")}))
        return out

class OpenAIWebSearchProvider:
    name="openai-web-search"
    def search(self, query: str, limit: int=8) -> list[Evidence]:
        from openai import OpenAI
        response=OpenAI().responses.create(model=os.getenv("OPENAI_MODEL","gpt-5.6"),tools=[{"type":"web_search"}],input=f"Find up to {limit} authoritative, current sources for: {query}. Return a concise evidence map with citations.",store=False)
        citations=[]
        for item in response.output:
            for content in getattr(item,"content",[]) or []:
                for annotation in getattr(content,"annotations",[]) or []:
                    url=getattr(annotation,"url",None); title=getattr(annotation,"title",None)
                    if url and title: citations.append(Evidence(title,url,self.name,source_type="web",authority=.76,freshness=.9,directness=.68,metadata={"generated_overview":response.output_text}))
        unique={x.url:x for x in citations}
        return list(unique.values())[:limit]

LICENSED_NAMES={"statista","pitchbook","cb-insights","wiley","quartr","custom"}
def import_authorized_export(path: Path, provider: str, license_note: str) -> list[Evidence]:
    if provider not in LICENSED_NAMES: raise ValueError(f"Unsupported licensed provider: {provider}")
    digest=hashlib.sha256(path.read_bytes()).hexdigest(); rows=[]
    if path.suffix.lower()==".json":
        value=json.loads(path.read_text(encoding="utf-8")); rows=value if isinstance(value,list) else value.get("records",[])
    else:
        with path.open(newline="",encoding="utf-8-sig") as handle: rows=list(csv.DictReader(handle))
    out=[]
    for row in rows:
        title=str(row.get("title") or row.get("name") or row.get("company") or "Licensed record")
        url=str(row.get("url") or row.get("source_url") or "")
        out.append(Evidence(title,url,provider,str(row.get("published_at") or row.get("date") or "") or None,abstract=str(row.get("summary") or row.get("description") or "") or None,source_type="licensed-market-intelligence",authority=.84,freshness=.72,directness=.76,metadata={"license_note":license_note,"export_sha256":digest,"imported_at":datetime.now(timezone.utc).isoformat(),"record":row}))
    return out
