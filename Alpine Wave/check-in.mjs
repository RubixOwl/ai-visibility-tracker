#!/usr/bin/env node
// Factory check-in: a read-only scan any AI can run. It never changes a file, except that
// --accept (Marg only) writes Alpine Wave/check-in-accepted.json.
// Usage: node "Alpine Wave/check-in.mjs" [--full | --accept | --accepted] [--days N | --since YYYY-MM-DD] [--root DIR]
//   (none)      only problems that are new since Marg last ran --accept; the accepted ones are
//               counted in one line. Also the fails.md lines added since then. With no
//               Alpine Wave/check-in-accepted.json yet, it shows everything (short form, below).
//   --full      every problem line and every done card, accepted or not (default: short, a count
//               per kind of problem; problems from the last 48 hours are always shown in full)
//   --accept    Marg only: runs the checks, then writes every problem found (and every fails.md
//               line) to Alpine Wave/check-in-accepted.json, replacing what was there. After it,
//               she runs --accepted to check the list is what she means to accept.
//   --accepted  lists the accepted problems the default run hides
//   --root      project folder to scan (default: the folder above this script)
// Env: AGENT_GATE_POLICY = path to the machine policy file (protected-file list), if it isn't
//      in the usual place next to the project folder.
// Exit code: 0 = clean (nothing new), 1 = something new flagged.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const ROOT = path.resolve(opt('--root') ?? path.join(HERE, '..'));
const FULL = args.includes('--full');
const ACCEPT = args.includes('--accept');
const SHOW_ACCEPTED = args.includes('--accepted');
const RECENT_MS = 48 * 36e5; // problems newer than this are never hidden in a count

// Locate factory folder
let FACTORY = path.join(ROOT, 'Alpine Wave');
if (!fs.existsSync(FACTORY) && fs.existsSync(path.join(ROOT, 'line'))) {
  FACTORY = ROOT;
}
const LINE = path.join(FACTORY, 'line');
const STATIONS = ['0-draft', '1-todo', '2-building', '3-review', '4-done'];
const STANDARDS = ['website', 'bot replies', 'phone bot', 'data file', 'research',
  'docs and records', 'repo and publishing', 'real-business demo'];
const BUILDING_LIMIT_DAYS = 2;

const now = new Date();
let since = opt('--since')
  ? new Date(`${opt('--since')}T00:00:00`)
  : new Date(now.getTime() - Number(opt('--days') ?? 2) * 864e5);
// Never count changes from before the factory opened ("Factory start:" line in log.md).
const startLine = fs.existsSync(path.join(FACTORY, 'log.md'))
  && fs.readFileSync(path.join(FACTORY, 'log.md'), 'utf8').match(/^Factory start:\s*(\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2})?)/m);
const factoryStart = startLine ? parseDate(startLine[1]) : null;
if (factoryStart && since < factoryStart) since.setTime(factoryStart.getTime());
if (Number.isNaN(since.getTime())) {
  console.error('Could not read --since / --days. Use --since YYYY-MM-DD or --days N.');
  process.exit(2);
}

// Folders never scanned for off-card work: tooling, the factory itself, handoffs, secrets,
// and each model's own Ideas folder (free working space, no card needed).
const SKIP_DIRS = new Set(['.git', 'node_modules', '.next', 'dist', 'build', '.vercel',
  '__pycache__', '.venv', 'venv', 'store', '.claude', '.cache', '.git-backup']);
const SKIP_PATHS = ['Alpine Wave/', 'specs/handoffs/', 'Model Ideas/'];

// Files never opened, read or hashed: the machine policy's protected-file globs (neverReadGlobs),
// with a built-in copy in case the policy file can't be read. Matched on the file name only.
// Where the policy file is: $AGENT_GATE_POLICY, else "Global Hooks_Skills/agent-gate/policy.json"
// in the folder that holds the project folder, else the placeholder (not found: built-in list only).
const POLICY_PLACEHOLDER = '__POLICY_PATH__';
const POLICY_NEXT_TO_PROJECT = path.join(HERE, '..', '..', 'Global Hooks_Skills', 'agent-gate', 'policy.json');
const POLICY = process.env.AGENT_GATE_POLICY
  || (fs.existsSync(POLICY_NEXT_TO_PROJECT) ? POLICY_NEXT_TO_PROJECT : POLICY_PLACEHOLDER);
const POLICY_FROM = process.env.AGENT_GATE_POLICY ? 'AGENT_GATE_POLICY'
  : POLICY === POLICY_PLACEHOLDER ? POLICY_PLACEHOLDER : '../Global Hooks_Skills/agent-gate/policy.json';
const FALLBACK_SECRET_GLOBS = ['.env', '.env.*', '*.env', '*.pem', '*.key', '*.ppk', '*.pfx', '*.p12',
  '*.kdbx', '*.kdb', '*.opvault', '*.psafe3', '*.agilekeychain', 'credentials.json', 'secrets.json',
  'secrets.yaml', 'secrets.yml', '*-adminsdk*.json', 'firebase-adminsdk*.json', 'service-account*.json',
  'id_rsa', 'id_ed25519', 'id_ecdsa', 'wallet.dat', '*.wallet', 'Login Data', 'Login Data For Account',
  'Web Data', 'Cookies'];
