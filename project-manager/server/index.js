// 🌍 환경변수 불러오기
require("dotenv").config();
// 📦 기본 세팅
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require("./db"); // ← MySQL 연결 객체 불러오기 (server/db.js가 있어야 함)

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
let chatHistory = [];

// MySQL 날짜 포맷 함수
function formatDateToMySQL(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

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

  // chat message 이벤트를 하나로 통합 (메모리 저장 + DB 저장 + 브로드캐스트)
  socket.on("chat message", ({ user, msg, createdAt, projectId, time }) => {
    const timestamp = formatDateToMySQL(createdAt || new Date());
    const displayTime = time || timestamp;

    // 1) 메모리 기록 (요약용)
    chatHistory.push({ user, msg, time: displayTime });

    // 2) DB 저장
    const checkUser = `SELECT 1 FROM users WHERE id = ? LIMIT 1`;
    db.query(checkUser, [user], (err, userResult) => {
      if (err || userResult.length === 0) {
        console.error("❌ 존재하지 않는 사용자:", user);
        return;
      }

      const checkProject = `SELECT 1 FROM Project WHERE project_id = ? LIMIT 1`;
      db.query(checkProject, [projectId], (err, projResult) => {
        if (err || projResult.length === 0) {
          console.error("❌ 존재하지 않는 프로젝트:", projectId);
          return;
        }

        const insertSql = `INSERT INTO Chat (content, timestamp, user_id, project_id) VALUES (?, ?, ?, ?)`;
        db.query(insertSql, [msg, timestamp, user, projectId], (err, result) => {
          if (err) {
            console.error("❌ 채팅 저장 실패:", err);
            return;
          }
          console.log("✅ 채팅 저장 성공, ID:", result.insertId);

          // 3) 모든 클라이언트에 메시지 전송
          io.emit("chat message", {
            user,
            msg,
            time: displayTime,
            createdAt: timestamp,
            projectId,
          });
        });
      });
    });
  });

  // 회의록 요약 요청 처리
  socket.on("generate summary", async (callback) => {
    console.log("✅ [서버] generate summary 요청 도착");
    const recentChatHistory = chatHistory.slice(-10); // 최근 10개만 요약
    console.log("요약에 사용될 chatHistory:", recentChatHistory);
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
