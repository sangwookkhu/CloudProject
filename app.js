// app.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const DynamoDBStore = require('connect-dynamodb')(session);
const AWS = require('aws-sdk');
const WebSocket = require('ws');
const passport = require('./configs/passport');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const authRoutes = require('./routers/auth');
const searchRoutes = require('./routers/search');
const accidentRoutes = require('./routers/accident');
const issueRoutes = require('./routers/issue');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// AWS 설정
AWS.config.update({ region: 'ap-northeast-2' }); // EC2 IAM 역할 사용

// Swagger 설정
const swaggerOptions = {
 definition: {
   openapi: '3.0.0',
   info: {
     title: '실시간 교통 이슈 API',
     version: '1.0.0',
     description: '실시간 교통 이슈 알림 및 경로 안내 서비스 API',
   },
   servers: [
     {
       url: 'http://localhost:3000',
       description: '개발 서버',
     },
     {
       url: 'your-ec2-domain',
       description: '운영 서버',
     },
   ],
   components: {
     securitySchemes: {
       googleAuth: {
         type: 'oauth2',
         description: 'Google OAuth2',
         flows: {
           implicit: {
             authorizationUrl: 'http://localhost:3000/auth/google',
             scopes: {}
           }
         }
       }
     }
   }
 },
 apis: ['./routers/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// DynamoDB 세션 스토어 설정
const dynamoDBStoreOptions = {
 table: 'Sessions',
 AWSConfigJSON: {
   region: 'ap-northeast-2'
 },
 reapInterval: 24 * 60 * 60 * 1000
};

// Middleware
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
     maxAge: 24 * 60 * 60 * 1000 // 24 hours
   }
 })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/accidents', accidentRoutes);
app.use('/api/issues', issueRoutes);

// WebSocket 연결 관리
wss.on('connection', (ws, req) => {
 const userId = req.session?.passport?.user;
 if (userId) {
   ws.userId = userId;
 }

 ws.on('message', (message) => {
   const data = JSON.parse(message);
   // 위치 업데이트 등의 처리
 });
});

global.wss = wss;

// Test route
app.get('/', (req, res) => {
   res.send(`
       <h1>Google OAuth 테스트</h1>
       <a href="/auth/google">Google로 로그인</a>
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
server.listen(PORT, () => {
 console.log(`Server is running on port ${PORT}`);
 console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});