let secretGlobs = FALLBACK_SECRET_GLOBS;
let secretListNote = `built-in list only (${FALLBACK_SECRET_GLOBS.length} patterns; policy file not found at ${POLICY_FROM}, check skipped)`;
if (POLICY !== POLICY_PLACEHOLDER) {
  try {
    const g = JSON.parse(fs.readFileSync(POLICY, 'utf8'))?.tierB_agentEnforced?.neverReadGlobs;
    if (Array.isArray(g) && g.length) {
      secretGlobs = [...new Set([...g, ...FALLBACK_SECRET_GLOBS])];
      secretListNote = `policy file (${POLICY_FROM}) + built-in list, ${secretGlobs.length} patterns`;
    } else secretListNote = `built-in list only (policy file at ${POLICY_FROM} has no neverReadGlobs)`;
  } catch { secretListNote = `built-in list only (policy file at ${POLICY_FROM} could not be read)`; }
}
const SECRET_RES = secretGlobs.map((g) => new RegExp(`^${g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`, 'i'));
const isSecret = (name) => SECRET_RES.some((re) => re.test(name));

// Database files never opened, read or hashed
const DB_EXTS = ['.db', '.db-wal', '.db-shm', '.sqlite', '.sqlite3'];
const isDb = (name) => {
  const lower = name.toLowerCase();
  return DB_EXTS.some((ext) => lower.endsWith(ext));
};

// Each flag has a kind (the short output prints one count per kind) and "recent": open cards,
// log lines and copies from the last 48 hours are always printed in full.
// key: the same from run to run for the same problem (the accepted list matches on it). By default
// kind + where + message; a problem whose message holds a number that drifts (card size, days in
// building) passes its own key without that number.
const flags = [];
const flag = (where, msg, kind = 'other', recent = true, short = msg, key = `${kind} | ${where} | ${msg}`) =>
  flags.push({ where, msg, kind, recent, short, key });
const isRecent = (d) => !!d && now - d < RECENT_MS;

// Scratch / test space: never scanned for stray copies and never part of an overlap flag.
// "scratch", "_scratch", "*-scratch" folders anywhere; "fake" folders under Model Ideas/.
const isScratchName = (name) => /^_?scratch$/i.test(name) || /-scratch$/i.test(name);
const isScratchPath = (rel) => {
  const parts = norm(rel).split('/').filter(Boolean);
  return parts.some(isScratchName) || (parts[0] === 'Model Ideas' && parts.includes('fake'));
};

// ---------- helpers ----------
const stripComments = (s) => (s || '').replace(/<!--[\s\S]*?-->/g, '').trim();
const norm = (p) => p.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^`|`$/g, '').trim();
const day = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const local = (d) => `${day(d)} ${d.toTimeString().slice(0, 5)}`;

function whichAI(name) {
  const n = (name || '').toLowerCase();
  if (!n) return '';
  if (n.includes('claude') || n.includes('marg') || n.includes('pip') || n.includes('katy')) return 'claude';
  if (n.includes('gemini')) return 'gemini';
  if (n.includes('chatgpt') || n.includes('gpt') || n.includes('openai') || n.includes('codex')) return 'chatgpt';
  return n;
}

function parseBuilder(builderText) {
  if (!builderText) return { primary: '', allowed: new Set(), isOpen: true };
  const clean = builderText.replace(/\*/g, '').trim();
  const firstPart = clean.split(/[·(]/)[0].trim();
  const primaryAI = whichAI(firstPart);
  const isOpen = !firstPart || /^open\b/i.test(firstPart) || /^any\b/i.test(firstPart);
  const allowed = new Set();
  if (primaryAI && !isOpen) {
    allowed.add(primaryAI);
  }
  const wasMatch = clean.match(/\(\s*was\s+([^·)]+)\)/i);
  if (wasMatch) {
    const wasAI = whichAI(wasMatch[1].trim());
    if (wasAI) allowed.add(wasAI);
  }
  return { primary: primaryAI, allowed, isOpen, raw: builderText };
}

function getReviewerRounds(text, reviewerName) {
  const names = [reviewerName];
  if (reviewerName.toLowerCase() === 'john') {
    names.push('borris');
  }
  const rounds = new Set();
  for (const name of names) {
    const headerRe = new RegExp(`^(#{2,3})\\s+${name}'s\\s+checks\\b.*$`, 'mi');
    const m = text.match(headerRe);
    if (!m) continue;
    const level = m[1].length;
    const startIndex = m.index + m[0].length;
    const rest = text.slice(startIndex);
    const endRe = new RegExp(`^#{1,${level}}\\s+`, 'm');
    const endMatch = rest.match(endRe);
    const sectionBody = endMatch ? rest.slice(0, endMatch.index) : rest;
    const roundMatches = sectionBody.matchAll(/^(?:###\s+|-\s*)Round\s+(\d+)\b/gmi);
    for (const rm of roundMatches) {
      rounds.add(parseInt(rm[1], 10));
    }
  }
  return rounds;
}

function parseDate(s) {
  const m = (s || '').match(/(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}))?/);
  return m ? new Date(`${m[1]}T${m[2] ?? '00:00'}:00`) : null;
}

function section(text, heading) {
  // Body of "## heading" up to the next "## " heading.
  const re = new RegExp(`^##\\s+${heading}\\s*$([\\s\\S]*?)(?=^##\\s|(?![\\s\\S]))`, 'mi');
  const m = text.match(re);
  return m ? m[1] : '';
}

function field(text, name) {
  const m = text.match(new RegExp(`^-\\s*${name}:[ \\t]*(.*)$`, 'mi'));
  return m ? stripComments(m[1]) : '';
}

// Paths on a "- item" list. Every backticked path on a line counts, whatever text surrounds it
// ("`archive/` (new)", "`A` and `B`"). A line with no backticks is taken whole.
function listedPaths(sectionText) {
  return listedItems(sectionText).map((x) => x.path);
}

