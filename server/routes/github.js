import express from 'express';
import axios from 'axios';

const router = express.Router();


function parsePRUrl(url) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (!match) throw new Error('Invalid GitHub PR URL');
  return { owner: match[1], repo: match[2], prNumber: match[3] };
}


function githubHeaders(token) {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}


router.post('/pr', async (req, res) => {
  try {
    const { prUrl, token } = req.body;
    if (!prUrl) return res.status(400).json({ error: 'prUrl is required' });

    const { owner, repo, prNumber } = parsePRUrl(prUrl);
    const headers = githubHeaders(token || process.env.GITHUB_TOKEN);
    const base = `https://api.github.com/repos/${owner}/${repo}`;

    
    const [prRes, filesRes] = await Promise.all([
      axios.get(`${base}/pulls/${prNumber}`, { headers }),
      axios.get(`${base}/pulls/${prNumber}/files`, { headers, params: { per_page: 100 } })
    ]);

    const pr = prRes.data;
    const files = filesRes.data;

    const diffFiles = files.map(f => ({
      filename: f.filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
      changes: f.changes,
      patch: f.patch || null,
      raw_url: f.raw_url,
      blob_url: f.blob_url
    }));

    res.json({
      pr: {
        number: pr.number,
        title: pr.title,
        body: pr.body,
        author: pr.user.login,
        authorAvatar: pr.user.avatar_url,
        state: pr.state,
        createdAt: pr.created_at,
        baseBranch: pr.base.ref,
        headBranch: pr.head.ref,
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.changed_files,
        repoFullName: pr.base.repo.full_name,
        prUrl: pr.html_url
      },
      files: diffFiles
    });

  } catch (err) {
    if (err.response?.status === 404)
      return res.status(404).json({ error: 'PR not found. Check the URL or make the repo public.' });
    if (err.response?.status === 403)
      return res.status(403).json({ error: 'GitHub rate limit hit. Add a GitHub token.' });
    res.status(500).json({ error: err.message });
  }
});

export default router;