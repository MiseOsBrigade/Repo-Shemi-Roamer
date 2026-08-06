#!/usr/bin/env node
import process from "node:process";
import readline from "node:readline";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { RepoRoamer, formatEventLine, listCharacters } from "../src/index.js";
import { HELP_TEXT, parseArgs } from "../src/cli-options.js";
import { clearScreen, hideCursor, renderTerminal, showCursor } from "../src/terminal-renderer.js";

const packagePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../package.json");

function setupKeyboard(onQuit) {
  if (!process.stdin.isTTY) return;
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on("keypress", (_, key) => {
    if (key?.name === "q" || (key?.ctrl && key?.name === "c")) onQuit();
  });
}

async function readVersion() {
  const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
  return packageJson.version;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    process.stdout.write(HELP_TEXT);
    return;
  }

  if (options.version) {
    console.log(await readVersion());
    return;
  }

  if (options.listCharacters) {
    for (const character of listCharacters()) {
      console.log(
        `${character.number}. ${character.name} (${character.id}) — ${character.kitchenRole}: ${character.responsibility}`
      );
    }
    return;
  }

  const roamer = new RepoRoamer(options);
  await roamer.initialize();

  if (options.steps !== null) {
    for (let index = 0; index < options.steps; index += 1) {
      const event = await roamer.step();
      console.log(options.json ? JSON.stringify(event) : formatEventLine(event));
    }
    return;
  }

  if (!process.stdout.isTTY && !options.json) {
    throw new Error("Live terminal mode requires a TTY. Use --steps=<n> or --json.");
  }

  const trail = [];
  let stopped = false;
  let cleaned = false;

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
    showCursor();
  };

  const quit = () => {
    stopped = true;
    cleanup();
    if (process.stdout.isTTY && !options.json) clearScreen();
    console.log("🍜 Repo Shemi returned to the pass.");
  };

  setupKeyboard(quit);
  if (!options.json) hideCursor();
  process.once("SIGINT", quit);
  process.once("SIGTERM", quit);
  process.once("exit", cleanup);

  while (!stopped) {
    const event = await roamer.step();
    if (options.json) {
      console.log(JSON.stringify(event));
    } else {
      trail.unshift(formatEventLine(event));
      await renderTerminal(event, roamer, trail);
    }
    await new Promise(resolve => setTimeout(resolve, options.tickMs));
  }
}

main().catch(error => {
  showCursor();
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
