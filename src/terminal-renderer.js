export function clearScreen() {
  process.stdout.write("\x1b[2J\x1b[H");
}

export function hideCursor() {
  process.stdout.write("\x1b[?25l");
}

export function showCursor() {
  process.stdout.write("\x1b[?25h");
}

export async function renderTerminal(event, roamer, trail) {
  clearScreen();

  console.log("Repo Shemi Roamer");
  console.log("────────────────────────────────────────────────────────────");
  console.log(`Sprite:        ${event.character.sprite}`);
  console.log(`Character:     ${event.character.name}`);
  console.log(`Root:          ${roamer.root}`);
  console.log(`Current:       ${event.displayPath}`);
  console.log(`Mode:          ${roamer.peek ? "peek-safe read mode" : "metadata-only read mode"}`);
  console.log(`Visited paths: ${roamer.visited.size}`);
  console.log(`Step:          ${event.step}`);
  console.log("");

  console.log(`${event.character.sprite} ${event.action}: ${event.displayPath}`);
  if (event.peek) console.log(`Peek: ${event.peek}`);
  console.log("");

  console.log("Recent trail");
  console.log("────────────────────────────────────────────────────────────");
  if (trail.length === 0) {
    console.log("  The little repo chef is waking up...");
  } else {
    for (const line of trail.slice(0, 10)) console.log(`  ${line}`);
  }

  console.log("");
  console.log("Press q to quit.");
}
