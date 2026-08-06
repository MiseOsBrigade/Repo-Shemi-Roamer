from __future__ import annotations
import hashlib
from pathlib import Path

def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()

def sha256_text(value: str) -> str:
    return sha256_bytes(value.encode("utf-8"))

def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()

def write_sums(root: Path, paths: list[Path]) -> Path:
    output = root / "sha256sums.txt"
    output.write_text("".join(f"{sha256_file(path)}  {path.name}\n" for path in sorted(paths)), encoding="utf-8")
    return output

def verify_sums(root: Path) -> list[str]:
    failures: list[str] = []
    for line in (root / "sha256sums.txt").read_text(encoding="utf-8").splitlines():
        expected, name = line.split("  ", 1)
        path = root / name
        if not path.exists() or sha256_file(path) != expected:
            failures.append(name)
    return failures
