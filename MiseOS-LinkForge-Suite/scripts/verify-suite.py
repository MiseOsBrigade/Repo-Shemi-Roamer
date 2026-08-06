from pathlib import Path
import hashlib,json,tomllib,zipfile,yaml
root=Path(__file__).resolve().parents[1]
for p in root.rglob("*.json"): json.loads(p.read_text(encoding="utf-8"))
for p in [*root.rglob("*.yml"),*root.rglob("*.yaml")]: list(yaml.safe_load_all(p.read_text(encoding="utf-8")))
for p in root.rglob("*.toml"):
 with p.open("rb") as f: tomllib.load(f)
print("JSON, YAML, and TOML parsed successfully")
