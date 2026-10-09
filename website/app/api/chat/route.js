import { answerFromServices } from '../../../lib/ai-response.mjs';

export const runtime = 'nodejs';
const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Please use the chat on this website.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Please send a JSON message.' }, 415);
  try {
    // Bound the body while reading, including requests without Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return json({ error: 'Please type a question.' }, 400);
    let size = 0;
    const chunks = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 24000) { await reader.cancel(); return json({ error: 'This conversation is too long. Please start a new chat.' }, 413); }
      chunks.push(value);
    }
    const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!data || typeof data.message !== 'string' || !data.message.trim() || data.message.length > 800) return json({ error: 'Please enter a question between 1 and 800 characters.' }, 400);
    const history = data.history ?? [];
    if (!Array.isArray(history) || history.length > 16 || history.some(m => !m || !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string' || m.content.length > 1600)) return json({ error: 'Please start a new chat and try again.' }, 400);
    return json(await answerFromServices(data.message.trim(), history));
  } catch (e) {
    console.error('AI Response failed:', e.message);
    return json({ error: 'That message could not be read. Please try again.' }, 400);
  }
}
