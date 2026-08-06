const detail = document.querySelector("#operator-detail");
const hotspots = document.querySelector("#hotspots");
const roster = document.querySelector("#operator-list");
const workflowList = document.querySelector("#workflow-list");
const simulateButton = document.querySelector("#simulate-button");
const consent = document.querySelector("#consent");
const trustStatus = document.querySelector("#trust-status");
let selected = null;
let simulationToken = 0;
let manifestVerified = false;
let manifestById = new Map();

function decodeBase64(value) {
  return Uint8Array.from(atob(value), character => character.charCodeAt(0));
}

function decodeBase64Url(value) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return decodeBase64(normalized);
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map(value => value.toString(16).padStart(2, "0")).join("");
}

async function loadJson(path) {
  const response = await fetch(path, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Unable to load ${path}: ${response.status}`);
  return response.json();
}

async function verifyManifest(manifest, trust) {
  if (!globalThis.crypto?.subtle) throw new Error("Web Crypto is unavailable");
  const { signature, ...unsigned } = manifest;
  const trustedKey = trust.keys.find(key => key.keyId === signature?.keyId && key.alg === signature?.alg);
  if (!trustedKey || signature?.alg !== "Ed25519") throw new Error("Manifest key is not trusted");
  const key = await crypto.subtle.importKey(
    "raw",
    decodeBase64Url(trustedKey.publicKeyRawBase64Url),
    { name: "Ed25519" },
    false,
    ["verify"]
  );
  const signatureValid = await crypto.subtle.verify(
    { name: "Ed25519" },
    key,
    decodeBase64(signature.value),
    new TextEncoder().encode(JSON.stringify(unsigned))
  );
  if (!signatureValid) throw new Error("Manifest signature is invalid");
  const assetResponse = await fetch(manifest.asset.path);
  if (!assetResponse.ok) throw new Error("World asset is unavailable");
  const assetHash = toHex(await crypto.subtle.digest("SHA-256", await assetResponse.arrayBuffer()));
  if (assetHash !== manifest.asset.sha256) throw new Error("World asset hash does not match the manifest");
  if (!manifest.policy.visualOnly || !manifest.policy.allowlistOnly || manifest.policy.imageCodeExecution) {
    throw new Error("Manifest policy is unsafe");
  }
  return true;
}

function setTrustStatus(state, message) {
  trustStatus.className = `status ${state}`;
  trustStatus.innerHTML = "";
  const dot = document.createElement("span");
  dot.setAttribute("aria-hidden", "true");
  trustStatus.append(dot, document.createTextNode(message));
}

function refreshSimulationAvailability() {
  const approved = manifestVerified && consent.checked && selected;
  simulateButton.disabled = !approved;
  if (!manifestVerified) simulateButton.textContent = "Signed manifest not verified";
  else if (!consent.checked) simulateButton.textContent = "Approve visual simulation to continue";
  else if (selected) simulateButton.textContent = `Simulate ${selected.name}`;
}

function renderWorkflow(actions, activeIndex = -1) {
  workflowList.replaceChildren();
  actions.forEach((action, index) => {
    const item = document.createElement("li");
    item.textContent = action;
    if (index === activeIndex) item.className = "active";
    workflowList.append(item);
  });
}

function selectCharacter(character) {
  const signedHotspot = manifestById.get(character.id);
  if (!signedHotspot) return;
  selected = { ...character, actions: signedHotspot.actionIds };
  simulationToken += 1;
  for (const button of document.querySelectorAll("[data-character-id]")) {
    button.setAttribute("aria-pressed", String(button.dataset.characterId === character.id));
  }
  detail.replaceChildren();
  const image = document.createElement("img");
  image.src = character.image;
  image.alt = `${character.name}, ${character.role}, within the Miseverse composite world`;
  image.style.objectPosition = `${character.position.x}% ${character.position.y}%`;
  const copy = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = character.name;
  const role = document.createElement("p");
  role.textContent = `${character.role} · ${character.district}`;
  const responsibility = document.createElement("p");
  responsibility.textContent = character.responsibility;
  const meta = document.createElement("div");
  meta.className = "meta";
  for (const value of [character.station, ...signedHotspot.actionIds]) {
    const chip = document.createElement("span");
    chip.textContent = value;
    meta.append(chip);
  }
  const trustChip = document.createElement("span");
  trustChip.className = "trust-chip";
  trustChip.textContent = `Signed hotspot · ${signedHotspot.actionIds.length} allowlisted labels`;
  copy.append(title, role, responsibility, meta, trustChip);
  detail.append(image, copy);
  renderWorkflow(signedHotspot.actionIds);
  refreshSimulationAvailability();
}

function renderWorld(world) {
  for (const character of world.characters) {
    if (!manifestById.has(character.id)) continue;
    const hotspot = document.createElement("button");
    hotspot.type = "button";
    hotspot.className = "hotspot";
    hotspot.dataset.characterId = character.id;
    hotspot.style.left = `${character.position.x}%`;
    hotspot.style.top = `${character.position.y}%`;
    hotspot.setAttribute("aria-label", `Select ${character.name}, ${character.role}`);
    hotspot.setAttribute("aria-pressed", "false");
    const hotspotImage = document.createElement("img");
    hotspotImage.src = character.image;
    hotspotImage.alt = "";
    hotspotImage.style.objectPosition = `${character.position.x}% ${character.position.y}%`;
    hotspot.append(hotspotImage);
    hotspot.addEventListener("click", () => selectCharacter(character));
    hotspots.append(hotspot);

    const card = document.createElement("button");
    card.type = "button";
    card.className = "operator-card";
    card.dataset.characterId = character.id;
    card.setAttribute("aria-pressed", "false");
    const cardImage = document.createElement("img");
    cardImage.src = character.image;
    cardImage.alt = "";
    cardImage.style.objectPosition = `${character.position.x}% ${character.position.y}%`;
    const cardCopy = document.createElement("div");
    cardCopy.className = "copy";
    const cardTitle = document.createElement("h3");
    cardTitle.textContent = character.name;
    const cardRole = document.createElement("p");
    cardRole.textContent = `${character.role} · ${character.district}`;
    cardCopy.append(cardTitle, cardRole);
    card.append(cardImage, cardCopy);
    card.addEventListener("click", () => {
      selectCharacter(character);
      document.querySelector("#world-heading").scrollIntoView({ block: "start" });
    });
    roster.append(card);
  }
  selectCharacter(world.characters.find(character => manifestById.has(character.id)));
}

consent.addEventListener("change", refreshSimulationAvailability);
simulateButton.addEventListener("click", async () => {
  if (!selected || !manifestVerified || !consent.checked) return;
  const token = ++simulationToken;
  simulateButton.disabled = true;
  for (let index = 0; index < selected.actions.length; index += 1) {
    if (token !== simulationToken) return;
    renderWorkflow(selected.actions, index);
    await new Promise(resolve => setTimeout(resolve, 550));
  }
  if (token === simulationToken) {
    renderWorkflow(selected.actions);
    simulateButton.textContent = "Simulation complete · run again";
    simulateButton.disabled = false;
  }
});

try {
  const [world, manifest, trust] = await Promise.all([
    loadJson("data/world.json"),
    loadJson("data/manifest.json"),
    loadJson("data/trusted-keys.json")
  ]);
  await verifyManifest(manifest, trust);
  manifestVerified = true;
  manifestById = new Map(manifest.hotspots.map(hotspot => [hotspot.id, hotspot]));
  consent.disabled = false;
  setTrustStatus("verified", ` verified · ${manifest.signature.keyId}`);
  renderWorld(world);
  refreshSimulationAvailability();
} catch (error) {
  setTrustStatus("failed", ` verification failed · ${error instanceof Error ? error.message : String(error)}`);
  consent.disabled = true;
  simulateButton.disabled = true;
  simulateButton.textContent = "Manifest verification failed";
}
