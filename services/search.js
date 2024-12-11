// services/search.js
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class SearchService {
  static async saveSearch(userId, origin, destination) {
    try {
      const searchItem = {
        id: uuidv4(),
        userId,
        origin,
        destination,
        timestamp: new Date().toISOString()
      };

      await dynamodb.put({
        TableName: 'SearchHistory',
        Item: searchItem
      }).promise();

      return searchItem;
    } catch (error) {
      logger.error('Error saving search:', error);
      throw error;
    }
  }

  static async getSearchHistory(userId) {
    try {
      const params = {
        TableName: 'SearchHistory',
        FilterExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      };

      const result = await dynamodb.scan(params).promise();
      return result.Items;
    } catch (error) {
      logger.error('Error fetching search history:', error);
      throw error;
    }
  }

  static async deleteSearch(userId, searchId) {
    try {
      await dynamodb.delete({
        TableName: 'SearchHistory',
        Key: {
          id: searchId
        }
      }).promise();
    } catch (error) {
      logger.error('Error deleting search:', error);
      throw error;
    }
  }
}

module.exports = SearchService;