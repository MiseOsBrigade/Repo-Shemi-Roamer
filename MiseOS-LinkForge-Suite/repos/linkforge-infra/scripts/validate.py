from pathlib import Path
import json
import yaml
root=Path(__file__).resolve().parents[1]
for p in root.rglob("*.json"): json.loads(p.read_text())
for p in [*root.rglob("*.yml"),*root.rglob("*.yaml")]: list(yaml.safe_load_all(p.read_text()))
print("validated infrastructure JSON/YAML")