// Same, with what each path is for: readOnly (a "Read only:" line, or "(read only)" right after
// the path) and ownCard ("(this card)" right after the path).
function listedItems(sectionText) {
  const out = [];
  for (const l of stripComments(sectionText).split(/\r?\n/)) {
    const item = l.match(/^\s*[-*]\s+(.+)$/)?.[1];
    if (!item) continue;
    const lineReadOnly = /^\**\s*read[ -]only\b/i.test(item);
    const ticked = [...item.matchAll(/`([^`]+)`([^`]*)/g)];
    if (!ticked.length) { out.push({ path: norm(item), readOnly: lineReadOnly, ownCard: false }); continue; }
    for (const m of ticked) {
      const after = m[2].split(',')[0];
      out.push({
        path: norm(m[1]),
        readOnly: lineReadOnly || /\(\s*read[ -]only\b/i.test(after),
        ownCard: /\(\s*this card\b/i.test(after),
      });
    }
  }
  return out.filter((x) => x.path);
}

function parseCard(file, station) {
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const base = path.basename(file);
  const idMatch = base.match(/^(T\d+)/i) || base.match(/^(D-[a-zA-Z0-9_-]+)/i);
  const id = idMatch ? (idMatch[1].toLowerCase().startsWith('t') ? idMatch[1].toUpperCase() : idMatch[1]) : (station === '0-draft' ? path.basename(base, '.md') : null);

  const fileItems = listedItems(section(text, 'Files'));
  const files = fileItems.map((x) => x.path);
  const replaces = listedPaths(section(text, 'Replaces'));

  const handoff = section(text, 'Build handoff');
  const proofMatch = handoff.match(/^###\s+Proof\s*$([\s\S]*)/mi);
  const proof = proofMatch ? stripComments(proofMatch[1]) : '';

  // Marg's checks: one "### Round N" per check, each with "- Result: PASS|FAIL".
  const checks = section(text, "Marg's checks");
  const rounds = checks.split(/^###\s+Round\b.*$/mi).slice(1)
    .map((r) => field(r, 'Result').toUpperCase())
    .filter(Boolean);

  const reviewer = field(text, 'Reviewer');
  const katyRounds = getReviewerRounds(text, 'katy');
  const johnRounds = getReviewerRounds(text, 'john');

  let title = (text.match(/^#\s+[TD]\d+\s*[·:\-–—]?\s*(.*)$/mi) || [])[1]?.trim()
    ?? (text.match(/^#\s+D\s*[·:\-–—]?\s*(.*)$/mi) || [])[1]?.trim()
    ?? (text.match(/^#\s*(.*)$/m) || [])[1]?.trim()
    ?? '';

  return {
    file: `${station}/${base}`,
    station,
    id,
    title,
    builder: field(text, 'Builder'),
    reviewer,
    katyRounds,
    johnRounds,
    claimed: field(text, 'Claimed'),
    standard: field(text, 'Done Standard'),
    escalated: field(text, 'Escalated to [^:\\n]+'),
    johnReview: field(text, "John's review"),
    blocked: stripComments(section(text, 'Blocked')),
    goal: stripComments(section(text, 'Goal')),
    task: stripComments(section(text, 'Task')),
    doneLooksLike: stripComments(section(text, 'Done looks like')).replace(/^\s*-\s*\[\s?\]\s*$/gm, '').trim(),
    files,
    fileItems,
    replaces,
    proof,
    rounds,
    bytes: fs.statSync(file).size,
  };
}

// ---------- read the line ----------
if (!fs.existsSync(LINE)) {
  console.error(`No line folder at ${LINE}`);
  process.exit(2);
}

const cards = [];
for (const station of STATIONS) {
  const dir = path.join(LINE, station);
  if (!fs.existsSync(dir)) { flag(station, 'station folder is missing', 'station folder missing'); continue; }
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory() || name.startsWith('.')) continue;
    if (station === '0-draft') {
      if (!/^(D-|T\d+).*\.md$/i.test(name)) { flag(`${station}/${name}`, 'not a card (drafts are named D-title.md or T##-title.md)', 'not a card'); continue; }
    } else {
      if (!/^T\d+.*\.md$/i.test(name)) { flag(`${station}/${name}`, 'not a card (cards are named T##-title.md)', 'not a card', station !== '4-done'); continue; }
    }
    cards.push(parseCard(full, station));
  }
}

// ---------- read the log ----------
const moves = [];
const logFile = path.join(FACTORY, 'log.md');
if (fs.existsSync(logFile)) {
  for (const line of fs.readFileSync(logFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^(\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2})?)\s*\|\s*([^|]+?)\s*\|\s*(\S+)\s*(?:→|->)\s*(\S+)\s*\|\s*([^|]+?)\s*(?:\||$)/i);
    if (m) moves.push({ when: parseDate(m[1]), id: m[2].trim().toUpperCase(), from: m[3].trim(), to: m[4].trim(), who: m[5].trim(), line });
  }
} else {
  flag('log.md', 'log file is missing', 'log file missing');
}
// Short output: a log line without its note (time | card | move | who).
const logHead = (line) => line.split('|').slice(0, 4).map((x) => x.trim()).join(' | ');
const stationOf = (s) => STATIONS.find((st) => st === s || st.endsWith(`-${s}`) || st.startsWith(`${s}-`)) ?? s;

// Log lines with a guessed time (T64): stamped more than 5 minutes in the future, or more than
// 15 minutes later than a line written after it. Lines are written in order, so a later line
// can't be much earlier unless this one guessed. Compared with the next LOG_LOOKAHEAD stamped
// lines, not only the next one, so a run of guessed lines (08:40, 08:55, 09:30, then 08:27)
// is caught whole. Up to 15 minutes out of order is normal (runner and Katy lines overlap).
const FUTURE_MS = 5 * 6e4;
const OUT_OF_ORDER_MS = 15 * 6e4;
const LOG_LOOKAHEAD = 8;
if (fs.existsSync(logFile)) {
  const stamped = fs.readFileSync(logFile, 'utf8').split(/\r?\n/)
    .map((line) => ({ line, m: line.match(/^(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2})\s*\|/) }))
    .filter((x) => x.m)
    .map((x) => ({ line: x.line.trim(), when: parseDate(x.m[1]) }));
  // A line just before a flagged one that is also out of order (by any amount) is part of the
  // same run of guessed lines, so it is flagged too (08:40 is only 13 min after 08:27, but sits
  // in the run 08:40, 08:55, 09:30).
  const hm = (d) => d.toTimeString().slice(0, 5);
  const whys = stamped.map(() => '');
  for (let i = stamped.length - 1; i >= 0; i--) {
    const s = stamped[i];
    if (s.when - now > FUTURE_MS) { whys[i] = `stamped ${local(s.when)}, later than the clock now (${local(now)})`; continue; }
    const after = stamped.slice(i + 1, i + 1 + LOG_LOOKAHEAD);
    if (!after.length) continue;
    const earliest = after.reduce((a, b) => (b.when < a.when ? b : a));
    const ahead = s.when - earliest.when;
    if (ahead > OUT_OF_ORDER_MS || (ahead > 0 && whys[i + 1])) {
      whys[i] = `stamped ${hm(s.when)}, but a line written after it says ${day(earliest.when) === day(s.when) ? hm(earliest.when) : local(earliest.when)}`
        + ` (${Math.round(ahead / 6e4)} min earlier${ahead > OUT_OF_ORDER_MS ? '' : '; in a run of wrong times'})`;
    }
  }
  stamped.forEach((s, i) => {
    const why = whys[i];
    if (why) flag('log.md', `${why}: ${s.line}`, 'log time looks wrong', isRecent(s.when), `${why}: ${logHead(s.line)}`,
      `log time looks wrong | log.md | ${s.line}`);
  });
}

// ---------- card checks ----------
const CARD_LIMIT_BYTES = 12 * 1024;
const seen = new Map();
for (const c of cards) {
  const where = c.file;
  const isOpen = c.station !== '4-done';
  const cf = (msg, kind, short, key) => flag(where, msg, kind, isOpen, short ?? msg, key);
  if (c.id && seen.has(c.id)) cf(`same card ID as ${seen.get(c.id)}`, 'same card ID');
  if (c.id) seen.set(c.id, where);

  // Open card (0-draft to 3-review) over 12 KB (FACTORY "Cards stay short", T52).
  if (isOpen && c.bytes > CARD_LIMIT_BYTES) {
    cf(`card is ${(c.bytes / 1024).toFixed(1)} KB: move Working notes and old proof to Alpine Wave/line/notes/${c.id || 'T##'}-notes.md (FACTORY, T52)`, 'card over 12 KB: move Working notes and old proof to Alpine Wave/line/notes/T##-notes.md (FACTORY, T52)', `card is ${(c.bytes / 1024).toFixed(1)} KB`,
      `card over 12 KB | ${where}`);
  }

  // 0-draft: proposals in progress, do not flag for missing Builder/Claimed, Standard, Files, etc.
  if (c.station === '0-draft') {
    continue;
  }

  if (!c.standard) cf('no Done Standard named', 'card field missing');
  else if (!STANDARDS.includes(c.standard.toLowerCase())) cf(`Done Standard "${c.standard}" is not one in STANDARDS.md`, 'Done Standard not in STANDARDS.md');
  if (c.files.length === 0) cf('no files listed', 'card field missing');
  if (!c.goal) cf('no Goal written', 'card field missing');
  if (!c.task) cf('no Task written', 'card field missing');
  if (!c.doneLooksLike) cf('no "Done looks like" list', 'card field missing');

  const builder = whichAI(c.builder);
  const taken = c.station !== '1-todo';
  const pastBuilding = c.station === '3-review' || c.station === '4-done';
  if (!c.builder) cf('no builder named (Marg writes "any" or an AI name)', 'card field missing');
  else if (taken && (builder === 'any' || /^any\b/i.test(c.builder))) cf('taken, but Builder still says "any" (the builder writes their own name)', 'Builder or Claimed wrong');
  if (taken && !c.claimed) cf('taken, but no Claimed time', 'Builder or Claimed wrong');

  // Building too long: time since the log moved it into building, else the claim time.
  if (c.station === '2-building') {
    const entered = moves.filter((m) => (m.id.toUpperCase() === (c.id || '').toUpperCase()) && stationOf(m.to) === '2-building').at(-1)?.when
      ?? parseDate(c.claimed);
    if (!entered) cf('in building with no claim time and no log entry', 'in building too long');
    else {
      const days = (now - entered) / 864e5;
      if (days > BUILDING_LIMIT_DAYS) cf(`in building for ${days.toFixed(1)} days (limit ${BUILDING_LIMIT_DAYS})`, 'in building too long', undefined,
        `in building too long | ${where} | since ${local(entered)}`);
    }
  }

  c.rounds.forEach((r, i) => {
    if (!/^(PASS|FAIL)\b/.test(r)) cf(`Marg's check round ${i + 1} result "${r}" is not PASS or FAIL`, "Marg's round result not PASS or FAIL");
  });

  if (pastBuilding && !c.proof) cf('handed in, but the handoff has no proof', 'handed in without proof');
  if (c.station === '3-review' && !c.reviewer) cf('no Reviewer line', 'card field missing');

  if (c.station === '4-done' && !c.rounds.at(-1)?.startsWith('PASS')) {
    cf("in done without Marg's PASS (last round of Marg's checks)", "in done without Marg's PASS");
  }

  const fails = c.rounds.filter((r) => r.startsWith('FAIL')).length;
  if (fails >= 3 && !c.escalated) cf(`${fails} FAILs and not escalated to the owner`, '3+ FAILs not escalated');

  // Log must agree with the folder.
  const cardMoves = moves.filter((m) => m.id.toUpperCase() === (c.id || '').toUpperCase());
  if (cardMoves.length === 0) cf('no entry in log.md (Marg logs every new card)', 'no entry in log.md');
  else {
    const lastTo = stationOf(cardMoves.at(-1).to);
    if (lastTo !== c.station) flag(where, `log says it should be in ${lastTo}, but it's in ${c.station} (moved without a log entry?)`, 'log and folder disagree', isOpen || isRecent(cardMoves.at(-1).when));
  }

  // Who may make each move: builders take (todo → building) and hand in (building → review)
  // their own card; every other move is Marg's. A handed-over card names both builders.
  // Same rule as move-card.mjs: Katy may also fail a card back (3-review → 2-building) when its
  // Reviewer line starts with "Katy" (DECISIONS 2026-10-09 09:54). move-card checks the Reviewer
  // line at move time, and Marg sometimes rewrites it later (T42, T58), so a Katy round recorded
  // on the card for that hand-in also counts: Katy only reviews a round when she was the Reviewer.
  const named = parseBuilder(c.builder).allowed;
  const katyReviews = /^katy\b/i.test(c.reviewer.replace(/\*/g, '').trim());
  let handIns = 0;
  for (const m of cardMoves) {
    const from = stationOf(m.from);
    const to = stationOf(m.to);
    if (from === '2-building' && to === '3-review') handIns++;
    const builderMove = (from === '1-todo' && to === '2-building') || (from === '2-building' && to === '3-review');
    const byMarg = /\bmarg\b/i.test(m.who);
    const katyWasReviewer = katyReviews || c.katyRounds.has(Math.max(1, handIns));
    const katyFail = /^katy$/i.test(m.who) && katyWasReviewer && from === '3-review' && to === '2-building';
    if (!builderMove && !byMarg && !katyFail) flag('log.md', `only Marg may make this move: ${m.line.trim()}`, 'move only Marg may make', isRecent(m.when), `only Marg may make this move: ${logHead(m.line)}`);
    if (builderMove && !byMarg && named.size && !named.has(whichAI(m.who))) {
      flag('log.md', `${m.who} moved ${c.id}, but the card's builder is ${c.builder}: ${m.line.trim()}`, "card moved by someone not its builder", isRecent(m.when),
        `${m.who} moved ${c.id}, but the card's builder is ${c.builder}: ${logHead(m.line)}`);
    }
  }
}

// Logged cards must exist.
for (const id of new Set(moves.map((m) => m.id))) {
  if (!cards.some((c) => (c.id || '').toUpperCase() === id.toUpperCase())) {
    const last = moves.filter((m) => m.id === id).at(-1)?.when;
    flag('log.md', `${id} is in the log but no card file exists`, 'in the log, no card file', isRecent(last));
  }
}

// Two open cards editing the same file. Not counted: "Read only" paths, a card's own file,
// the append-only shared files below, and scratch/test folders.
const SHARED_APPEND_ONLY = new Set(['Alpine Wave/log.md', 'Alpine Wave/line/Learning Loop/fails.md',
  'Alpine Wave/line/Learning Loop/shop-lessons.md']);
function editedPaths(c) {
  return c.fileItems.filter((x) => {
    if (x.readOnly || x.ownCard || SHARED_APPEND_ONLY.has(x.path) || isScratchPath(x.path)) return false;
    // The card's own file, wherever it sits on the line (Alpine Wave/line/*/T51-....md).
    if (c.id && x.path.startsWith('Alpine Wave/line/') && path.posix.basename(x.path).toUpperCase().startsWith(`${c.id.toUpperCase()}-`)) return false;
    return true;
  }).map((x) => x.path);
}
const open = cards.filter((c) => c.station !== '4-done' && c.station !== '0-draft');
for (let i = 0; i < open.length; i++) {
  const ai = [...new Set(editedPaths(open[i]))];
  for (let j = i + 1; j < open.length; j++) {
    const bj = [...new Set(editedPaths(open[j]))];
    const same = [];
    const inFolder = [];
    for (const a of ai) {
      for (const b of bj) {
        if (a === b) same.push(a);
        else if ((a.endsWith('/') && b.startsWith(a)) || (b.endsWith('/') && a.startsWith(b))) inFolder.push(`${a} / ${b}`);
      }
    }
    const pair = `${open[i].file} + ${open[j].file}`;
    if (same.length) flag(pair, `both edit ${same.join(', ')}${inFolder.length ? `; folder shared: ${inFolder.join(', ')}` : ''}`, 'clash: two open cards edit the same file');
    else if (inFolder.length) flag(pair, `folder shared (one edits inside a folder the other lists whole): ${inFolder.join(', ')}`, 'folder shared');
  }
}

// ---------- off-card work: files changed since the cut-off that no card covers ----------
const covers = (card, rel) => card.files.some((f) => f === rel || (f.endsWith('/') && rel.startsWith(f)));
const offCard = [];
const inTodo = [];
const unreadable = [];
const changedAt = new Map(); // file → its last change time (part of the accepted-list key)

function walk(dirAbs, rel) {
  let entries;
  try { entries = fs.readdirSync(dirAbs, { withFileTypes: true }); } catch { unreadable.push(rel || '.'); return; }
  for (const e of entries) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name) || SKIP_PATHS.some((p) => `${r}/`.startsWith(p))) continue;
      if (isScratchPath(r)) continue; // scratch / test space, not a master (same rule as the copy scan)
      walk(path.join(dirAbs, e.name), r);
      continue;
    }
    if (isSecret(e.name) || isDb(e.name)) continue; // never touch secrets or database files
    let st;
    try { st = fs.statSync(path.join(dirAbs, e.name)); } catch { continue; }
    if (st.mtime < since) continue;
    changedAt.set(r, st.mtime);
    const holders = cards.filter((c) => c.station !== '0-draft' && covers(c, r));
    if (holders.length === 0) offCard.push(r);
    else if (holders.every((c) => c.station === '1-todo')) inTodo.push(`${r} (${holders.map((c) => c.id).join(', ')})`);
  }
}
walk(ROOT, '');

