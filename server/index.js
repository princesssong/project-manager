// 🌍 환경변수 불러오기
require("dotenv").config();

// 📦 기본 세팅
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // 키를 환경변수에서 불러옴
const gemini = new GoogleGenerativeAI(GEMINI_API_KEY);

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

// 📝 채팅 기록 저장 (메모리 기반, 실제 앱에서는 DB 사용 권장)
// 테스트를 위한 더미 데이터 실제 기능을 사용하기 위해 빈배열로 바꿔야함
let chatHistory = [];

// Gemini를 이용한 회의 요약 함수
async function summarizeChat(chatHistory) {
  const prompt = `다음 채팅 내용을 한두 줄로 회의 요약해줘:\n\n${chatHistory.map(
    chat => `[${chat.time}] ${chat.user}: ${chat.msg}`
  ).join('\n')}\n\n요약:`;

  console.log("Gemini로 보낼 프롬프트:", prompt); // 추가

  try {
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    return text ? text.trim() : "요약 생성 실패";
  } catch (error) {
    console.error("서버 에러가 발생했습니다:", error);
    return "요약 생성 실패";
  }
}

// 🔌 소켓 통신
io.on("connection", (socket) => {
  console.log("✅ A user connected");

  // 메시지 수신 및 브로드캐스트
  socket.on("chat message", ({ user, msg, time }) => {
    console.log("📨 Message received:", user, msg, time);
    chatHistory.push({ user, msg, time });
    io.emit("chat message", { user, msg, time }); // 전체 클라이언트에 전송
    console.log("채팅 저장됨:", chatHistory); // 로그로 저장 확인
  });

    // 회의록 요약 요청 처리
  socket.on("generate summary", async (callback) => {
    console.log("✅ [서버] generate summary 요청 도착");
    const recentChatHistory = chatHistory.slice(-10); // 최근 10개만 요약
    console.log("요약에 사용될 chatHistory:", recentChatHistory); // 추가!
    const summary = await summarizeChat(recentChatHistory);
    callback({ success: true, summary });
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
