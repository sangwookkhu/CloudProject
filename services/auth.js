// services/auth.js
const User = require('../schemas/user');
const logger = require('../utils/logger');

class AuthService {
  static async handleGoogleCallback(req, res) {
    try {
      res.redirect('/dashboard');
    } catch (error) {
      logger.error('Google callback error:', error);
      res.redirect('/');
    }
  }

  // services/auth.js
  static async logout(req, res) {
    try {
      const userId = req.user?._id;

      // 세션 완전히 삭제
      req.session.destroy((err) => {
        if (err) {
          logger.error('Session destruction error:', err);
          return res.redirect('/dashboard');
        }

        // 사용자가 존재하면 데이터베이스에서 삭제
        if (userId) {
          User.findByIdAndDelete(userId)
            .then(() => {
              logger.info(`User ${userId} successfully deleted`);
              res.redirect('/');
            })
            .catch((error) => {
              logger.error('Error deleting user:', error);
              res.redirect('/');
            });
        } else {
          res.redirect('/');
        }
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.redirect('/');
    }
  }
}

module.exports = AuthService;