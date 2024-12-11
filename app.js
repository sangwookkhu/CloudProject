require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./configs/passport');
const connectDB = require('./configs/database');
const authRoutes = require('./routers/auth');
const searchRoutes = require('./routers/search');
const accidentRoutes = require('./routers/accident');
const setupFileWatcher = require('./utils/fileWatcher');

const app = express();

// Connect to MongoDB
connectDB();

setupFileWatcher();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/search', searchRoutes); // 수정
app.use('/api/accidents', accidentRoutes);

// Test route
app.get('/', (req, res) => {
  res.send(`
      <h1>Google OAuth 테스트</h1>
      <a href="/auth/google" style="
          display: inline-block;
          background: #4285f4;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
      ">Google로 로그인</a>
  `);
});

app.get('/dashboard', require('./middlewares/auth').ensureAuth, (req, res) => {
  res.send(`
      <h1>대시보드</h1>
      <p>환영합니다, ${req.user.name}님!</p>
      <img src="${req.user.profilePicture}" style="width: 50px; border-radius: 50%;">
      <p>이메일: ${req.user.email}</p>
      <a href="/auth/logout" style="
          display: inline-block;
          background: #dc3545;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
      ">로그아웃</a>
  `);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

