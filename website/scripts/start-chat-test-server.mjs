import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const website = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const nextBin = path.join(website, 'node_modules/next/dist/bin/next');
const requestedPort = process.argv[2] || process.env.PORT || '3000';
if (!/^\d{1,5}$/.test(requestedPort) || Number(requestedPort) < 1 || Number(requestedPort) > 65535) throw new Error('Choose a valid test port.');
const child = spawn(process.execPath, [nextBin, 'dev', '--hostname', '127.0.0.1', '--port', requestedPort], {
  cwd: website,
  stdio: 'inherit',
  env: {
    ...process.env,
    ALPINE_WAVE_MODEL_ENABLED: process.env.ALPINE_WAVE_MODEL_ENABLED || 'true',
    ALPINE_WAVE_MODEL_MAX_CALLS: process.env.ALPINE_WAVE_MODEL_MAX_CALLS || '27',
    ALPINE_WAVE_MODEL_BUDGET_USD: process.env.ALPINE_WAVE_MODEL_BUDGET_USD || '0.25',
  },
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', code => process.exit(code ?? 1));
