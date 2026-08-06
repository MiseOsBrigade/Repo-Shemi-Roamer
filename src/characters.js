const CHARACTERS = Object.freeze([
  Object.freeze({
    id: "orchestra-core",
    number: 1,
    name: "Orchestra Core",
    sprite: "🍜",
    kitchenRole: "Chef Spirit",
    responsibility: "Meta-orchestration and kitchen consciousness",
    preferredPaths: ["."],
    preferredFiles: ["package.json", "README.md", ".github"]
  }),
  Object.freeze({
    id: "kurogami-senpai",
    number: 2,
    name: "Kurogami Senpai",
    sprite: "🥢",
    kitchenRole: "Chef de Cuisine",
    responsibility: "System orchestration and repository direction",
    preferredPaths: ["src", "bin", ".github"],
    preferredFiles: ["README.md", "package.json"]
  }),
  Object.freeze({
    id: "seira",
    number: 3,
    name: "Seira",
    sprite: "🧂",
    kitchenRole: "Sommelier",
    responsibility: "Secrets, vault safety, and sensitive ingredients",
    preferredPaths: ["config", "infra", "auth", "security"],
    preferredFiles: [".env.example", "policy", "security"]
  }),
  Object.freeze({
    id: "build-kun",
    number: 4,
    name: "Build-Kun",
    sprite: "🏗️",
    kitchenRole: "Boulanger",
    responsibility: "Build recipes, containers, and generated assets",
    preferredPaths: ["docker", "build", "dist", "bin"],
    preferredFiles: ["Dockerfile", "package.json"]
  })
]);

export function listCharacters() {
  return [...CHARACTERS].sort((a, b) => a.number - b.number);
}

export function findCharacter(id = "orchestra-core") {
  return CHARACTERS.find(character => character.id === id) ?? CHARACTERS[0];
}
