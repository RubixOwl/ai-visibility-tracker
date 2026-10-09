'use client';

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import knowledge from '../lib/rules_and_knowledge.json';

const greeting = {
  role: 'assistant',
  content: "Hi! Ask me what Alpine Wave does, how setup works, or what happens when the assistant doesn't know an answer."
};

const defaultSuggestions = knowledge.company_faq.slice(0, 3).map(({ question }) => question);

const Chat = forwardRef(function Chat({ isOpen, onClose, onBusyChange }, ref) {
  const [messages, setMessages] = useState([greeting]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState(defaultSuggestions);
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const controller = useRef(null);
  const busy = useRef(false);
  const history = useRef([greeting]);
  const failed = useRef('');

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, pending, error]);

  useEffect(() => () => controller.current?.abort(), []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose?.();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  async function send(value, retry = false) {
    const question = value.trim();
    if (!question || question.length > 800 || busy.current) return;
    busy.current = true;
    onBusyChange?.(true);
    setPending(true);
    setError('');
    setInput('');
    const context = history.current.slice(-16);
    if (!retry) setMessages(current => [...current, { role: 'user', content: question }]);
    controller.current = new AbortController();
    const timeout = setTimeout(() => controller.current?.abort(), 12000);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history: context }),
        signal: controller.current.signal,
      });
      const data = await response.json();
      if (!response.ok || typeof data.answer !== 'string') throw new Error('unavailable');
      const answer = { role: 'assistant', content: data.answer };
      history.current = [...history.current, { role: 'user', content: question }, answer].slice(-16);
      setMessages(current => [...current, answer]);
      setSuggestions(data.suggestions && data.suggestions.length ? data.suggestions : defaultSuggestions);
      failed.current = '';
    } catch {
      failed.current = question;
      setError('The reply could not be loaded. Please retry, or read the questions below.');
    } finally {
      clearTimeout(timeout);
      busy.current = false;
      setPending(false);
      onBusyChange?.(false);
    }
  }

  useImperativeHandle(ref, () => ({
    ask: value => { send(value); },
    focus: () => inputRef.current?.focus(),
    reset: () => {
      if (busy.current) return;
      history.current = [greeting];
      failed.current = '';
      setMessages([greeting]);
      setError('');
      setInput('');
      setSuggestions(defaultSuggestions);
    }
  }));

  return (
    <div
      className={`chat-drawer${isOpen ? ' open' : ''}`}
      id="chat-drawer"
      role="dialog"
      aria-label="Chat with Alpine Wave"
      style={{ display: isOpen ? 'flex' : 'none' }}
    >
      <div className="drawer-head">
        <div className="drawer-title"><span className="chat-online" /> Alpine Wave</div>
        <button className="drawer-close" onClick={onClose} aria-label="Close chat" type="button">✕</button>
      </div>
      <div className="drawer-body" ref={logRef} id="drawer-messages" role="log" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`d-bubble ${m.role === 'user' ? 'd-guest' : 'd-bot'}`}>
            {m.content}
          </div>
        ))}
        {pending && (
          <div className="d-bubble d-bot" role="status">
            Finding an answer…
          </div>
        )}
        {error && (
          <div className="d-bubble d-bot" style={{ color: '#E04410' }}>
            {error}{' '}
            <button
              type="button"
              onClick={() => send(failed.current, true)}
              disabled={pending}
              style={{ textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
            >
              Retry
            </button>
          </div>
        )}
      </div>
      <div className="drawer-suggest" id="drawer-suggest">
        {suggestions.map((q, idx) => (
          <button key={idx} type="button" onClick={() => send(q)} disabled={pending}>
            {q}
          </button>
        ))}
      </div>
      <form className="drawer-foot" onSubmit={e => { e.preventDefault(); send(input); }}>
        <label htmlFor="drawer-input" className="sr-only">Your question</label>
        <input
          type="text"
          id="drawer-input"
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          className="drawer-input"
          placeholder="Ask a question…"
          autoComplete="off"
          maxLength={800}
        />
        <button type="submit" className="drawer-send" aria-label="Send" disabled={pending}>↑</button>
      </form>
      <p className="drawer-note">Prepared answers · no staff hand-off yet</p>
    </div>
  );
});

export default Chat;
