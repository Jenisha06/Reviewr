import express from 'express';

const router = express.Router();


router.post('/analyze', async (req, res) => {
  res.json({ message: 'AI review agent coming soon!' });
});

export default router;