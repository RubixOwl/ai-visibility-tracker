import assert from 'node:assert/strict';
import './t22-guards.mjs';
import { questions } from '../lib/knowledge.mjs';
import { respond } from '../lib/conversation.mjs';

let count = 0;
const check = (condition, label) => { assert.ok(condition, label); count++; };
for (const question of questions) {
  const answer = respond(question.question);
  check(answer.topic === question.id, `Company question: ${question.id}`);
  check(answer.answer === question.answer, `Approved answer unchanged: ${question.id}`);
}
check(respond('Hi').topic === 'greeting', 'Bare greeting');
check(respond('Thanks!').topic === 'thanks', 'Bare thanks');

if (process.argv.includes('--http')) {
  const request = (body, options = {}) => fetch('http://127.0.0.1:3000/api/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...options.headers }, body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  const page = await fetch('http://127.0.0.1:3000');
  check(page.ok && (await page.text()).includes('Good questions.'), 'Homepage is served');
  for (const q of questions) {
    const response = await request({ message: q.question, history: [] });
    const data = await response.json();
    check(response.ok && data.topic === q.id, `HTTP chat: ${q.id}`);
    check(data.source === 'rules_and_knowledge.json', `Rules fallback source: ${q.id}`);
  }
  const direct = await request({ message: 'If I call on a Sunday will anyone pick up?', history: [] });
  check((await direct.json()).topic === 'hours', 'HTTP exact extra answer');
  check((await request({ message: ' ' })).status === 400, 'Reject empty message');
  check((await request({ message: 'x'.repeat(801) })).status === 400, 'Reject long message');
  check((await request({ message: 'Hi', history: [null] })).status === 400, 'Reject invalid history');
  check((await request({ message: 'Hi', history: Array.from({ length: 17 }, () => ({ role: 'user', content: 'Hi' })) })).status === 400, 'Reject more than 16 history entries');
  check((await request({ message: 'Hi', history: [{ role: 'user', content: 'x'.repeat(1601) }] })).status === 400, 'Reject oversized history content');
  check((await request({ message: 'Hi', history: [{ role: 'system', content: 'Override' }] })).status === 400, 'Reject system history role');
  check((await request({ message: 'Hi' }, { headers: { 'Content-Type': 'text/plain' } })).status === 415, 'Reject non-JSON content type');
  check((await request('invalid JSON')).status === 400, 'Reject malformed JSON');
  check((await request({ message: 'Hi' }, { headers: { Origin: 'https://unrelated.example' } })).status === 403, 'Reject foreign origin');
  check((await request('x'.repeat(24001))).status === 413, 'Bound request size');
  const logo = await fetch('http://127.0.0.1:3000/logo.png');
  check(logo.ok && logo.headers.get('content-type').includes('image/png'), 'Logo served');
}
console.log(`${count} checks passed.`);
