const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

passport.serializeUser((user, done) => {
  done(null, user.googleId);
});

passport.deserializeUser(async (googleId, done) => {
  try {
    const params = {
      TableName: 'Users',
      Key: {
        googleId: googleId
      }
    };
    
    const result = await dynamodb.get(params).promise();
    done(null, result.Item);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 기존 사용자 조회
        const params = {
          TableName: 'Users',
          Key: {
            googleId: profile.id
          }
        };
        
        const result = await dynamodb.get(params).promise();
        
        if (result.Item) {
          return done(null, result.Item);
        }
        
        // 새 사용자 생성
        const newUser = {
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          profilePicture: profile.photos[0].value
        };
        
        await dynamodb.put({
          TableName: 'Users',
          Item: newUser
        }).promise();
        
        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;