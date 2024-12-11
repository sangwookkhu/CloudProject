const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Issue = require('../schemas/issue');
const User = require('../schemas/user');
const logger = require('../utils/logger');

class IssueService {
  static async createIssue(userId, data) {
    try {
      const issue = new Issue({
        id: uuidv4(),
        userId,
        title: data.title,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        location: `${data.latitude},${data.longitude}`,
        status: 'active',
        createdAt: new Date(),
        type: data.type
      });

      await issue.save();
      await this.notifyNearbyUsers(issue);
      return issue;
    } catch (error) {
      logger.error('Error creating issue:', error);
      throw error;
    }
  }

  static async getIssuesInRadius(latitude, longitude, radiusInKm = 5) {
    try {
      const issues = await Issue.find({ status: 'active' });

      return issues.filter(issue => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          issue.latitude,
          issue.longitude
        );
        return distance <= radiusInKm;
      });
    } catch (error) {
      logger.error('Error fetching issues:', error);
      throw error;
    }
  }

  static async notifyNearbyUsers(issue) {
    try {
      const users = await User.find();

      for (const user of users) {
        if (user.lastLocation) {
          const [userLat, userLng] = user.lastLocation.split(',');
          const distance = this.calculateDistance(
            issue.latitude,
            issue.longitude,
            parseFloat(userLat),
            parseFloat(userLng)
          );

          if (distance <= 5) {
            logger.info(`Notify user ${user._id} about issue ${issue.id}`);
            // Add notification logic here
          }
        }
      }
    } catch (error) {
      logger.error('Error notifying users:', error);
      throw error;
    }
  }

  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  static toRad(degrees) {
    return degrees * (Math.PI / 180);
  }
}

module.exports = IssueService;
