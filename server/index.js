// 🌍 환경변수 불러오기
require("dotenv").config();

// 📦 기본 세팅
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");

// 📡 서버 구성
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*", // 필요한 경우 도메인 주소로 변경 가능
    methods: ["GET", "POST"],
  },
});

// 🌐 미들웨어 설정
app.use(cors());

// 🧪 기본 라우트
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// 🔌 소켓 통신
io.on("connection", (socket) => {
  console.log("✅ A user connected");

  // 메시지 수신 및 브로드캐스트
  socket.on("chat message", ({ user, msg, time }) => {
    console.log("📨 Message received:", user, msg, time);
    io.emit("chat message", { user, msg, time }); // 전체 클라이언트에 전송
  });

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected");
  });
});

// 🚀 포트 설정
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// 📦 OpenAI API 호출을 위한 axios 설정
const axios = require("axios"); // OpenAI API 호출용
let chatHistory = []; // 채팅 기록 저장

io.on("connection", (socket) => {
  console.log("✅ A user connected");

  socket.on("chat message", ({ user, msg, time }) => {
    console.log("📨 Message received:", user, msg, time);
    chatHistory.push({ user, msg, time }); // 채팅 기록 저장
    io.emit("chat message", { user, msg, time });
  });

  socket.on("generate summary", async (callback) => {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/completions",
        {
          model: "text-davinci-003",
          prompt: `다음 채팅 내용을 요약하고 제목을 작성하세요:\n\n${chatHistory.map(
            (chat) => `[${chat.time}] ${chat.user}: ${chat.msg}`
          ).join("\n")}\n\n제목:`,
          max_tokens: 150,
        },
        {
          headers: {
            Authorization: `Bearer YOUR_OPENAI_API_KEY`,
          },
        }
      );
      const summary = response.data.choices[0].text.trim();
      callback({ success: true, summary });
    } catch (error) {
      console.error("Error generating summary:", error);
      callback({ success: false, error: "요약 생성 실패" });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected");
  });
});