// ---------- archive checks ----------
// (a) a done card whose "Replaces" files are still in place: archive.mjs has not been run.
for (const c of cards.filter((x) => x.station === '4-done')) {
  for (const r of c.replaces) {
    if (fs.existsSync(path.join(ROOT, r))) flag(c.file, `done, but "Replaces" file is still in place (archive not run): ${r}`, 'done, but Replaces file still in place', false);
  }
}

// (b) stray copies: files outside archive/ and docs/ with identical bytes.
// Same skip list as the off-card scan (incl. store/, venvs, caches), plus .agents, plus
// scratch/test space: scratch folders (isScratchPath) and any folder holding its own test board.
const COPY_SKIP_DIRS = new Set([...SKIP_DIRS, '.agents']);
const COPY_SKIP_TOP = new Set(['archive', 'docs']);
const isTestBoard = (dirAbs) => path.resolve(dirAbs) !== path.resolve(FACTORY)
  && (fs.existsSync(path.join(dirAbs, 'Alpine Wave', 'line')) || fs.existsSync(path.join(dirAbs, 'line', '1-todo')));
const bySize = new Map();
const mtimes = new Map();
function walkCopies(dirAbs, rel) {
  let entries;
  try { entries = fs.readdirSync(dirAbs, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (COPY_SKIP_DIRS.has(e.name) || (!rel && COPY_SKIP_TOP.has(e.name))) continue;
      if (isScratchPath(r) || isTestBoard(path.join(dirAbs, e.name))) continue;
      walkCopies(path.join(dirAbs, e.name), r);
      continue;
    }
    if (!e.isFile() || isSecret(e.name) || isDb(e.name)) continue; // never touch secrets or database files
    let st;
    try { st = fs.statSync(path.join(dirAbs, e.name)); } catch { continue; }
    if (st.size === 0) continue; // empty files are all "identical"; not a stray copy
    if (!bySize.has(st.size)) bySize.set(st.size, []);
    bySize.get(st.size).push(r);
    mtimes.set(r, st.mtime);
  }
}
walkCopies(ROOT, '');
const strayCopies = [];
for (const group of bySize.values()) {
  if (group.length < 2) continue;
  const byHash = new Map();
  for (const r of group) {
    let h;
    try { h = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, r))).digest('hex'); } catch { continue; }
    if (!byHash.has(h)) byHash.set(h, []);
    byHash.get(h).push(r);
  }
  // Copies that all sit inside Model Ideas/ are free working space (FACTORY), not stray masters.
  for (const same of byHash.values()) {
    if (same.length > 1 && !same.every((r) => r.startsWith('Model Ideas/'))) strayCopies.push(same.sort());
  }
}
strayCopies.sort((a, b) => a[0].localeCompare(b[0]));
for (const same of strayCopies) {
  const newest = new Date(Math.max(...same.map((r) => mtimes.get(r)?.getTime() ?? 0)));
  const short = same.length === 2
    ? `stray copy: identical bytes to ${same[1]}`
    : `stray copy: ${same.length} identical copies: ${same[0]}, ${same[1]}, …and ${same.length - 2} more`;
  flag(same[0], `stray copy: identical bytes to ${same.slice(1).join(', ')}`, 'stray copy', isRecent(newest), short);
}

