const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

class AuthService {
  static async handleGoogleCallback(req, res) {
    try {
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect('/');
    }
  }

  static async logout(req, res) {
    try {
      const googleId = req.user?.googleId;
      
      if (googleId) {
        const params = {
          TableName: 'Users',
          Key: {
            googleId: googleId
          }
        };
        
        await dynamodb.delete(params).promise();
      }

      req.session.destroy((err) => {
        if (err) {
          console.error('Logout error:', err);
          return res.redirect('/dashboard');
        }
        res.redirect('/');
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.redirect('/');
    }
  }
}

module.exports = AuthService;