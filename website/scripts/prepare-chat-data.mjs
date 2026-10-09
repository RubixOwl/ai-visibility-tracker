import { copyFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(here, '../../data/alpine-wave/alpine-wave-services.json');
const target = path.resolve(here, '../lib/alpine-wave-services.json');
const parsed = JSON.parse(await readFile(source, 'utf8'));
if (!Array.isArray(parsed.services) || !parsed.company || !Array.isArray(parsed.handoff_topics)) {
  throw new Error('The Alpine Wave services source is missing required sections.');
}
await copyFile(source, target);
console.log('Prepared the website chat facts from the master services file.');
