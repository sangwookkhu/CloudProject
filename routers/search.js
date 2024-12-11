const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middlewares/auth');
const SearchService = require('../services/search');

router.post('/history', ensureAuth, async (req, res) => {
  try {
    const { origin, destination } = req.body;
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required' });
    }
    const history = await SearchService.saveSearch(req.user.googleId, origin, destination);
    res.status(201).json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save search history' });
  }
});

router.get('/history', ensureAuth, async (req, res) => {
  try {
    const history = await SearchService.getSearchHistory(req.user.googleId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch search history' });
  }
});

router.delete('/history/:historyId', ensureAuth, async (req, res) => {
  try {
    await SearchService.deleteSearch(req.user.googleId, req.params.historyId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete search history' });
  }
});

module.exports = router;