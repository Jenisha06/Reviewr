'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, GitPullRequest, Plus, Minus, FileCode, AlertCircle } from 'lucide-react';
import ReviewPanel from './ReviewPanel';

export default function Review() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [activeFile, setActiveFile] = useState(0);
  const [review, setReview] = useState(null);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    const prUrl = searchParams.get('prUrl');
    const token = searchParams.get('token');
    if (!prUrl) { router.push('/'); return; }
    fetchPR(prUrl, token);
  }, []);

  async function fetchPR(prUrl, token) {
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:3001/api/github/pr', { prUrl, token });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch PR.');
    } finally {
      setLoading(false);
    }
  }

  async function runReview() {
    try {
      setReviewing(true);
      const res = await axios.post('http://localhost:3001/api/review/analyze', {
        files: data.files
      });
      setReview(res.data.review);
    } catch (err) {
      console.error('Review failed:', err);
    } finally {
      setReviewing(false);
    }
  }

  if (loading) return (
    <div style={s.fullscreen}>
      <div style={s.spinner} />
      <p style={s.loadingText}>Fetching PR from GitHub...</p>
    </div>
  );

  if (error) return (
    <div style={s.fullscreen}>
      <AlertCircle size={40} color="#f85149" />
      <p style={s.errorText}>{error}</p>
      <button style={s.backBtn} onClick={() => router.push('/')}>
        <ArrowLeft size={14} /> Go back
      </button>
    </div>
  );

  const { pr, files } = data;
  const file = files[activeFile];

  return (
    <div style={{ ...s.page, gridTemplateColumns: review ? '300px 1fr 380px' : '300px 1fr' }}>

      
      <aside style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <button style={s.backBtn} onClick={() => router.push('/')}>
            <ArrowLeft size={13} /> Back
          </button>
          <div style={s.prBadge}>
            <GitPullRequest size={13} color="#f78166" />
            <span style={{ color: '#f78166', fontWeight: 700 }}>#{pr.number}</span>
          </div>
          <p style={s.prTitle}>{pr.title}</p>
          <p style={s.prAuthor}>by {pr.author} · {pr.repoFullName}</p>
          <div style={s.prStats}>
            <span style={s.statGreen}><Plus size={11} />{pr.additions}</span>
            <span style={s.statRed}><Minus size={11} />{pr.deletions}</span>
            <span style={s.statBlue}><FileCode size={11} />{pr.changedFiles}</span>
          </div>
        </div>

        <p style={s.fileListLabel}>Changed Files</p>
        <div style={s.fileList}>
          {files.map((f, i) => (
            <button
              key={f.filename}
              style={{ ...s.fileItem, ...(i === activeFile ? s.fileItemActive : {}) }}
              onClick={() => setActiveFile(i)}
            >
              <span style={{ ...s.fileStatus, ...statusColor(f.status) }}>
                {f.status[0].toUpperCase()}
              </span>
              <div style={s.fileInfo}>
                <span style={s.fileName}>{f.filename.split('/').pop()}</span>
                <span style={s.filePath}>{f.filename}</span>
              </div>
              <div style={s.fileChanges}>
                <span style={s.addBadge}>+{f.additions}</span>
                <span style={s.delBadge}>-{f.deletions}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

    
      <main style={s.main}>
        <div style={s.diffHeader}>
          <span style={s.diffFilename}>{file.filename}</span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={s.addBadge}>+{file.additions}</span>
            <span style={s.delBadge}>-{file.deletions}</span>
            <span style={{ ...s.fileStatus, ...statusColor(file.status), padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
              {file.status}
            </span>
          </div>
        </div>

        <div style={s.diffBody}>
          {file.patch
            ? <DiffViewer patch={file.patch} />
            : <div style={s.noPatch}><FileCode size={32} /><p>No diff available</p></div>
          }
        </div>

        <div style={s.reviewBar}>
          <span style={{ color: '#8b949e', fontSize: '0.78rem' }}>
            {review ? '✅ Review complete' : '🤖 Ready to analyze this PR'}
          </span>
          <button
            style={{
              ...s.reviewBtn,
              opacity: reviewing ? 0.6 : 1,
              cursor: reviewing ? 'not-allowed' : 'pointer'
            }}
            onClick={runReview}
            disabled={reviewing}
          >
            {reviewing ? '⏳ Analyzing...' : '▶ Run AI Review'}
          </button>
        </div>
      </main>

    
      {review && <ReviewPanel review={review} />}
    </div>
  );
}

function DiffViewer({ patch }) {
  const lines = patch.split('\n');
  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: '1.6' }}>
      {lines.map((line, i) => {
        const type = line.startsWith('+') ? 'add'
          : line.startsWith('-') ? 'del'
          : line.startsWith('@@') ? 'hunk' : 'ctx';
        return (
          <div key={i} style={{ ...s.diffLine, ...diffLineStyle(type) }}>
            <span style={s.lineNum}>{i + 1}</span>
            <span style={{ fontWeight: 700, userSelect: 'none', color: diffSignColor(type) }}>
              {type === 'add' ? '+' : type === 'del' ? '-' : ' '}
            </span>
            <span style={{ paddingLeft: '0.5rem', whiteSpace: 'pre', color: diffTextColor(type) }}>
              {line.slice(type === 'hunk' ? 0 : 1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function statusColor(status) {
  return {
    added:    { background: 'rgba(63,185,80,0.12)',  color: '#3fb950' },
    modified: { background: 'rgba(210,153,34,0.12)', color: '#d29922' },
    removed:  { background: 'rgba(248,81,73,0.12)',  color: '#f85149' },
    renamed:  { background: 'rgba(88,166,255,0.12)', color: '#58a6ff' },
  }[status] || {};
}

function diffLineStyle(type) {
  return {
    add:  { background: 'rgba(63,185,80,0.05)',  borderLeft: '2px solid #3fb950' },
    del:  { background: 'rgba(248,81,73,0.05)',  borderLeft: '2px solid #f85149' },
    hunk: { background: '#1c2230',               borderLeft: '2px solid #58a6ff' },
    ctx:  { borderLeft: '2px solid transparent' },
  }[type];
}

function diffSignColor(type) {
  return { add: '#3fb950', del: '#f85149', hunk: '#58a6ff', ctx: 'transparent' }[type];
}

function diffTextColor(type) {
  return { add: '#a0ffa0', del: '#ffa0a0', hunk: '#58a6ff', ctx: '#e6edf3' }[type];
}

const s = {
  page:            { display: 'grid', height: '100vh', overflow: 'hidden', background: '#080a0e' },
  fullscreen:      { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: '#080a0e' },
  spinner:         { width: '40px', height: '40px', border: '3px solid #2a3548', borderTopColor: '#f78166', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText:     { fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 },
  errorText:       { fontSize: '0.9rem', color: '#8b949e', maxWidth: '360px', textAlign: 'center', lineHeight: 1.6 },
  sidebar:         { background: '#0d1117', borderRight: '1px solid #2a3548', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  sidebarHeader:   { padding: '1rem', borderBottom: '1px solid #2a3548', display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  backBtn:         { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: '1px solid #2a3548', color: '#8b949e', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '0.35rem 0.7rem', borderRadius: '4px', cursor: 'pointer', width: 'fit-content' },
  prBadge:         { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' },
  prTitle:         { fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.4 },
  prAuthor:        { fontSize: '0.72rem', color: '#484f58' },
  prStats:         { display: 'flex', gap: '0.5rem' },
  statGreen:       { display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#3fb950', background: 'rgba(63,185,80,0.12)' },
  statRed:         { display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#f85149', background: 'rgba(248,81,73,0.12)' },
  statBlue:        { display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#58a6ff', background: 'rgba(88,166,255,0.12)' },
  fileListLabel:   { fontSize: '0.68rem', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 1rem 0.25rem' },
  fileList:        { flex: 1, overflowY: 'auto', padding: '0 0.5rem 0.5rem' },
  fileItem:        { width: '100%', background: 'none', border: '1px solid transparent', borderRadius: '4px', padding: '0.6rem 0.75rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' },
  fileItemActive:  { background: '#1c2230', border: '1px solid #3d4f6a' },
  fileStatus:      { fontSize: '0.65rem', fontWeight: 700, width: '18px', height: '18px', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  fileInfo:        { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1px' },
  fileName:        { fontSize: '0.8rem', color: '#e6edf3', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  filePath:        { fontSize: '0.68rem', color: '#484f58', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  fileChanges:     { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 },
  addBadge:        { fontSize: '0.65rem', padding: '1px 5px', borderRadius: '3px', fontWeight: 700, color: '#3fb950', background: 'rgba(63,185,80,0.12)' },
  delBadge:        { fontSize: '0.65rem', padding: '1px 5px', borderRadius: '3px', fontWeight: 700, color: '#f85149', background: 'rgba(248,81,73,0.12)' },
  main:            { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  diffHeader:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', background: '#161b22', borderBottom: '1px solid #2a3548' },
  diffFilename:    { fontFamily: 'var(--font-mono)', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  diffBody:        { flex: 1, overflowY: 'auto', background: '#0d1117' },
  diffLine:        { display: 'grid', gridTemplateColumns: '48px 18px 1fr', alignItems: 'baseline', padding: '0 1rem', minHeight: '22px' },
  lineNum:         { color: '#484f58', fontSize: '0.7rem', userSelect: 'none' },
  noPatch:         { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', height: '200px', color: '#484f58' },
  reviewBar:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', background: '#161b22', borderTop: '1px solid #2a3548' },
  reviewBtn:       { background: '#f78166', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.2rem', fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.2s' },
};