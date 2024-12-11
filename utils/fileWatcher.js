const chokidar = require('chokidar');
const AccidentService = require('../services/accident');
const logger = require('./logger');

const setupFileWatcher = () => {
  const watcher = chokidar.watch('./output', {
    ignored: /(^|[\/\\])\../,
    persistent: true
  });

  watcher
    .on('add', async (path) => {
      if (path.endsWith('.csv')) {
        try {
          logger.info(`New CSV file detected: ${path}`);
          await AccidentService.importCSVData(path);
        } catch (error) {
          logger.error(`Error processing file ${path}:`, error);
        }
      }
    })
    .on('change', async (path) => {
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