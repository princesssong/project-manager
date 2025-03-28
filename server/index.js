// 환경변수 불러오기
require('dotenv').config();

// 기본 세팅
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*", // 필요시 프론트 주소로 변경
    methods: ["GET", "POST"]
  }
});

// 미들웨어 설정
app.use(cors());

// 기본 라우트
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// 소켓 통신 예시
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// 포트 설정
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
