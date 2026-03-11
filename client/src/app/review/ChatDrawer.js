'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';

export default function ChatDrawer({ pr, files, review }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hey! I've reviewed **${pr.title}**. I found ${Object.values(review).flat().length} issues across bugs, security, performance and style. What would you like to know?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', text: input.trim() };
    setMessages(v => [...v, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/review/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          history: messages,
          pr,
          files,
          review
        })
      });
      const data = await res.json();
      setMessages(v => [...v, { role: 'assistant', text: data.reply }]);
    } catch {
      setMessages(v => [...v, { role: 'assistant', text: 'Sorry, something went wrong. Try again!' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button style={s.fab} onClick={() => setOpen(v => !v)}>
        <MessageSquare size={20} />
        <span>Ask Reviewr</span>
        {Object.values(review).flat().length > 0 && (
          <span style={s.fabBadge}>{Object.values(review).flat().length}</span>
        )}
      </button>

      {/* Drawer */}
      {open && (
        <div style={s.drawer}>
          {/* Header */}
          <div style={s.drawerHeader}>
            <div style={s.drawerTitle}>
              <Bot size={16} color="#f78166" />
              <span>Ask Reviewr</span>
            </div>
            <button style={s.closeBtn} onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={s.messages}>
            {messages.map((msg, i) => (
              <div key={i} style={{ ...s.msgRow, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={s.avatar}><Bot size={13} color="#f78166" /></div>
                )}
                <div style={{
                  ...s.bubble,
                  ...(msg.role === 'user' ? s.bubbleUser : s.bubbleBot)
                }}>
                  {msg.text}
                </div>
                {msg.role === 'user' && (
                  <div style={s.avatarUser}><User size={13} color="#8b949e" /></div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ ...s.msgRow, justifyContent: 'flex-start' }}>
                <div style={s.avatar}><Bot size={13} color="#f78166" /></div>
                <div style={{ ...s.bubble, ...s.bubbleBot }}>
                  <span style={s.typing}>●●●</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          {messages.length === 1 && (
            <div style={s.suggestions}>
              {[
                'What is the most critical issue?',
                'How do I fix the security bugs?',
                'Give me a summary of all issues',
              ].map(q => (
                <button key={q} style={s.suggestionChip} onClick={() => setInput(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form style={s.inputRow} onSubmit={sendMessage}>
            <input
              style={s.input}
              placeholder="Ask about any issue..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" style={s.sendBtn} disabled={loading || !input.trim()}>
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

const s = {
  fab:           { position: 'fixed', bottom: '2rem', right: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f78166', color: '#fff', border: 'none', borderRadius: '100px', padding: '0.75rem 1.25rem', fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 24px rgba(247,129,102,0.4)', zIndex: 100, transition: 'all 0.2s' },
  fabBadge:      { background: '#fff', color: '#f78166', fontSize: '0.65rem', fontWeight: 800, padding: '1px 6px', borderRadius: '100px' },
  drawer:        { position: 'fixed', bottom: '5.5rem', right: '2rem', width: '380px', height: '520px', background: '#0d1117', border: '1px solid #2a3548', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 100, animation: 'fadeUp 0.2s ease both' },
  drawerHeader:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderBottom: '1px solid #2a3548', background: '#161b22' },
  drawerTitle:   { display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700 },
  closeBtn:      { background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  messages:      { flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  msgRow:        { display: 'flex', alignItems: 'flex-end', gap: '0.5rem' },
  avatar:        { width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(247,129,102,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarUser:    { width: '24px', height: '24px', borderRadius: '50%', background: '#2a3548', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bubble:        { maxWidth: '80%', padding: '0.6rem 0.85rem', borderRadius: '10px', fontSize: '0.82rem', lineHeight: 1.6 },
  bubbleBot:     { background: '#161b22', color: '#e6edf3', borderBottomLeftRadius: '3px', border: '1px solid #2a3548' },
  bubbleUser:    { background: '#f78166', color: '#fff', borderBottomRightRadius: '3px' },
  typing:        { letterSpacing: '0.15em', animation: 'pulse 1.5s ease infinite', color: '#484f58' },
  suggestions:   { padding: '0 1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  suggestionChip:{ background: '#161b22', border: '1px solid #2a3548', color: '#8b949e', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' },
  inputRow:      { display: 'flex', gap: '0.5rem', padding: '0.75rem', borderTop: '1px solid #2a3548', background: '#161b22' },
  input:         { flex: 1, background: '#0d1117', border: '1px solid #2a3548', color: '#e6edf3', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', padding: '0.6rem 0.85rem', borderRadius: '8px', outline: 'none' },
  sendBtn:       { background: '#f78166', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
};