'use client';

import { useState } from 'react';
import { Shield, Zap, GitPullRequest, Code, ChevronDown, ChevronUp, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const PASSES = [
  { key: 'bugs',        label: 'Bugs',        icon: <GitPullRequest size={15} />, color: '#f85149' },
  { key: 'security',    label: 'Security',    icon: <Shield size={15} />,         color: '#f78166' },
  { key: 'performance', label: 'Performance', icon: <Zap size={15} />,            color: '#d29922' },
  { key: 'style',       label: 'Style',       icon: <Code size={15} />,           color: '#58a6ff' },
];

export default function ReviewPanel({ review }) {
  const [activePass, setActivePass] = useState('bugs');
  const [expanded, setExpanded] = useState({});

  const totalIssues = Object.values(review).flat().length;
  const criticalCount = Object.values(review).flat().filter(i => i.severity === 'critical').length;

  function toggleExpand(key) {
    setExpanded(v => ({ ...v, [key]: !v[key] }));
  }

  const issues = review[activePass] || [];

  return (
    <div style={s.panel}>

      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.headerTitle}>AI Review</span>
          <span style={s.totalBadge}>{totalIssues} issues</span>
          {criticalCount > 0 && (
            <span style={s.criticalBadge}>🔴 {criticalCount} critical</span>
          )}
        </div>
        <div style={s.healthScore}>
          <span style={s.healthLabel}>Health</span>
          <span style={{ ...s.healthValue, color: scoreColor(totalIssues) }}>
            {calcScore(totalIssues)}/100
          </span>
        </div>
      </div>

      
      <div style={s.tabs}>
        {PASSES.map(p => {
          const count = (review[p.key] || []).length;
          const isActive = activePass === p.key;
          return (
            <button
              key={p.key}
             style={{ ...s.tab, ...(isActive ? { ...s.tabActive, borderBottom: `2px solid ${p.color}` } : {}) }}
              onClick={() => setActivePass(p.key)}
            >
              <span style={{ color: isActive ? p.color : '#484f58' }}>{p.icon}</span>
              <span style={{ color: isActive ? '#e6edf3' : '#8b949e' }}>{p.label}</span>
              {count > 0 && (
                <span style={{ ...s.countBadge, background: isActive ? p.color : '#2a3548', color: isActive ? '#fff' : '#8b949e' }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

     
      <div style={s.issuesList}>
        {issues.length === 0 ? (
          <div style={s.noIssues}>
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <p>No {activePass} issues found</p>
          </div>
        ) : (
          issues.map((issue, i) => (
            <div key={i} style={{ ...s.issueCard, borderLeftColor: severityColor(issue.severity) }}>
              <div style={s.issueHeader} onClick={() => toggleExpand(`${activePass}-${i}`)}>
                <div style={s.issueLeft}>
                  {severityIcon(issue.severity)}
                  <div>
                    <p style={s.issueTitle}>{issue.title}</p>
                    <p style={s.issueLine}>Line {issue.line}</p>
                  </div>
                </div>
                <div style={s.issueRight}>
                  <span style={{ ...s.severityBadge, background: severityBg(issue.severity), color: severityColor(issue.severity) }}>
                    {issue.severity}
                  </span>
                  {expanded[`${activePass}-${i}`]
                    ? <ChevronUp size={14} color="#484f58" />
                    : <ChevronDown size={14} color="#484f58" />
                  }
                </div>
              </div>

              {expanded[`${activePass}-${i}`] && (
                <div style={s.issueBody}>
                  <p style={s.issueDesc}>{issue.description}</p>
                  <div style={s.suggestion}>
                    <span style={s.suggestionLabel}>💡 Suggestion</span>
                    <p style={s.suggestionText}>{issue.suggestion}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function calcScore(total) {
  return Math.max(0, 100 - (total * 7));
}
function scoreColor(total) {
  const score = calcScore(total);
  if (score >= 80) return '#3fb950';
  if (score >= 50) return '#d29922';
  return '#f85149';
}
function severityColor(s) {
  return { critical: '#f85149', warning: '#d29922', info: '#58a6ff' }[s] || '#8b949e';
}
function severityBg(s) {
  return { critical: 'rgba(248,81,73,0.12)', warning: 'rgba(210,153,34,0.12)', info: 'rgba(88,166,255,0.12)' }[s] || '';
}
function severityIcon(s) {
  const props = { size: 15, color: severityColor(s) };
  return s === 'critical' ? <AlertCircle {...props} />
    : s === 'warning' ? <AlertTriangle {...props} />
    : <Info {...props} />;
}

const s = {
  panel:          { display: 'flex', flexDirection: 'column', height: '100%', background: '#0d1117', borderLeft: '1px solid #2a3548' },
  header:         { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid #2a3548' },
  headerLeft:     { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  headerTitle:    { fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, color: '#e6edf3' },
  totalBadge:     { fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#2a3548', color: '#8b949e' },
  criticalBadge:  { fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(248,81,73,0.12)', color: '#f85149' },
  healthScore:    { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  healthLabel:    { fontSize: '0.65rem', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.06em' },
  healthValue:    { fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800 },
  tabs:           { display: 'flex', borderBottom: '1px solid #2a3548' },
  tab:            { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.6rem 0.25rem', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.15s' },
  tabActive:      { background: 'rgba(247,129,102,0.04)' },
  countBadge:     { fontSize: '0.65rem', padding: '1px 6px', borderRadius: '100px', fontWeight: 700 },
  issuesList:     { flex: 1, overflowY: 'auto', padding: '0.5rem' },
  noIssues:       { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '120px', color: '#484f58', fontSize: '0.82rem' },
  issueCard:      { background: '#161b22', border: '1px solid #2a3548', borderLeft: '3px solid', borderRadius: '6px', marginBottom: '0.5rem', overflow: 'hidden' },
  issueHeader:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0.75rem', cursor: 'pointer' },
  issueLeft:      { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  issueTitle:     { fontSize: '0.8rem', fontWeight: 700, color: '#e6edf3', marginBottom: '2px' },
  issueLine:      { fontSize: '0.68rem', color: '#484f58' },
  issueRight:     { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  severityBadge:  { fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' },
  issueBody:      { padding: '0 0.75rem 0.75rem', borderTop: '1px solid #2a3548' },
  issueDesc:      { fontSize: '0.78rem', color: '#8b949e', lineHeight: 1.6, padding: '0.6rem 0' },
  suggestion:     { background: 'rgba(63,185,80,0.06)', border: '1px solid rgba(63,185,80,0.15)', borderRadius: '4px', padding: '0.6rem 0.75rem' },
  suggestionLabel:{ fontSize: '0.7rem', fontWeight: 700, color: '#3fb950', display: 'block', marginBottom: '0.25rem' },
  suggestionText: { fontSize: '0.78rem', color: '#8b949e', lineHeight: 1.6 },
};