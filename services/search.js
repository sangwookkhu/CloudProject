const SearchHistory = require('../schemas/searchHistory');
const logger = require('../utils/logger');

class SearchService {
  static async saveSearch(userId, origin, destination) {
    try {
      const searchHistory = new SearchHistory({
        userId,
        origin,
        destination
      });

      await searchHistory.save();
      logger.info(`Search history saved for user ${userId}: ${origin} to ${destination}`);
      return searchHistory;
    } catch (error) {
      logger.error('Error saving search history:', error);
      throw error;
    }
  }

  static async getSearchHistory(userId) {
    try {
      const history = await SearchHistory.find({ userId })
        .sort({ timestamp: -1 }) // 최신 기록부터
        .limit(10); // 최근 10개
      return history;
    } catch (error) {
      logger.error('Error fetching search history:', error);
      throw error;
    }
  }

  static async deleteSearch(userId, historyId) {
    try {
      await SearchHistory.findOneAndDelete({
        _id: historyId,
        userId: userId
      });
      logger.info(`Search history ${historyId} deleted for user ${userId}`);
    } catch (error) {
      logger.error('Error deleting search history:', error);
      throw error;
    }
  }

  static async clearSearchHistory(userId) {
    try {
      await SearchHistory.deleteMany({ userId });
      logger.info(`All search history cleared for user ${userId}`);
    } catch (error) {
      logger.error('Error clearing search history:', error);
      throw error;
    }
  }
}

module.exports = SearchService;