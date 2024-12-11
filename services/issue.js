const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const logger = require('../utils/logger');

class IssueService {
  // 이슈 생성
  static async createIssue(userId, data) {
    try {
      const issue = {
        id: uuidv4(),
        userId,
        title: data.title,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        location: `${data.latitude},${data.longitude}`,
        status: 'active',
        createdAt: new Date().toISOString(),
        type: data.type // 사고유형, 도로파손 등
      };

      await dynamodb.put({
        TableName: 'Issues',
        Item: issue
      }).promise();

      // 근처 사용자들에게 알림 전송
      await this.notifyNearbyUsers(issue);
      return issue;
    } catch (error) {
      logger.error('Error creating issue:', error);
      throw error;
    }
  }

  // 반경 내 이슈 조회
  static async getIssuesInRadius(latitude, longitude, radiusInKm = 5) {
    try {
      const result = await dynamodb.scan({
        TableName: 'Issues',
        FilterExpression: 'status = :status',
        ExpressionAttributeValues: {
          ':status': 'active'
        }
      }).promise();

      // 반경 내 이슈 필터링
      const issues = result.Items.filter(issue => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          issue.latitude,
          issue.longitude
        );
        return distance <= radiusInKm;
      });

      return issues;
    } catch (error) {
      logger.error('Error fetching issues:', error);
      throw error;
    }
  }

  // 근처 사용자 알림
  static async notifyNearbyUsers(issue) {
    try {
      // 활성 사용자 조회
      const users = await dynamodb.scan({
        TableName: 'Users'
      }).promise();

      // 반경 5km 내 사용자 필터링 및 알림 전송
      for (const user of users.Items) {
        if (user.lastLocation) {
          const [userLat, userLng] = user.lastLocation.split(',');
          const distance = this.calculateDistance(
            issue.latitude,
            issue.longitude,
            parseFloat(userLat),
            parseFloat(userLng)
          );

          if (distance <= 5) {
            await this.sendNotification(user.id, {
              type: 'NEW_ISSUE',
              title: '새로운 이슈 발생',
              message: `${issue.title} - ${issue.description}`,
              issueId: issue.id
            });
          }
        }
      }
    } catch (error) {
      logger.error('Error notifying users:', error);
      throw error;
    }
  }

  // 알림 전송
  static async sendNotification(userId, notification) {
    try {
      const notificationItem = {
        id: uuidv4(),
        userId,
        ...notification,
        createdAt: new Date().toISOString(),
        read: false
      };

      await dynamodb.put({
        TableName: 'Notifications',
        Item: notificationItem
      }).promise();

      // WebSocket을 통한 실시간 알림 전송
      global.wss?.clients.forEach(client => {
        if (client.userId === userId && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(notification));
        }
      });
    } catch (error) {
      logger.error('Error sending notification:', error);
      throw error;
    }
  }

  // 거리 계산 (Haversine formula)
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 지구 반경 (km)
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