// ---------- accepted list (T64) ----------
// Marg's --accept writes every problem found (and every fails.md line) to check-in-accepted.json.
// The default run hides the problems whose key is in that list and counts them in one line.
// A changed file's key holds its change time, so the same file changed again shows as new.
const ACCEPTED_FILE = path.join(FACTORY, 'check-in-accepted.json');
const ACCEPTED_REL = path.relative(ROOT, ACCEPTED_FILE).replace(/\\/g, '/');
const offCardKey = (r) => `changed, no card lists it | ${r} | ${changedAt.get(r)?.toISOString()}`;
const inTodoPath = (entry) => entry.replace(/ \([^)]*\)$/, '');
const inTodoKey = (entry) => `changed, card in 1-todo | ${entry} | ${changedAt.get(inTodoPath(entry))?.toISOString()}`;
const failsFile = path.join(LINE, 'Learning Loop', 'fails.md');
const failsLines = fs.existsSync(failsFile)
  ? fs.readFileSync(failsFile, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => /^\d{4}-\d{2}-\d{2}\b.*\|/.test(l))
  : [];

let accepted = null; // null = no accepted file: today's behaviour, nothing hidden
if (!ACCEPT && fs.existsSync(ACCEPTED_FILE)) {
  try { accepted = JSON.parse(fs.readFileSync(ACCEPTED_FILE, 'utf8')); } catch (e) {
    console.error(`Could not read ${ACCEPTED_REL} (${e.message}). Marg: run --accept again.`);
    process.exit(2);
  }
}
const acceptedKeys = new Set((accepted?.problems ?? []).map((p) => p.key));
const isAccepted = (key) => acceptedKeys.has(key);
const hidden = {
  flags: flags.filter((f) => isAccepted(f.key)),
  offCard: offCard.filter((r) => isAccepted(offCardKey(r))),
  inTodo: inTodo.filter((e) => isAccepted(inTodoKey(e))),
};
const hiddenCount = hidden.flags.length + hidden.offCard.length + hidden.inTodo.length;
const foundKeys = new Set([...flags.map((f) => f.key), ...offCard.map(offCardKey), ...inTodo.map(inTodoKey)]);
const goneCount = [...acceptedKeys].filter((k) => !foundKeys.has(k)).length;
const acceptedFails = new Set(accepted?.fails ?? []);
const newFails = accepted ? failsLines.filter((l) => !acceptedFails.has(l)) : [];

