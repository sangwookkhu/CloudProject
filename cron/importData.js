// cron/importData.js
const cron = require('node-cron');
const AccidentService = require('../services/accident');
const logger = require('../utils/logger');

// 매시간 데이터 업데이트
cron.schedule('0 * * * *', async () => {
  try {
    const count = await AccidentService.importCSVData('./output/new_20241211_11h00m.csv');
    logger.info(`Cron job: Successfully imported ${count} accidents`);
  } catch (error) {
    logger.error('Cron job: Failed to import CSV data:', error);
  }
});