import path from "node:path";

export const DEFAULT_IGNORED_NAMES = new Set([
  ".git",
  "node_modules",
  ".next",
  ".turbo",
  ".cache",
  "dist",
  "build",
  "coverage",
  "__pycache__",
  ".venv",
  "venv",
  "proc",
  "sys",
  "dev",
  "run",
  "tmp"
]);

export const DEFAULT_IGNORED_PATHS = new Set([
  "var/lib",
  "var/cache",
  "var/log"
]);

export const SAFE_HIDDEN_NAMES = new Set([
  ".github",
  ".devcontainer",
  ".changeset"
]);

export const SECRETISH_RE =
  /(^\.env(?:\.|$)|secret|token|credential|private[_-]?key|id_rsa|id_dsa|\.pem$|\.p12$|\.key$|kubeconfig|password|passwd|auth\.json)/i;

export const CODE_EXTENSIONS = new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".jsx",
  ".py",
  ".go",
  ".rs",
  ".java",
  ".cs",
  ".php",
  ".rb",
  ".md",
  ".mdx",
  ".txt",
  ".json",
  ".yaml",
  ".yml",
  ".toml",
  ".html",
  ".css"
]);

export function truncate(value, max = 90) {
  const text = String(value);
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1))}…`;
}

export function isHiddenName(name) {
  return name.startsWith(".");
}

export function isAllowedHiddenName(name) {
  return SAFE_HIDDEN_NAMES.has(name);
}

export function isIgnoredEntry(absPath, name, root = path.parse(absPath).root) {
  if (DEFAULT_IGNORED_NAMES.has(name)) return true;

  const relative = path.relative(root, absPath).split(path.sep).join("/");
  return [...DEFAULT_IGNORED_PATHS].some(
    ignored => relative === ignored || relative.startsWith(`${ignored}/`)
  );
}

export function isSecretish(nameOrPath) {
  return String(nameOrPath)
    .split(/[\\/]/)
    .some(segment => SECRETISH_RE.test(segment));
}

export function relativeDepth(root, target) {
  const relative = path.relative(root, target);
  if (!relative || relative === ".") return 0;
  return relative.split(path.sep).filter(Boolean).length;
}

export function maskPath(target, root) {
  const relative = path.relative(root, target);
  if (!relative || relative === ".") return ".";

  return relative
    .split(path.sep)
    .filter(Boolean)
    .map(segment => (SECRETISH_RE.test(segment) ? "[redacted]" : segment))
    .join("/");
}
