const roster = [
  {
    id: "orchestra-core",
    number: 1,
    name: "Orchestra Core",
    sprite: "🍜",
    kitchenRole: "Chef Spirit",
    role: "Chef Spirit",
    responsibility: "Meta-orchestration and kitchen consciousness",
    preferredPaths: ["."],
    preferredFiles: ["package.json", "README.md", ".github"],
    actions: ["observe", "route", "coordinate", "report"]
  },
  {
    id: "kurogami-senpai",
    number: 2,
    name: "Kurogami Senpai",
    sprite: "🥄",
    kitchenRole: "Chef de Cuisine",
    role: "Chef de Cuisine",
    responsibility: "Orchestrates plans, release gates, and cross-agent handoffs.",
    preferredPaths: ["src", "bin", ".github", "docs"],
    preferredFiles: ["README.md", "package.json", "CHANGELOG.md"],
    image: "docs/miseverse/assets/miseverse-grid-world.webp",
    station: "orchestration-core",
    district: "Grid Orchestration Layer",
    color: "#D6A23A",
    position: { x: 50, y: 25 },
    actions: ["plan", "orchestrate", "deploy", "release"]
  },
  {
    id: "seira",
    number: 3,
    name: "Seira",
    sprite: "🍷",
    kitchenRole: "Sommelier",
    role: "Sommelier",
    responsibility: "Curates release quality, provenance, package notes, and compatibility signals.",
    preferredPaths: ["config", "infra", "auth", "security", "release", "docs"],
    preferredFiles: [".env.example", "policy", "security", "CHANGELOG.md"],
    image: "docs/miseverse/assets/miseverse-grid-world.webp",
    station: "release-lounge",
    district: "Release Lounge",
    color: "#A855F7",
    position: { x: 72, y: 50 },
    actions: ["curate", "package", "release", "celebrate"]
  },
  {
    id: "build-kun",
    number: 4,
    name: "Build-Kun",
    sprite: "🥐",
    kitchenRole: "Boulanger",
    role: "Boulanger",
    responsibility: "Builds repeatable packages, containers, static previews, and deployment artifacts.",
    preferredPaths: ["docker", "build", "dist", "bin", "scripts"],
    preferredFiles: ["Dockerfile", "package.json"],
    image: "docs/miseverse/assets/miseverse-grid-world.webp",
    station: "build-workshop",
    district: "Build Workshop",
    color: "#F2C94C",
    position: { x: 88, y: 70 },
    actions: ["build", "package", "containerize", "deploy"]
  },
  {
    id: "kuro-guard",
    number: 5,
    name: "Kuro Guard",
    sprite: "🛡️",
    kitchenRole: "Steward",
    role: "Steward",
    responsibility: "Monitors repository health, protects policy boundaries, and records audit outcomes.",
    preferredPaths: [".github", "config", "security", "policies"],
    preferredFiles: ["SECURITY.md", "policy", "CODEOWNERS"],
    image: "docs/miseverse/assets/miseverse-grid-world.webp",
    station: "security-gateway",
    district: "Security Gateway",
    color: "#38A169",
    position: { x: 16, y: 58 },
    actions: ["monitor", "protect", "audit", "attest"]
  },
  {
    id: "iron-hashi",
    number: 6,
    name: "Iron Hashi",
    sprite: "🔪",
    kitchenRole: "Boucher",
    role: "Boucher",
    responsibility: "Performs precise validation, checksum review, and deterministic test cuts.",
    preferredPaths: ["test", "tests", "validation", "schemas"],
    preferredFiles: ["package-lock.json", "checksum", "schema"],
    image: "docs/miseverse/assets/miseverse-grid-world.webp",
    station: "validation-forge",
    district: "Validation Forge",
    color: "#E97B22",
    position: { x: 35, y: 58 },
    actions: ["validate", "checksum", "test", "confirm"]
  },
  {
    id: "scale-oni",
    number: 7,
    name: "Scale Oni",
    sprite: "🔥",
    kitchenRole: "Rôtisseur",
    role: "Rôtisseur",
    responsibility: "Stress-tests throughput, optimizes hot paths, and controls performance thresholds.",
    preferredPaths: ["performance", "bench", "build", "dist"],
    preferredFiles: ["benchmark", "profile", "package.json"],
    image: "docs/miseverse/assets/miseverse-grid-world.webp",
    station: "optimization-forge",
    district: "Optimization Forge",
    color: "#F97316",
    position: { x: 52, y: 69 },
    actions: ["profile", "optimize", "scale", "benchmark"]
  },
  {
    id: "streama",
    number: 8,
    name: "Streama",
    sprite: "🌊",
    kitchenRole: "Data Stream Chef",
    role: "Data Stream Chef",
    responsibility: "Normalizes event streams, telemetry, JSONL output, and observability records.",
    preferredPaths: ["data", "events", "logs", "telemetry"],
    preferredFiles: ["jsonl", "metrics", "events"],
    image: "docs/miseverse/assets/miseverse-grid-world.webp",
    station: "data-streams",
    district: "Data Streams",
    color: "#1E9BB8",
    position: { x: 18, y: 22 },
    actions: ["ingest", "normalize", "stream", "observe"]
  },
  {
    id: "umami-code",
    number: 9,
    name: "Umami Code",
    sprite: "🥣",
    kitchenRole: "Saucier",
    role: "Saucier",
    responsibility: "Composes reusable code, refines interfaces, and binds workflows into cohesive services.",
    preferredPaths: ["src", "packages", "components", "api"],
    preferredFiles: ["index.js", "package.json", "README.md"],
    image: "docs/miseverse/assets/miseverse-grid-world.webp",
    station: "studio",
    district: "Studio",
    color: "#F6E7C3",
    position: { x: 82, y: 22 },
    actions: ["compose", "refactor", "integrate", "document"]
  }
];

function freezeCharacter(character) {
  return Object.freeze({
    ...character,
    preferredPaths: Object.freeze([...(character.preferredPaths ?? [])]),
    preferredFiles: Object.freeze([...(character.preferredFiles ?? [])]),
    actions: Object.freeze([...(character.actions ?? [])]),
    ...(character.position ? { position: Object.freeze({ ...character.position }) } : {})
  });
}

export const CHARACTERS = Object.freeze(roster.map(freezeCharacter));

export function listCharacters() {
  return [...CHARACTERS].sort((a, b) => a.number - b.number);
}

export function findCharacter(id = "orchestra-core") {
  return CHARACTERS.find(character => character.id === id) ?? CHARACTERS[0];
}
