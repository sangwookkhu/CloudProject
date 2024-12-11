const express = require('express');
const router = express.Router();
const AccidentService = require('../services/accident');

// 사고 데이터 가져오기
router.post('/import', async (req, res) => {
 try {
   const count = await AccidentService.importCSVData('./output/new_20241211_11h00m.csv');
   res.json({ message: `Successfully imported ${count} accidents` });
 } catch (error) {
   res.status(500).json({ error: 'Failed to import CSV data' });
 }
});

// 최근 사고 조회
router.get('/recent', async (req, res) => {
 try {
   const accidents = await AccidentService.getRecentAccidents();
   res.json(accidents);
 } catch (error) {
   res.status(500).json({ error: 'Failed to fetch recent accidents' });
 }
});

// 특정 영역 사고 조회
router.get('/area', async (req, res) => {
 try {
   const { minX, maxX, minY, maxY } = req.query;
   const accidents = await AccidentService.getAccidentsByArea(
     parseFloat(minX),
     parseFloat(maxX),
     parseFloat(minY),
     parseFloat(maxY)
   );
   res.json(accidents);
 } catch (error) {
   res.status(500).json({ error: 'Failed to fetch accidents by area' });
 }
});

module.exports = router;