require('dotenv').config();
const express = require('express');
const session = require('express-session');
const DynamoDBStore = require('connect-dynamodb')(session);
const AWS = require('aws-sdk');
const WebSocket = require('ws');
const passport = require('./configs/passport');
const authRoutes = require('./routers/auth');
const searchRoutes = require('./routers/search');
const accidentRoutes = require('./routers/accident');
const issueRoutes = require('./routers/issue');
const dockerManager = require('./utils/dockerManager');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// AWS 설정
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN
});

// DynamoDB 세션 스토어 설정
const dynamoDBStoreOptions = {
  table: 'Sessions',
  AWSConfigJSON: {
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
  },
  reapInterval: 24 * 60 * 60 * 1000
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration with DynamoDB
app.use(
  session({
    store: new DynamoDBStore(dynamoDBStoreOptions),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/accidents', accidentRoutes);
app.use('/api/issues', issueRoutes);

wss.on('connection', (ws, req) => {
  const userId = req.session?.passport?.user;
  if (userId) {
    ws.userId = userId;
  }

  ws.on('message', (message) => {
    const data = JSON.parse(message);
  });
});

global.wss = wss;

const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  try {
    // Docker 컨테이너 자동 시작
    await dockerManager.startContainer();
    console.log('Docker container initialized');
    
    // 파일 감시 시작
    setupFileWatcher();
  } catch (error) {
    console.error('Failed to initialize Docker container:', error);
  }
});