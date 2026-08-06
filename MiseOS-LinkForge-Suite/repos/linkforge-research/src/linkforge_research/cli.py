from __future__ import annotations
import argparse,json,os
from pathlib import Path
from .engine import deduplicate,synthesize
from .providers import CrossrefProvider,OpenAlexProvider,SemanticScholarProvider,OpenAIWebSearchProvider,import_authorized_export

def main() -> int:
    p=argparse.ArgumentParser(prog="linkforge-research"); sub=p.add_subparsers(dest="cmd",required=True)
    e=sub.add_parser("enrich"); e.add_argument("packet",type=Path); e.add_argument("--query",required=True); e.add_argument("--output",type=Path,required=True); e.add_argument("--providers",default="openalex,crossref,semantic-scholar")
    i=sub.add_parser("import"); i.add_argument("export",type=Path); i.add_argument("--provider",required=True); i.add_argument("--license-note",required=True); i.add_argument("--output",type=Path,required=True)
    args=p.parse_args()
    if args.cmd=="import": items=import_authorized_export(args.export,args.provider,args.license_note)
    else:
        mapping={"openalex":OpenAlexProvider,"crossref":CrossrefProvider,"semantic-scholar":SemanticScholarProvider,"openai-web-search":OpenAIWebSearchProvider}
        items=[]
        for name in args.providers.split(","):
            name=name.strip()
            try: items += mapping[name]().search(args.query)
            except Exception as exc: items.append(__import__('linkforge_research.models',fromlist=['Evidence']).Evidence(f"Provider error: {name}","",name,abstract=str(exc),source_type="diagnostic",authority=0,freshness=0,directness=0))
    result=synthesize(deduplicate(items)); args.output.parent.mkdir(parents=True,exist_ok=True); args.output.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf-8"); print(json.dumps({"output":str(args.output),"evidence":result["evidence_count"]},indent=2)); return 0
if __name__=="__main__": raise SystemExit(main())
