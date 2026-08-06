from __future__ import annotations
import argparse
import json
from pathlib import Path
from .hashing import verify_sums
from .pipeline import capture

def parser() -> argparse.ArgumentParser:
    p=argparse.ArgumentParser(prog="linkforge",description="Capture sources into verified research packets")
    sub=p.add_subparsers(dest="command",required=True)
    c=sub.add_parser("capture"); c.add_argument("source"); c.add_argument("--output",type=Path,required=True); c.add_argument("--provider",choices=["auto","openai","extractive"],default="auto")
    v=sub.add_parser("verify"); v.add_argument("packet",type=Path)
    return p

def main() -> int:
    args=parser().parse_args()
    if args.command=="capture":
        print(json.dumps(capture(args.source,args.output,provider=args.provider),indent=2)); return 0
    failures=verify_sums(args.packet)
    print(json.dumps({"ok":not failures,"failures":failures},indent=2)); return 1 if failures else 0

if __name__=="__main__": raise SystemExit(main())