if (ACCEPT) {
  // Keep the first accepted date of a problem that was already on the old list.
  let old = new Map();
  try { old = new Map(JSON.parse(fs.readFileSync(ACCEPTED_FILE, 'utf8')).problems.map((p) => [p.key, p.accepted])); } catch { /* none yet */ }
  const today = local(now);
  const problems = [
    ...flags.map((f) => ({ key: f.key, kind: f.kind, where: f.where, text: f.msg })),
    ...offCard.map((r) => ({ key: offCardKey(r), kind: 'changed, no card lists it', where: r, text: r })),
    ...inTodo.map((e) => ({ key: inTodoKey(e), kind: 'changed, card in 1-todo', where: inTodoPath(e), text: e })),
  ].map((p) => ({ ...p, accepted: old.get(p.key) ?? today }));
  const unique = [...new Map(problems.map((p) => [p.key, p])).values()];
  fs.writeFileSync(ACCEPTED_FILE, `${JSON.stringify({ written: today, by: 'check-in.mjs --accept (Marg)', problems: unique, fails: failsLines }, null, 2)}\n`);
}

// What this run prints: --accepted = only the hidden ones; --full / --accept / no accepted file =
// everything; default = only the new ones.
const showAll = FULL || ACCEPT || !accepted;
const shown = SHOW_ACCEPTED ? hidden
  : showAll ? { flags, offCard, inTodo }
    : {
      flags: flags.filter((f) => !isAccepted(f.key)),
      offCard: offCard.filter((r) => !isAccepted(offCardKey(r))),
      inTodo: inTodo.filter((e) => !isAccepted(inTodoKey(e))),
    };

