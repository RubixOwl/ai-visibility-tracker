// Curated company facts & Jev guardrail knowledge.
// Loaded from the unified single source of truth: rules_and_knowledge.json
import fs from 'node:fs';

const raw = fs.readFileSync(new URL('./rules_and_knowledge.json', import.meta.url), 'utf8');
const data = JSON.parse(raw);

// T109: the phone number is given only when company.phone_live is true in the master
// services file (data/alpine-wave/alpine-wave-services.json, copied by prepare:chat-data).
// It stays false until T49 (Alpine Wave phone bot) passes. While false, answers and
// profiles drop the number; `*_phone_live` answers hold the wording that brings it back.
const services = JSON.parse(fs.readFileSync(new URL('./alpine-wave-services.json', import.meta.url), 'utf8'));
export const phoneLive = services.company?.phone_live === true;
// T121 round 6: the no-match phone safety net reads the number/email from the services copy.
export const servicesContact = { phone: services.company?.phone, email: services.company?.email };

const withoutPhone = ({ phone, telephone, ...rest }) => rest;
const pickAnswer = ({ answer_phone_live, ...item }) => (phoneLive && answer_phone_live ? { ...item, answer: answer_phone_live } : item);
const pickExtras = extras => Object.fromEntries(Object.entries(extras)
  .filter(([key]) => !key.endsWith('_phone_live'))
  .map(([key, value]) => [key, key === 'company_questions' ? value.map(pickAnswer) : (phoneLive && extras[`${key}_phone_live`]) || value]));

export const company = phoneLive ? data.company_profile : withoutPhone(data.company_profile);
export const questions = data.company_faq.map(pickAnswer);
export const extraAnswers = pickExtras(data.company_extra_answers);
export const businessInfo = phoneLive ? data.business_info : withoutPhone(data.business_info);
export const escalationRules = data.escalation_rules;
export const refusalRules = data.refusal_rules;

export const byId = Object.fromEntries(questions.map(q => [q.id, q]));
