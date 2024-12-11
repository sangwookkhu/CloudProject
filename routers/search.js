const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middlewares/auth');
const SearchService = require('../services/search');

// 경로 검색 기록 저장
router.post('/history', ensureAuth, async (req, res) => {
  try {
    const { origin, destination } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required' });
    }

    const history = await SearchService.saveSearch(req.user._id, origin, destination);
    res.status(201).json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save search history' });
  }
});

// 검색 기록 조회
router.get('/history', ensureAuth, async (req, res) => {
  try {
    const history = await SearchService.getSearchHistory(req.user._id);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch search history' });
  }
});

// 특정 검색 기록 삭제
router.delete('/history/:historyId', ensureAuth, async (req, res) => {
  try {
    await SearchService.deleteSearch(req.user._id, req.params.historyId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete search history' });
  }
});

// 모든 검색 기록 삭제
router.delete('/history', ensureAuth, async (req, res) => {
  try {
    await SearchService.clearSearchHistory(req.user._id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear search history' });
  }
});

module.exports = router;