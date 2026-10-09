// Detect owner questions without treating Alpine Wave pricing follow-ups as shop data.
export function clientQuestion(message, history = []) {
  const q = message.toLowerCase();
  const context = [...history.filter(x => x.role === 'user').map(x => x.content), q].join(' ').toLowerCase();
  const assistant = /\b(?:assistant|bot|chat|chatbot)\b/.test(context);
  const owned = /\b(?:our|my)\s+(?:(?:shop|business)(?:'s)?\s+)?(?:rental\s+)?(?:prices?|rates?|opening hours|hours|stock|inventory|policies|bookings?)\b/.test(q);
  const customerStock = /\b(?:stock|inventory|availability)\b/.test(q) && /\b(?:customer|customers|we have|we sell|our|my)\b/.test(q);
  return assistant && (owned || customerStock);
}
