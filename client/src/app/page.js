'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GitPullRequest, Zap, Shield, MessageSquare, ChevronRight, Github } from 'lucide-react';

const EXAMPLE_PRS = [
  'https://github.com/facebook/react/pull/27312',
  'https://github.com/vercel/next.js/pull/58723',
];

export default function Home() {
  const [prUrl, setPrUrl] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!prUrl.trim()) return setError('Please enter a GitHub PR URL');
    if (!prUrl.includes('github.com') || !prUrl.includes('/pull/')) {
      return setError('Please enter a valid GitHub PR URL');
    }
    const params = new URLSearchParams({ prUrl, token });
    router.push(`/review?${params.toString()}`);
  }

  return (
    <div style={s.page}>
      <div style={s.grid} />
      <div style={s.scanline} />

   
      <nav style={s.nav}>
        <div style={s.logo}>
          <span style={s.logoBracket}>[</span>
          <span>reviewr</span>
          <span style={s.logoBracket}>]</span>
        </div>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={s.navLink}>
          <Github size={15} /> GitHub
        </a>
      </nav>

    
      <main style={s.hero}>
        <div className="animate-fade-up" style={s.badge}>
          <Zap size={12} /> Powered by Claude AI · Multi-pass analysis
        </div>

        <h1 className="animate-fade-up delay-1" style={s.title}>
          Code reviews that<br />
          <span style={s.titleAccent}>think like a senior engineer.</span>
        </h1>

        <p className="animate-fade-up delay-2" style={s.subtitle}>
          Paste any GitHub PR URL. Reviewr runs a multi-pass AI analysis —
          bugs, security, performance, and style — in seconds.
        </p>

      
        <form className="animate-fade-up delay-3" style={s.form} onSubmit={handleSubmit}>
          <div style={s.inputRow}>
            <div style={s.inputWrap}>
              <GitPullRequest size={17} style={s.inputIcon} />
              <input
                style={s.input}
                type="text"
                placeholder="https://github.com/owner/repo/pull/123"
                value={prUrl}
                onChange={e => setPrUrl(e.target.value)}
                spellCheck={false}
              />
            </div>
            <button type="submit" style={s.submitBtn}>
              Analyze PR <ChevronRight size={17} />
            </button>
          </div>

          <button type="button" style={s.tokenToggle} onClick={() => setShowToken(v => !v)}>
            {showToken ? '− Hide' : '+ Add'} GitHub token (for private repos)
          </button>

          {showToken && (
            <input
              style={{ ...s.input, paddingLeft: '1rem', marginTop: '0.5rem' }}
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={token}
              onChange={e => setToken(e.target.value)}
            />
          )}

          {error && <p style={s.error}>{error}</p>}
        </form>

     
        <div className="animate-fade-up delay-4" style={s.examples}>
          <span style={s.examplesLabel}>Try an example:</span>
          <div style={s.examplesList}>
            {EXAMPLE_PRS.map(url => (
              <button key={url} style={s.chip} onClick={() => setPrUrl(url)}>
                {url.replace('https://github.com/', '')}
              </button>
            ))}
          </div>
        </div>
      </main>

    
      <section className="animate-fade-up delay-5" style={s.features}>
        {[
          { icon: <Shield size={20} />, title: 'Security Scan', desc: 'Detects injections, insecure patterns, exposed secrets' },
          { icon: <Zap size={20} />, title: 'Performance', desc: 'Spots N+1 queries, memory leaks, inefficient algorithms' },
          { icon: <GitPullRequest size={20} />, title: 'Bug Detection', desc: 'Catches logic errors, edge cases, null pointer risks' },
          { icon: <MessageSquare size={20} />, title: 'Ask Reviewr', desc: 'Chat with the AI about any line in your PR' },
        ].map(f => (
          <div key={f.title} style={s.featureCard}>
            <div style={s.featureIcon}>{f.icon}</div>
            <h3 style={s.featureTitle}>{f.title}</h3>
            <p style={s.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </section>

      <footer style={s.footer}>
        Reviewr 
      </footer>
    </div>
  );
}

const s = {
  page:         { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 1.5rem', position: 'relative', overflow: 'hidden' },
  grid:         { position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(#2a3548 1px, transparent 1px), linear-gradient(90deg, #2a3548 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.2, pointerEvents: 'none', zIndex: 0 },
  scanline:     { position: 'fixed', top: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(transparent, rgba(247,129,102,0.03), transparent)', pointerEvents: 'none', zIndex: 0, animation: 'scanline 8s linear infinite' },
  nav:          { position: 'relative', zIndex: 10, width: '100%', maxWidth: '900px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 0', borderBottom: '1px solid #2a3548' },
  logo:         { fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' },
  logoBracket:  { color: '#f78166' },
  navLink:      { display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8b949e', textDecoration: 'none', fontSize: '0.8rem', padding: '0.4rem 0.75rem', border: '1px solid #2a3548', borderRadius: '4px' },
  hero:         { position: 'relative', zIndex: 10, width: '100%', maxWidth: '900px', padding: '5rem 0 3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem' },
  badge:        { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#f78166', background: 'rgba(247,129,102,0.08)', border: '1px solid rgba(247,129,102,0.2)', padding: '0.35rem 0.85rem', borderRadius: '100px', letterSpacing: '0.04em', textTransform: 'uppercase' },
  title:        { fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em' },
  titleAccent:  { color: '#f78166', display: 'block' },
  subtitle:     { fontSize: '0.95rem', color: '#8b949e', lineHeight: 1.8, maxWidth: '560px' },
  form:         { width: '100%', maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  inputRow:     { display: 'flex', gap: '0.5rem' },
  inputWrap:    { position: 'relative', flex: 1 },
  inputIcon:    { position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#484f58', pointerEvents: 'none' },
  input:        { width: '100%', background: '#161b22', border: '1px solid #2a3548', color: '#e6edf3', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '0.85rem 1rem 0.85rem 2.8rem', borderRadius: '8px', outline: 'none' },
  submitBtn:    { display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f78166', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.85rem 1.4rem', fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },
  tokenToggle:  { background: 'none', border: 'none', color: '#484f58', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', cursor: 'pointer', textAlign: 'left', padding: 0 },
  error:        { color: '#f85149', fontSize: '0.8rem', padding: '0.5rem 0.75rem', background: 'rgba(248,81,73,0.12)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: '4px' },
  examples:     { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' },
  examplesLabel:{ fontSize: '0.75rem', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em' },
  examplesList: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' },
  chip:         { background: '#161b22', border: '1px solid #2a3548', color: '#8b949e', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', padding: '0.3rem 0.7rem', borderRadius: '4px', cursor: 'pointer' },
  features:     { position: 'relative', zIndex: 10, width: '100%', maxWidth: '900px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', border: '1px solid #2a3548', borderRadius: '12px', overflow: 'hidden', marginBottom: '3rem' },
  featureCard:  { background: '#161b22', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRight: '1px solid #2a3548' },
  featureIcon:  { color: '#f78166', marginBottom: '0.25rem' },
  featureTitle: { fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700 },
  featureDesc:  { fontSize: '0.78rem', color: '#8b949e', lineHeight: 1.6 },
  footer:       { position: 'relative', zIndex: 10, padding: '1.5rem 0', fontSize: '0.75rem', color: '#484f58', borderTop: '1px solid #2a3548', width: '100%', maxWidth: '900px', textAlign: 'center', marginTop: 'auto' },
};