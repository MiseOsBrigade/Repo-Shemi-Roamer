from pathlib import Path
import json
import yaml
root=Path(__file__).resolve().parents[1]
for path in root.rglob("*.yml"):
    yaml.safe_load(path.read_text(encoding="utf-8"))
for path in root.rglob("*.json"):
    json.loads(path.read_text(encoding="utf-8"))
print("validated workflow YAML and JSON")
