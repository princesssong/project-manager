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
app.use(express.json());

// 🧪 기본 라우트
app.get("/api/something", (req, res) => {
  res.send("GET도 잘 받았어!");
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
app.listen(PORT, () => {
  console.log(`✅ Express server running on port ${PORT}`);
});
