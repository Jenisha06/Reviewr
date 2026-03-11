import express from 'express';
import { runReviewAgent } from '../agents/reviewAgent.js';
import Groq from 'groq-sdk';
import 'dotenv/config';

const router = express.Router();
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/review/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { files } = req.body;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }
    const review = await runReviewAgent(files);
    res.json({ review });
  } catch (err) {
    console.error('Review agent error:', err);
    res.status(500).json({ error: err.message || 'Review failed' });
  }
});

// POST /api/review/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, history, pr, files, review } = req.body;

    // Build context about the PR and review
    const context = `
You are Reviewr, an expert AI code reviewer. You have just reviewed a GitHub PR and must answer questions about it.

PR Details:
- Title: ${pr.title}
- Author: ${pr.author}
- Repo: ${pr.repoFullName}
- Files changed: ${pr.changedFiles}
- Additions: ${pr.additions}, Deletions: ${pr.deletions}

Review Summary:
- Bugs found: ${review.bugs?.length || 0}
- Security issues: ${review.security?.length || 0}
- Performance issues: ${review.performance?.length || 0}
- Style issues: ${review.style?.length || 0}

Full Review:
${JSON.stringify(review, null, 2)}

Answer the developer's questions clearly and helpfully. Be concise but thorough.
If they ask how to fix something, give them actual code examples.
Keep responses under 200 words unless asked for detail.
    `.trim();

    // Build message history for Groq
    const groqMessages = [
      { role: 'system', content: context },
      ...history.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text
      })),
      { role: 'user', content: message }
    ];

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      messages: groqMessages
    });

    const reply = response.choices[0].message.content.trim();
    res.json({ reply });

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message || 'Chat failed' });
  }
});

export default router;