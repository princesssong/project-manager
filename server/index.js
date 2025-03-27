const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());

io.on('connection', (socket) => {
  console.log(`🔌 New user connected: ${socket.id}`);

  // ✅ 클라이언트에서 보낸 'chat message' 이벤트 받기
  socket.on('chat message', ({ user, msg }) => {
    // 모든 클라이언트(보낸 사람 포함)에게 메시지 전송
    io.emit('chat message', { user, msg });
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});


const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
