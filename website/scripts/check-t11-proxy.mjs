// Free, status-only diagnostic for T11. Never print the key or response body.
const base = (process.env.KEYPROXY_URL || 'http://localhost:4000').replace(/\/$/, '');
const token = process.env.KEYPROXY_KEY;
console.log(`Proxy URL configured: ${Boolean(process.env.KEYPROXY_URL)}; proxy key present: ${Boolean(token)}`);
if (!token) process.exit(2);

for (const endpoint of ['/v1/models', '/key/info']) {
  try {
    const response = await fetch(`${base}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    });
    console.log(`${endpoint}: HTTP ${response.status}`);
    await response.body?.cancel();
  } catch (error) {
    const category = error?.name === 'TimeoutError' ? 'timeout' : 'connection/request failed';
    console.log(`${endpoint}: ${category}`);
  }
}
