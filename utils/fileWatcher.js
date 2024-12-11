// utils/fileWatcher.js
const chokidar = require('chokidar');
const AccidentService = require('../services/accident');
const logger = require('./logger');

const setupFileWatcher = () => {
  // output 디렉토리 감시
  const watcher = chokidar.watch('./output', {
    ignored: /(^|[\/\\])\../, // 숨김 파일 무시
    persistent: true
  });

  // 새로운 CSV 파일이 생성되거나 변경될 때
  watcher.on('add', async (path) => {
    if (path.endsWith('.csv')) {
      try {
        logger.info(`New CSV file detected: ${path}`);
        await AccidentService.importCSVData(path);
      } catch (error) {
        logger.error(`Error processing file ${path}:`, error);
      }
    }
  }).on('change', async (path) => {
    if (path.endsWith('.csv')) {
      try {
        logger.info(`CSV file updated: ${path}`);
        await AccidentService.importCSVData(path);
      } catch (error) {
        logger.error(`Error processing updated file ${path}:`, error);
      }
    }
  });
};

module.exports = setupFileWatcher;