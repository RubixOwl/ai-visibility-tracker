import { company, extraAnswers, phoneLive, questions, servicesContact } from './knowledge.mjs';

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

  // T121 round 3: also "ok thanks", "great, thank you", "cool thanks", "thanks so much".
  if (/^(thanks|thank you|thankyou|cheers|ok|okay|great)$/.test(normalized)
    || /^(?:(?:ok|okay|great|cool|awesome|perfect|nice|lovely|alright|all right|got it|sounds good|brilliant) )*(?:thanks|thank you|thankyou|cheers|ty|thx|many thanks)(?: (?:so much|very much|a lot|again|heaps|for that|for the help|for your help))?$/.test(normalized)) return {
    topic: 'thanks',
    answer: 'You’re welcome. Is there anything else about Alpine Wave you would like to explore?',
    suggestions,
  };

  // T109: the number only once company.phone_live is true (see knowledge.mjs).
  // T121 (DECISIONS 2026-10-21 17:30): with the phone live, "for more" is email, Book a call or Get your free demo, never the number.
  // T121 round 6 (Olly 18:27 yes): no prepared answer matched, but the visitor seems to want to reach Alpine Wave by phone
  // (not their own shop/bot/customers) -> give the number. Only while the phone is live.
  // T121 round 8 (Katy/Marg round 7): only when the visitor asks for OUR number: number / phone number / # / telephone,
  // or call / ring / reach / phone + you / you guys / y'all / Alpine Wave. Never with me, it, assistant, chat, bot, missed,
  // owner, my, our, us, we, shop, customers, callers, handle, at once, French / language (product or callback questions).
  // T121 round 11 (Katy r9 / Marg r10): only OUR number / how to reach us: you / your / you guys / y'all / Alpine Wave together with
  // number / phone / call / ring / reach / contact (or #). A bare "number" is not enough; shop-number product words never fire it.
  // Also a few reach-us wordings with no "you": "is there a phone I can call", "that number again", "the number on the website".
  if (phoneLive && servicesContact.phone
    && ((/\b(you|u|your|ur|yours|you guys|yall|alpine wave|alpine waves)\b/.test(normalized)
      && (/\b(numbers?|telephone|phone|phoning|call|calling|ring|ringing|reach|contact)\b/.test(normalized) || /#/.test(message)))
      || /\b(?:is there|do you have|have you got|got) (?:a|any) phone(?: line)? (?:i|that i) (?:can|could) (?:call|ring|phone|use)\b/.test(normalized)
      || /\b(?:that|the) (?:phone )?number again\b/.test(normalized)
      || /\bnumber (?:is )?on (?:the|this|your) (?:web ?site|site|page)\b/.test(normalized)
      // T121 round 13 (Katy r11 / Marg r12): short number asks with no product word ("Number?", "Telephone?", "Office number?",
      // "number pls", "What's the best number?", "Whats the number to call", "phone?", "contact number"). Exclusions below still apply.
      || /^(?:(?:whats|what is|wats|wots) )?(?:(?:the|a|ur) )?(?:(?:best|office|contact|main|company|phone|telephone) )?(?:numbers?|telephone|phone|phone ?no|tel)(?: (?:to call|to ring|to use|to reach|for contact))?(?: (?:pls|plz|please))?$/.test(normalized)
      // T121 round 15 (Katy r12 / Marg r14): general, not word by word. Any short whole message (6 words or fewer) built around
      // number / phone / telephone / tel / # gets our number ("Sales number?", "Support number?", "Number for questions?",
      // "What number for sales?", "Booking number?"), unless it has a product word (these, plus both exclusion lists below).
      || (normalized.split(' ').length <= 6
        && (/\b(numbers?|phones?|telephones?|tel|phone ?no)\b/.test(normalized) || /#/.test(message))
        && !/\b(fax|keep|keeping|change|changing|new|lose|losing|bc|demo|demos|hours|of|or|calls|chats|plan|plans|trial|answering|answer|answers|service|services|voice|ai|receptionist|system|line|lines|can|do|does|will|would|should|could|get|have|need|want|buy|work|works)\b|\b1 ?8\d\d\b/.test(normalized)))
    && !/\b(me|it|its|assistant|assistants|chat|chatbot|bot|bots|missed|owner|owners|my|our|ours|us|we|shop|shops|business|businesses|customers?|callers?|handle|handles|handling|forward|forwarding|forwarded|french|english|languages?)\b|\bat once\b/.test(normalized)
    && !/\b(offer|offers|offered|provide|provides|sell|sells|toll|free|port|porting|ported|area|codes?|(?<!your |ur |alpine waves )local|outside|ontario|alberta|quebec|province|provinces|international|usa|american|states|second|extra|another|many|included|include|includes|price|cost|text|texting|set up|setup)\b/.test(normalized)) return {
    topic: 'offline',
    answer: `I can't give a checked answer to that, but you can call Alpine Wave at ${servicesContact.phone} or email ${servicesContact.email}. You can also tap Book a call or Get your free demo on this page.`,
    suggestions,
  };

  const answer = phoneLive
    ? `I can't give a checked answer to that right now. For more, email ${company.email}, or tap Book a call or Get your free demo on this page. You can also tap one of the questions below.`
    : `I can't give a checked answer to that right now. For anything about Alpine Wave, email ${company.email}, or tap one of the questions below.`;
  return {
    topic: 'offline',
    answer,
    suggestions,
  };
}
