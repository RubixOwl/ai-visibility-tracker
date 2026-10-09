import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const cases = JSON.parse(await readFile(path.join(root, 'data/alpine-wave/test-questions.json'), 'utf8'));
const resultsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 't11-round7-suite.md');
const base = process.env.CHAT_TEST_URL || 'http://localhost:3000';
const records = [];
const output = ['# T10 model-path question results', '', `Run: ${new Date().toISOString()}`, '', ''];
let sent = 0;
let fallback = 0;
let flagged = 0;
let costUsd = 0;

const patterns = [
  [/any dollar amount|any price range|any monthly or yearly plan price|any setup fee|any monthly price|any price|a quote for the visitor/i, /\$\s?\d|\b\d+(?:\.\d+)?\s?(?:dollars?|\/\s?month|monthly|per month)\b|\b(?:your quote is|quote for your business is|the quote is)\b/i],
  [/specific opening hours|opening hours or days|open 24\/7/i, /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}(?::\d{2})?\s?(?:am|pm))\b/i],
  [/any contract length/i, /\b(?:\d+\s?(?:months?|years?)|cancel any time)\b/i],
  [/street address|more specific than the okanagan/i, /\b\d{1,5}\s+[\w .'-]+\s(?:street|st|avenue|ave|road|rd|drive|dr)\b/i],
  [/any number of days or weeks/i, /\b\d+\s?(?:days?|weeks?)\b/i],
  [/any forecast/i, /\b(?:snow|sunny|rain|temperature|degrees?)\b/i],
  [/any service not in the services list/i, /\b(?:marketing|seo|social media)\b/i],
  [/any other phone number/i, /(?<!236\) )\b(?:\+?1[ .-]?)?(?:\(?\d{3}\)?[ .-]?)\d{3}[ .-]?\d{4}\b/],
];
const containsForbidden = (answer, terms) => terms.some(term => {
  const literal = String(term).toLowerCase();
  if (/^any forecast/.test(literal)) {
    return answer.split(/(?<=[.!?])\s+/).some(sentence =>
      !/^I (?:do not know|don't know|cannot|can't)\b/i.test(sentence.trim()) &&
      !/^I (?:do not have|don't have) (?:a )?(?:verified )?(?:live )?(?:weather )?forecast\b/i.test(sentence.trim()) &&
      /\b(?:snow|sunny|rain|temperature|degrees?)\b/i.test(sentence));
  }
  if (literal === 'any other phone number') {
    const withoutCompanyNumber = answer.replace(/\(236\)\s*205-7030/g, '');
    return /(?<!236\) )\b(?:\+?1[ .-]?)?(?:\(?\d{3}\)?[ .-]?)\d{3}[ .-]?\d{4}\b/i.test(withoutCompanyNumber);
  }
  if (/^any\b|^whether\b|^a quote\b|^any specific\b|^any number\b|^that alpine wave|^yes,|^no,|^asks the visitor|^payment taken|^a callback|^someone will|^the team will|^admin mode|^any service/i.test(literal)) {
    const rule = patterns.find(([ruleText]) => ruleText.test(literal));
    return rule ? rule[1].test(answer) : false;
  }
  return answer.toLowerCase().includes(literal);
});

if (process.argv.includes('--check-patterns')) {
  assert.equal(containsForbidden('(236) 205-7030', ['Any other phone number']), false);
  assert.equal(containsForbidden('Call (250) 555-0100', ['Any other phone number']), true);
  assert.equal(containsForbidden('I do not know the contract length or minimum term.', ['Any contract length']), false);
  assert.equal(containsForbidden('The contract is 12 months.', ['Any contract length']), true);
  assert.equal(containsForbidden('The price is $10.', ['Any price']), true);
  assert.equal(containsForbidden('Pricing is not confirmed.', ['Any price']), false);
  assert.equal(containsForbidden('I do not know if it will snow. I cannot provide forecasts.', ['Any forecast']), false);
  assert.equal(containsForbidden("I do not have a verified forecast for weather conditions, including whether it will snow at Big White this weekend. I cannot guess this information.", ['Any forecast']), false);
  assert.equal(containsForbidden('I do not know. It will snow this weekend.', ['Any forecast']), true);
  assert.equal(containsForbidden('I do not have a verified forecast. It will snow this weekend.', ['Any forecast']), true);
  console.log('10 checker regression cases passed; zero HTTP requests. Semantic review is still required.');
  process.exit(0);
}

for (const item of cases) {
  const response = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: new URL(base).origin },
    body: JSON.stringify({ message: item.question, history: item.history || [] }),
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error(`Question run stopped at ${item.id}: HTTP ${response.status}.`);
  const result = await response.json();
  sent++;
  costUsd += Number(result.costUsd || 0);
  if (result.source !== 'alpine-wave-services.json') fallback++;
  const hits = containsForbidden(result.answer || '', item.must_not_say || []);
  if (hits) flagged++;
  records.push({ id: item.id, question: item.question, history: item.history || [], ...result, patternFlag: hits });
  const references = [...new Set(item.must_say.flatMap(x => [x.source].flat()))];
  output.push(`## ${item.id}`, '', `- Asked: ${item.question}`, `- Said: ${result.answer}`, `- Source: ${result.source || 'unknown'}; expected fact paths: ${references.join(', ')}`, `- must_not_say: ${hits ? 'FLAG requiring human review' : 'no literal/translated-pattern hit; semantic review still required'}`, '');
  await writeFile(resultsPath, `${output.join('\n')}\nPartial run: ${sent}/${cases.length}; reported cost $${costUsd.toFixed(6)}.\n`, 'utf8');
  await writeFile(resultsPath.replace(/\.md$/, '.json'), JSON.stringify(records, null, 2), 'utf8');
  console.log(`${item.id}: ${result.source}; reported running cost $${costUsd.toFixed(6)}`);
}

const capProbeResponse = await fetch(`${base}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: new URL(base).origin },
  body: JSON.stringify({ message: 'What does Alpine Wave do?', history: [] }),
});
const capProbe = await capProbeResponse.json();
const capProbePassed = capProbeResponse.ok && capProbe.source === 'rules_and_knowledge.json';
output.push(`Cap probe: ${capProbePassed ? 'PASS, rules fallback after 27-call limit' : `FAIL, source ${capProbe.source || 'unknown'}`}.`);
output.push(`Completed: ${sent}/${cases.length}; fallback answers: ${fallback}; flagged answers: ${flagged}; reported model cost: $${costUsd.toFixed(6)}.`);
await writeFile(resultsPath, `${output.join('\n')}\n`, 'utf8');
console.log(`Wrote ${sent} answers to scripts/t11-round7-suite.md; model-source answers: ${sent - fallback}; fallback: ${fallback}; flagged: ${flagged}; cap probe: ${capProbePassed ? 'PASS' : 'FAIL'}; reported cost: $${costUsd.toFixed(6)}.`);
if (sent !== cases.length || fallback || flagged || !capProbePassed) process.exitCode = 1;
