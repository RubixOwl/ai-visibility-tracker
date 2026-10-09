import assert from 'node:assert/strict';
import fs from 'node:fs';
const fresh = () => import(`../lib/ai-response.mjs?case=${Math.random()}`);
const master = JSON.parse(fs.readFileSync(new URL('../../data/alpine-wave/alpine-wave-services.json', import.meta.url), 'utf8'));
let requests = 0;
let request;
let reply = JSON.stringify({ answer: 'A model-written reply.' });
let mode = 'ok';
globalThis.fetch = async (_url, options) => {
  requests++;
  request = JSON.parse(options.body);
  if (mode === 'refused') throw new TypeError('fetch failed', { cause: { code: 'ECONNREFUSED' } });
  if (mode === 'unknown') throw new TypeError('fetch failed');
  if (mode === 'http') return { ok: false, status: 503 };
  return { ok: true, json: async () => ({ choices: [{ message: { content: reply } }], usage: { prompt_tokens: 100, completion_tokens: 20 } }) };
};
process.env.ALPINE_WAVE_MODEL_ENABLED = 'false';
process.env.ALPINE_WAVE_MODEL_MAX_CALLS = '1';
process.env.ALPINE_WAVE_MODEL_BUDGET_USD = '0.25';
delete process.env.KEYPROXY_KEY;
let api = await fresh();
assert.equal((await api.answerFromServices('What do you do?')).source, 'rules_and_knowledge.json');
assert.equal(requests, 0);
assert.equal(api.modelUsage().calls, 0);
process.env.ALPINE_WAVE_MODEL_ENABLED = 'true';
api = await fresh();
assert.equal((await api.answerFromServices('What do you do?')).source, 'rules_and_knowledge.json');
assert.equal(requests, 0);
process.env.KEYPROXY_KEY = 'offline-placeholder';
process.env.ALPINE_WAVE_MODEL_BUDGET_USD = '0.0000001';
api = await fresh();
assert.equal((await api.answerFromServices('What do you do?')).source, 'rules_and_knowledge.json');
assert.equal(api.modelUsage().calls, 0);
assert.equal(requests, 0);
console.log('PASS disabled, missing-key and insufficient-budget guards: no requests');
process.env.ALPINE_WAVE_MODEL_BUDGET_USD = '0.25';
const warnings = [];
const warn = console.warn;
console.warn = text => warnings.push(text);
for (const [failure, expected] of [['refused', /proxy connection refused/], ['unknown', /without a recognized transport cause/], ['http', /HTTP 503/]]) {
  mode = failure;
  api = await fresh();
  const before = requests;
  assert.equal((await api.answerFromServices('What do you do?')).source, 'rules_and_knowledge.json');
  assert.match(warnings.at(-1), expected);
  await api.answerFromServices('Again?');
  assert.equal(requests, before + 1);
}
mode = 'ok';
console.log('PASS failed attempts count toward cap; sanitized transport diagnostics');
for (const invalid of ['invalid JSON', '{}', '{"answer":[]}', '{"answer":" "}', JSON.stringify({ answer: 'x'.repeat(1601) }), '']) {
  reply = invalid;
  api = await fresh();
  const result = await api.answerFromServices('What do you do?');
  assert.equal(result.source, 'rules_and_knowledge.json');
  assert.equal(result.costEstimated, false);
  assert.ok(Math.abs(result.costUsd - 0.000027) < 1e-10);
}
console.warn = warn;
console.log('PASS malformed, empty, wrong-type and oversized output rejected; attempted cost retained');
const ownerQuestions = [
  "Will the chat know if we've got any e-bikes left to rent this Saturday?",
  'Can it tell people how much our half-day tour costs?',
  'A guest asks our phone bot what time we close on Sundays. What happens?',
  'If a customer asks whether we have size 10 boots in stock, what will the bot say?',
  'Will the phone assistant tell callers our rental prices?',
  'Can the website chat tell visitors our opening hours?',
];
const companyQuestions = ['If I call on a Sunday will anyone pick up?', 'How much does it cost?', 'How much do you charge for the phone assistant?', "What's your phone number?", 'What are your opening hours?'];
// Deliberately include former rewrite triggers. Validation must never repair text.
for (const question of [...ownerQuestions, ...companyQuestions, 'Unseen wording with no recognised keywords']) {
  for (const text of ['You provide and approve the details; you approve them.', 'Live stock.', '  Whitespace and Unicode: café — unchanged.  ']) {
    reply = JSON.stringify({ answer: text });
    api = await fresh();
    const result = await api.answerFromServices(question);
    assert.equal(result.source, 'alpine-wave-services.json');
    assert.equal(result.answer, text);
    assert.ok(Array.isArray(result.suggestions));
    const system = request.messages[0].content;
    const facts = JSON.parse(system.split('Business facts:\n')[1].split('\n\nInstructions:\n')[0]);
    assert.deepEqual(facts, master, 'all approved scopes must be present on every request');
    assert.equal(request.model, 'openai/gpt-4o-mini');
    assert.equal(request.response_format.type, 'json_object');
    const before = requests;
    assert.equal((await api.answerFromServices(question)).source, 'rules_and_knowledge.json');
    assert.equal(requests, before);
  }
}
const history = [{ role: 'user', content: 'We run a bike shop.' }, { role: 'assistant', content: 'What would you like to know?' }];
api = await fresh();
await api.answerFromServices('What about after hours?', history);
assert.deepEqual(request.messages.slice(1, -1), history);
const source = fs.readFileSync(new URL('../lib/ai-response.mjs', import.meta.url), 'utf8');
assert.match(source, /const answer = parsed\.answer;/);
assert.doesNotMatch(source, /answer\s*(?:\+=|=\s*answer\.)|MODEL OUTPUT|clientQuestion|relevantFacts|isOwner|isCustomer/);
console.log('PASS model answers unchanged (36 cases), full master context, history and successful-call cap');
