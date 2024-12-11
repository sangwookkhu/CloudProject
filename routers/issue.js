const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middlewares/auth');
const IssueService = require('../services/issue');

// 새 이슈 생성
router.post('/', ensureAuth, async (req, res) => {
  try {
    const issue = await IssueService.createIssue(req.user.googleId, req.body);
    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

// 반경 내 이슈 조회
router.get('/nearby', ensureAuth, async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const issues = await IssueService.getIssuesInRadius(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius) || 5
    );
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch nearby issues' });
  }
});

module.exports = router;