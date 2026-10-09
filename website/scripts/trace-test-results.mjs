import { readFile, writeFile } from 'node:fs/promises';
const raw = await readFile(new URL('../../data/alpine-wave/alpine-wave-services.json', import.meta.url), 'utf8');
const facts = JSON.parse(raw);
const cases = JSON.parse(await readFile(new URL('../../data/alpine-wave/test-questions.json', import.meta.url), 'utf8'));
const results = JSON.parse(await readFile(new URL('./test-question-results.json', import.meta.url), 'utf8'));
const extra = {
  q01: ['status.pricing_and_commercials.description', 'not_offered[0].detail'],
  q02: ['not_offered[0].detail'],
  q25: ['not_offered[0].detail'],
  q16: ['services[2].summary'],
  q17: ['services[1].features[3]', 'services[1].features[4]'],
  q20: ['offer_tiers[2].lede'],
  q21: ['offer_tiers[1].bullet_points[2]'],
  q22: ['services[1].summary', 'services[1].features[5]'],
};
const out = ['# T11 source trace', '', 'Builder review aid: actual replies paired with the master fact values and exact lines. Source candidates are not an automatic semantic pass. Review also covers required omissions and forbidden claims.', ''];
for (const result of results) {
  const test = cases.find(x => x.id === result.id);
  const paths = [...new Set([...test.must_say.flatMap(x => [x.source].flat()), ...(extra[result.id.slice(0, 3)] || []), 'company.phone', 'company.email'])];
  out.push(`## ${result.id}`, '', `Asked: ${result.question}`, '', `Said: ${result.answer}`, '', 'Source: data/alpine-wave/alpine-wave-services.json');
  for (const key of paths) {
    const value = key.replace(/\[(\d+)\]/g, '.$1').split('.').reduce((v, k) => v[k], facts);
    const at = raw.indexOf(JSON.stringify(value));
    if (at < 0) throw new Error(`Cannot locate ${key}`);
    const line = raw.slice(0, at).split('\n').length;
    out.push(`- ${key}, line ${line}: ${JSON.stringify(value)}`);
  }
  out.push('', `Required meaning: ${test.must_say.map(x => x.fact).join(' | ')}`, `Must not say: ${test.must_not_say.join(' | ')}`, '');
}
await writeFile(new URL('./test-question-source-trace.md', import.meta.url), out.join('\n'), 'utf8');
console.log(`Traced ${results.length} answers to master fact lines.`);
