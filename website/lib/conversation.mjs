import { company, extraAnswers, questions } from './knowledge.mjs';

const normalize = text => text.toLowerCase().normalize('NFKC').replace(/[’']/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const suggestions = questions.slice(0, 3).map(({ question }) => question);

export function respond(message) {
  const normalized = normalize(message);
  const approved = [
    ...questions,
    ...extraAnswers.company_questions,
  ].find(item => normalize(item.question) === normalized);

  if (approved) return {
    topic: approved.id || approved.topic,
    answer: approved.answer,
    suggestions,
  };

  if (/^(hi|hello|hey|good morning|good afternoon)$/.test(normalized)) return {
    topic: 'greeting',
    answer: 'Hello! I’m Alpine Wave’s company FAQ assistant. Ask about our website and phone services, setup or pricing.',
    suggestions,
  };

  if (/^(thanks|thank you|thankyou|cheers|ok|okay|great)$/.test(normalized)) return {
    topic: 'thanks',
    answer: 'You’re welcome. Is there anything else about Alpine Wave you would like to explore?',
    suggestions,
  };

  return {
    topic: 'offline',
    answer: `I can't give a checked answer to that right now. For anything about Alpine Wave, call ${company.phone} or email ${company.email}, or tap one of the questions below.`,
    suggestions,
  };
}
