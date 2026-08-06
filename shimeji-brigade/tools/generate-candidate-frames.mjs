import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';

const ROOT = new URL('../', import.meta.url).pathname;
const states = { idle: 6, walk: 8, climb: 6, fall: 4, drag: 3, interact: 6, perch: 4 };
const characters = [
  { id: 'mizu', body: [26, 150, 205], accent: [125, 211, 252], role: 'ticket' },
  { id: 'kurogami', body: [18, 71, 52], accent: [242, 201, 76], role: 'chef' }
];

function crc32(buf) {
  let c = ~0;
  for (const b of buf) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (~c) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function png(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

function set(rgba, x, y, color) {
  if (x < 0 || y < 0 || x >= 128 || y >= 128) return;
  const i = (y * 128 + x) * 4;
  rgba[i] = color[0]; rgba[i + 1] = color[1]; rgba[i + 2] = color[2]; rgba[i + 3] = color[3] ?? 255;
}
function ellipse(rgba, cx, cy, rx, ry, color) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
    if (((x - cx) ** 2) / (rx ** 2) + ((y - cy) ** 2) / (ry ** 2) <= 1) set(rgba, x, y, color);
  }
}
function rect(rgba, x0, y0, w, h, color) {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) set(rgba, x, y, color);
}
function line(rgba, x0, y0, x1, y1, color) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) set(rgba, Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), color);
}

function draw(char, state, frame) {
  const rgba = Buffer.alloc(128 * 128 * 4);
  const t = frame / Math.max(1, states[state] - 1);
  const bob = Math.round(Math.sin(t * Math.PI * 2) * 3);
  const sway = Math.round(Math.sin(t * Math.PI * 2) * 4);
  const drag = state === 'drag' ? 5 : 0;
  const fall = state === 'fall' ? frame * 3 : 0;
  const y = 0 + bob + fall;
  const outline = [5, 7, 19, 255];
  const cream = [246, 241, 231, 255];
  const skin = [236, 190, 150, 255];

  ellipse(rgba, 64 + sway, 111 + y, 28 + drag, 7, [0, 0, 0, 55]);
  ellipse(rgba, 64 + sway, 70 + y, 27, 34, outline);
  ellipse(rgba, 64 + sway, 70 + y, 23, 30, char.body.concat(255));
  rect(rgba, 43 + sway, 82 + y, 42, 30, char.body.concat(255));
  rect(rgba, 39 + sway, 84 + y, 50, 6, outline);
  ellipse(rgba, 64 + sway, 45 + y, 27, 25, outline);
  ellipse(rgba, 64 + sway, 47 + y, 23, 21, skin);

  if (char.role === 'ticket') {
    ellipse(rgba, 64 + sway, 29 + y, 30, 13, [21, 120, 180, 255]);
    rect(rgba, 81 + sway, 70 + y, 22, 15, [255, 255, 230, 255]);
    rect(rgba, 84 + sway, 74 + y, 16, 2, char.accent.concat(255));
    rect(rgba, 84 + sway, 79 + y, 12, 2, char.accent.concat(255));
  } else {
    ellipse(rgba, 64 + sway, 25 + y, 31, 11, cream);
    ellipse(rgba, 52 + sway, 19 + y, 13, 12, cream);
    ellipse(rgba, 64 + sway, 17 + y, 14, 12, cream);
    ellipse(rgba, 76 + sway, 19 + y, 13, 12, cream);
    rect(rgba, 45 + sway, 70 + y, 38, 8, cream);
  }

  ellipse(rgba, 55 + sway, 47 + y, 4, 5, [0, 0, 0, 255]);
  ellipse(rgba, 73 + sway, 47 + y, 4, 5, [0, 0, 0, 255]);
  line(rgba, 57 + sway, 58 + y, 71 + sway, 58 + y, outline);

  if (state === 'climb') { line(rgba, 25, 10, 25, 120, char.accent.concat(255)); line(rgba, 103, 10, 103, 120, char.accent.concat(255)); }
  if (state === 'interact') ellipse(rgba, 100, 28 + bob, 6 + frame % 3, 6 + frame % 3, char.accent.concat(180));
  if (state === 'perch') rect(rgba, 25, 115, 78, 5, char.accent.concat(220));

  return png(128, 128, rgba);
}

for (const char of characters) {
  const manifest = JSON.parse(await readFile(join(ROOT, 'assets/sprites', char.id, 'manifest.json'), 'utf8'));
  for (const [state, count] of Object.entries(manifest.states)) {
    const dir = join(ROOT, 'assets/sprites', char.id, state);
    await mkdir(dir, { recursive: true });
    for (let i = 1; i <= count; i++) {
      await writeFile(join(dir, `frame_${String(i).padStart(3, '0')}.png`), draw(char, state, i - 1));
    }
  }
}
const stamp = createHash('sha256').update(JSON.stringify(characters)).digest('hex').slice(0, 12);
console.log(`Generated candidate frames (${stamp})`);
