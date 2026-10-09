#!/usr/bin/env node
// Archive what a passed card replaced. Run by Pip after Marg moves a card to 4-done.
// Usage: node "Alpine Wave/archive.mjs" T05 [--dry-run] [--root DIR]
//   Reads the "Replaces" list of the card in line/4-done/ and MOVES each file or folder to
//   archive/YYYY-MM-DD T05 <card title>/<same path>, then appends one row per move to
//   archive/MOVES.md. It never deletes and never overwrites: if a target already exists,
//   or the card is not in 4-done, it stops before moving anything.
// --root  project folder (default: the folder above this script)
// Exit code: 0 = done (or dry-run ok), 1 = refused or problem, 2 = bad usage.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const rootIdx = args.indexOf('--root');
const ROOT = path.resolve(rootIdx >= 0 ? args[rootIdx + 1] : path.join(HERE, '..'));
const idArg = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--root');
const ID = idArg?.toUpperCase();

const refuse = (msg) => { console.error(`Refused: ${msg}`); process.exit(1); };
if (!ID || !/^T\d+$/.test(ID)) {
  console.error('Usage: node "Alpine Wave/archive.mjs" T05 [--dry-run] [--root DIR]');
  process.exit(2);
}

const LINE = path.join(ROOT, 'Alpine Wave', 'line');
const STATIONS = ['1-todo', '2-building', '3-review', '4-done'];

// ---------- find the card; it must be in 4-done ----------
let found = null;
for (const st of STATIONS) {
  const dir = path.join(LINE, st);
  if (!fs.existsSync(dir)) continue;
  for (const name of fs.readdirSync(dir)) {
    if (new RegExp(`^${ID}(?!\\d)`, 'i').test(name) && /\.md$/i.test(name)) found = { st, file: path.join(dir, name), name };
  }
}
if (!found) refuse(`no card ${ID} found under ${path.join('Alpine Wave', 'line')}.`);
if (found.st !== '4-done') refuse(`${ID} is in ${found.st}, not 4-done. Archiving runs only after Marg's PASS.`);

// ---------- read the card ----------
const text = fs.readFileSync(found.file, 'utf8');
const stripComments = (s) => s.replace(/<!--[\s\S]*?-->/g, '');
const m = text.match(/^##\s+Replaces\s*$([\s\S]*?)(?=^##\s|(?![\s\S]))/mi);
const wanted = [];
for (const l of stripComments(m ? m[1] : '').split(/\r?\n/)) {
  const item = l.match(/^\s*[-*]\s+(.+)$/)?.[1];
  if (!item) continue;
  const ticked = [...item.matchAll(/`([^`]+)`/g)].map((x) => x[1]);
  wanted.push(...(ticked.length ? ticked : [item]));
}
const clean = (p) => p.replace(/\\/g, '/').replace(/^\.\//, '').trim();
let replaces = [...new Set(wanted.map(clean).filter(Boolean))];
if (replaces.length === 0) {
  console.log(`${ID} has nothing in "Replaces". Nothing to archive.`);
  process.exit(0);
}

const title = (text.match(/^#\s+T\d+\s*[·:\-–—]?\s*(.*)$/mi) || [])[1]?.trim() || 'untitled';
const safeTitle = title.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').slice(0, 80).trim();
const d = new Date();
const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const destName = `${today} ${ID} ${safeTitle}`;
const destRoot = path.join(ROOT, 'archive', destName);

// ---------- plan every move first; refuse before touching anything ----------
const plan = [];
const notes = [];
for (const rel of replaces) {
  const relNoSlash = rel.replace(/\/+$/, '');
  const abs = path.resolve(ROOT, relNoSlash);
  const inside = path.relative(ROOT, abs);
  if (!inside || inside.startsWith('..') || path.isAbsolute(inside)) refuse(`"${rel}" is outside the project folder.`);
  const norm = inside.replace(/\\/g, '/');
  if (norm === 'archive' || norm.startsWith('archive/')) refuse(`"${rel}" is already in archive/.`);
  if (norm === 'Alpine Wave' || norm.startsWith('Alpine Wave/line') || norm === 'Alpine Wave/archive.mjs') {
    refuse(`"${rel}" is part of the factory itself; ask Marg.`);
  }
  if (!fs.existsSync(abs)) { notes.push(`not found, skipped (already moved?): ${norm}`); continue; }
  plan.push({ from: norm, fromAbs: abs, to: path.join(destRoot, ...norm.split('/')), isDir: fs.statSync(abs).isDirectory() });
}
// A listed file that sits inside another listed folder moves with that folder.
const folders = plan.filter((p) => p.isDir).map((p) => p.from + '/');
const moves = plan.filter((p) => !folders.some((f) => p.from.startsWith(f)));

for (const mv of moves) {
  if (fs.existsSync(mv.to)) refuse(`target already exists: ${path.relative(ROOT, mv.to).replace(/\\/g, '/')}. Nothing was moved. Pick or clear a different place; this script never overwrites.`);
}

const countFiles = (p) => {
  const st = fs.statSync(p);
  if (!st.isDirectory()) return 1;
  return fs.readdirSync(p).reduce((n, name) => n + countFiles(path.join(p, name)), 0);
};

// ---------- report and do ----------
console.log(`${dryRun ? 'DRY RUN (nothing will change)' : 'Archiving'}: ${ID} · ${title}`);
console.log(`Into: archive/${destName}/`);
const rows = [];
let n = 0;
for (const mv of moves) {
  n += 1;
  const toRel = path.relative(ROOT, mv.to).replace(/\\/g, '/');
  const size = mv.isDir ? ` (folder, ${countFiles(mv.fromAbs)} files)` : '';
  console.log(`  ${n}. ${mv.from}${mv.isDir ? '/' : ''}  →  ${toRel}${mv.isDir ? '/' : ''}${size}`);
  rows.push(`| ${ID}-${n} | \`${mv.from}${mv.isDir ? '/' : ''}\`${size} | \`${toRel}${mv.isDir ? '/' : ''}\` | Replaced by ${ID} (${safeTitle}) |`);
  if (!dryRun) {
    fs.mkdirSync(path.dirname(mv.to), { recursive: true });
    fs.renameSync(mv.fromAbs, mv.to);
  }
}
for (const note of notes) console.log(`  note: ${note}`);

if (moves.length === 0) { console.log('Nothing to move.'); process.exit(0); }

if (dryRun) {
  console.log(`Would append ${rows.length} row${rows.length === 1 ? '' : 's'} to archive/MOVES.md.`);
} else {
  const movesFile = path.join(ROOT, 'archive', 'MOVES.md');
  const block = [
    '',
    `## ${ID} · ${today} · ${safeTitle}`,
    'Moved by archive.mjs after Marg\'s PASS. Nothing deleted. To undo a move, reverse the line (to → from).',
    '',
    '| # | From | To | Why |',
    '|---|---|---|---|',
    ...rows,
    '',
  ].join('\n');
  fs.appendFileSync(movesFile, block, 'utf8');
  console.log(`Moved ${rows.length}. Appended ${rows.length} row${rows.length === 1 ? '' : 's'} to archive/MOVES.md.`);
}
