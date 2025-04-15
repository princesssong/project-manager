const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let chatHistory = []; // 채팅 기록 저장

io.on('connection', (socket) => {
  console.log('✅ A user connected');

  // 채팅 메시지 수신
  socket.on('chat message', ({ user, msg, time }) => {
    chatHistory.push({ user, msg, time });
    io.emit('chat message', { user, msg, time });
  });

  // 회의록 요약 요청 처리
  socket.on('generate summary', async (callback) => {
    console.log('📨 Received request to generate summary');
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/completions',
        {
          model: 'text-davinci-003',
          prompt: `다음 채팅 내용을 요약하세요:\n\n${chatHistory.map(
            (chat) => `[${chat.time}] ${chat.user}: ${chat.msg}`
          ).join('\n')}\n\n요약:`,
          max_tokens: 150,
        },
        {
          headers: {
            Authorization: `Bearer YOUR_OPENAI_API_KEY`, // OpenAI API 키
          },
        }
      );
      const summary = response.data.choices[0].text.trim();
      console.log('✅ Summary generated:', summary);
      callback({ success: true, summary });
    } catch (error) {
      console.error('❌ Error generating summary:', error);
      callback({ success: false, error: '요약 생성 실패' });
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ A user disconnected');
  });
});

// 서버 실행
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});