// ---------- waiting on logic ----------
function getWaitingOn(c, cardMoves) {
  if (c.station === '0-draft') {
    return c.johnReview && c.johnReview.trim() ? 'Marg' : 'John';
  }
  if (c.station === '1-todo') {
    return 'a builder';
  }
  if (c.station === '2-building') {
    if (c.blocked && c.blocked.trim()) return 'the owner';
    const b = parseBuilder(c.builder);
    if (b.isOpen) return 'anyone';
    return 'the builder';
  }
  if (c.station === '3-review') {
    const rev = (c.reviewer || '').trim();
    if (!rev || /^marg\s*only\b/i.test(rev)) {
      return 'Marg';
    }
    const handIns = cardMoves.filter((m) => stationOf(m.from) === '2-building' && stationOf(m.to) === '3-review');
    const latestHandIn = Math.max(1, handIns.length);

    if (/^katy\b/i.test(rev)) {
      const hasRound = c.katyRounds && c.katyRounds.has(latestHandIn);
      return hasRound ? 'Marg' : 'Katy';
    }
    if (/^john\b/i.test(rev)) {
      const hasRound = c.johnRounds && c.johnRounds.has(latestHandIn);
      return hasRound ? 'Marg' : 'John';
    }
    return 'Marg';
  }
  if (c.station === '4-done') {
    return 'nobody';
  }
  return '?';
}

// ---------- report ----------
// Collected first, so the last line can say how big this output is.
const outLines = [];
const out = (s = '') => outLines.push(s);
const count = (st) => cards.filter((c) => c.station === st).length;
const modeNote = SHOW_ACCEPTED ? ' · accepted (hidden) problems only' : ACCEPT ? ' · --accept' : FULL ? ' · full list' : '';
out(`Check-in · ${local(now)} · changes since ${local(since)}${modeNote}`);
out(`Protected-file list: ${secretListNote}`);
out('');
if (!SHOW_ACCEPTED) out('Board:');
for (const st of SHOW_ACCEPTED ? [] : STATIONS) {
  const list = cards.filter((c) => c.station === st);
  if (st === '4-done' && !FULL) {
    // Short output: done cards by ID only (--full prints each one).
    out(`  ${st} (${count(st)}): ${list.map((c) => c.id).join(', ')}`);
    continue;
  }
  out(`  ${st} (${count(st)})`);
  for (const c of list) {
    const cardMoves = moves.filter((m) => m.id.toUpperCase() === (c.id || '').toUpperCase());
    const waitingOn = getWaitingOn(c, cardMoves);
    const wait = `waiting on: ${waitingOn}`;
    if (c.station === '0-draft') {
      out(`    ${c.id} · ${c.title || '(no title)'} · ${wait}`);
    } else {
      const who = c.station === '1-todo' ? `for: ${c.builder || '?'}` : `builder: ${c.builder || '?'}`;
      out(`    ${c.id} · ${c.title || '(no title)'} · ${who} · ${wait}`);
    }
  }
}
if (!SHOW_ACCEPTED) out('');

