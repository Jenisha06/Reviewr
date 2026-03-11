import express from 'express';
import { runReviewAgent } from '../agents/reviewAgent.js';

const router = express.Router();

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

export default router;