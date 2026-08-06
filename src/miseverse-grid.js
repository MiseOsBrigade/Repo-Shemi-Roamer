import { CHARACTERS } from "./characters.js";

export const DISTRICTS = Object.freeze([
  Object.freeze({ id: "data-streams", name: "Data Streams", layer: "evidence" }),
  Object.freeze({ id: "orchestration-core", name: "Grid Orchestration Layer", layer: "work" }),
  Object.freeze({ id: "studio", name: "Studio", layer: "memory" }),
  Object.freeze({ id: "security-gateway", name: "Security Gateway", layer: "governance" }),
  Object.freeze({ id: "validation-forge", name: "Validation Forge", layer: "evidence" }),
  Object.freeze({ id: "optimization-forge", name: "Optimization Forge", layer: "work" }),
  Object.freeze({ id: "release-lounge", name: "Release Lounge", layer: "time" }),
  Object.freeze({ id: "build-workshop", name: "Build Workshop", layer: "work" })
]);

export function visualCharacters() {
  return CHARACTERS.filter(character => Boolean(character.image));
}

export function buildWorldSnapshot({ generatedAt = new Date(0).toISOString() } = {}) {
  return {
    schemaVersion: "1.0.0",
    generatedAt,
    world: "Miseverse Grid Ecosystem",
    rule: "The grid owns state; characters project bounded, allowlisted operator roles.",
    districts: DISTRICTS,
    characters: visualCharacters().map(character => ({
      id: character.id,
      name: character.name,
      role: character.role,
      responsibility: character.responsibility,
      sprite: character.sprite,
      image: character.image.replace(/^docs\/miseverse\//, ""),
      station: character.station,
      district: character.district,
      color: character.color,
      position: character.position,
      actions: character.actions
    }))
  };
}

export function buildCharacterReplay() {
  return visualCharacters().flatMap((character, characterIndex) =>
    character.actions.map((action, actionIndex) => ({
      sequence: characterIndex * 10 + actionIndex + 1,
      characterId: character.id,
      station: character.station,
      action,
      status: "allowlisted",
      requestedBy: "demo",
      authorized: false,
      note: "Visual replay only. Execution requires explicit authorization."
    }))
  );
}