// The owner's decision box: the line/ subfolder named "... Check desision" (or "decision").
let ownerFiles = [];
try {
  const box = fs.readdirSync(LINE, { withFileTypes: true })
    .find((e) => e.isDirectory() && /check\s*desi[sc]ion/i.test(e.name));
  if (box) ownerFiles = fs.readdirSync(path.join(LINE, box.name)).filter((f) => !f.startsWith('.'));
} catch { /* ignore */ }
if (ownerFiles.length && !SHOW_ACCEPTED) {
  out(`Waiting on the owner (${ownerFiles.length}):`);
  for (const f of ownerFiles) out(`  - ${f}`);
  out('');
}

const flagsOut = shown.flags;
if (flagsOut.length) {
  if (FULL || SHOW_ACCEPTED) {
    out(`${SHOW_ACCEPTED ? 'Accepted line problems, hidden in the default run' : 'Line problems'} (${flagsOut.length}):`);
    for (const f of flagsOut) out(`  - ${f.where}: ${f.msg}`);
  } else {
    // One line per kind with its count; every recent problem in full; older ones by name only.
    const kinds = new Map();
    for (const f of flagsOut) {
      if (!kinds.has(f.kind)) kinds.set(f.kind, []);
      kinds.get(f.kind).push(f);
    }
    const recentCount = flagsOut.filter((f) => f.recent).length;
    out(`${accepted && !ACCEPT ? 'New line problems' : 'Line problems'} (${flagsOut.length}, ${kinds.size} kinds; ${recentCount} from open cards or the last 48 hours, shown in full):`);
    const order = [...kinds].sort((a, b) => b[1].filter((f) => f.recent).length - a[1].filter((f) => f.recent).length
      || b[1].length - a[1].length);
    for (const [kind, list] of order) {
      const recent = list.filter((f) => f.recent);
      const older = list.filter((f) => !f.recent);
      out(`  ${kind} (${list.length}${older.length ? `, ${older.length} older` : ''}):`);
      for (const f of recent) out(`    - ${f.where}: ${f.short}`);
      if (older.length) {
        const label = (f) => (f.where === 'log.md' ? `log.md (${(f.msg.match(/\|\s*([^|]+?)\s*\|/) || f.msg.match(/^(\S+) is in the log/) || [])[1] || '?'})` : f.where);
        const names = [...new Set(older.map(label))];
        out(`    older: ${names.slice(0, 5).join(', ')}${names.length > 5 ? `, …and ${names.length - 5} more` : ''}`);
      }
    }
  }
  out('');
}

if (shown.inTodo.length) {
  out(`${SHOW_ACCEPTED ? 'Accepted: ' : ''}Changed, but its card is still in 1-todo (${shown.inTodo.length}):`);
  for (const f of shown.inTodo) out(`  - ${f}`);
  out('');
}

if (shown.offCard.length) {
  out(`${SHOW_ACCEPTED ? 'Accepted: ' : ''}Changed, but no card lists it (${shown.offCard.length}), by folder:`);
  const groups = new Map();
  for (const f of shown.offCard) {
    const parts = f.split('/');
    const key = parts.length > 2 ? `${parts[0]}/${parts[1]}/` : parts.length === 2 ? `${parts[0]}/` : '(top level)';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(f);
  }
  for (const [key, list] of [...groups].sort()) {
    out(`  ${key}  ${list.length} file${list.length === 1 ? '' : 's'}`);
    for (const f of list.slice(0, 5)) out(`    - ${f}`);
    if (list.length > 5) out(`    … and ${list.length - 5} more`);
  }
  out('');
}

if (unreadable.length) out(`Could not read: ${unreadable.join(', ')}\n`);

// New fails.md lines since --accept (only once an accepted file exists). Printed as they are:
// Marg reads them for faults that keep coming back.
if (accepted && !SHOW_ACCEPTED) {
  out(`New in fails.md since accepted: ${newFails.length}`);
  for (const l of newFails) out(`  - ${l}`);
  out('');
}

if (ACCEPT) {
  out(`Accepted ${flags.length + offCard.length + inTodo.length} problems (${flags.length} line problems, `
    + `${offCard.length} changed with no card, ${inTodo.length} changed with the card in 1-todo) and `
    + `${failsLines.length} fails.md lines into ${ACCEPTED_REL}.`);
  out('Check the list is what you mean to accept: node "Alpine Wave/check-in.mjs" --accepted');
} else if (SHOW_ACCEPTED) {
  out(!accepted ? `No accepted list yet (${ACCEPTED_REL}); nothing is hidden.`
    : `Accepted earlier and hidden: ${hiddenCount} (list written ${accepted.written ?? '?'}; `
      + `${goneCount} accepted problems no longer found).`);
} else {
  const clean = !shown.flags.length && !shown.inTodo.length && !shown.offCard.length;
  if (accepted && !FULL) out(`Accepted earlier and hidden: ${hiddenCount} (node "Alpine Wave/check-in.mjs" --accepted lists them)`);
  out(clean ? (hiddenCount && !FULL ? 'Clean: nothing new flagged.' : 'Clean: nothing flagged.')
    : 'Flagged items above. Report them to Marg (or the owner). Do not fix the line yourself.');
  process.exitCode = clean ? 0 : 1;
}
// Last lines: this output's own size, then (short output) how to get the full list.
const tail = FULL ? [] : ['Full list: node "Alpine Wave/check-in.mjs" --full'];
let sizeLine = '';
for (let k = 0; k < 2; k++) {
  const all = `${[...outLines, sizeLine, ...tail].join('\n')}\n`;
  sizeLine = `(this output: ${(Buffer.byteLength(all, 'utf8') / 1024).toFixed(1)} KB, ${outLines.length + 1 + tail.length} lines)`;
}
process.stdout.write(`${[...outLines, sizeLine, ...tail].join('\n')}\n`);
