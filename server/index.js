// 🌍 환경변수 불러오기
require("dotenv").config();

console.log("✅ 환경변수 확인");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_NAME:", process.env.DB_NAME);


// 📦 기본 설정 
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
<<<<<<< HEAD
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // 키를 환경변수에서 불러옴
const gemini = new GoogleGenerativeAI(GEMINI_API_KEY);
=======
const mysql = require("mysql2");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
>>>>>>> origin/feature/User_DB

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 🌐 미들웨어
app.use(cors());
app.use(express.json());

// 🛠️ MySQL 연결 설정





// 테스트용 로그
console.log('MySQL 접속 정보:', {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
});

console.log('환경 변수:', process.env);



// index.js 수정 예시
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});


// ✅ 기본 라우트
app.get("/", (req, res) => {
  res.send("Server is running!");
});

<<<<<<< HEAD
// 📝 채팅 기록 저장 (메모리 기반, 실제 앱에서는 DB 사용 권장)
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
=======


// 로그인 라우트 추가 (회원가입 아래에 넣어도 됨)
app.post("/login", (req, res) => {
  const { userId, password } = req.body;

  const sql = "SELECT * FROM users WHERE user_id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "DB 오류" });

    if (results.length === 0) {
      return res.status(401).json({ message: "존재하지 않는 사용자입니다." });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ message: "비밀번호 확인 오류" });

      if (!isMatch) {
        return res.status(401).json({ message: "비밀번호가 틀렸습니다." });
      }

      return res.status(200).json({ message: "로그인 성공", token: "dummyToken" });
    });
  });
});





// 🧾 회원가입 라우트


// 비밀번호 해싱 후 DB 저장
app.post("/register", (req, res) => {
  const { userId, password } = req.body;

  console.log(`회원가입 요청 ID: ${userId}`);  // 요청된 userId 확인

  const checkSql = "SELECT * FROM users WHERE user_id = ?";
  db.query(checkSql, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "DB 오류", error: err });
    }

    console.log(`중복 검사 결과: ${result.length > 0 ? "중복 있음" : "중복 없음"}`);

    if (result.length > 0) {
      return res.status(400).json({ success: false, message: "이미 존재하는 ID입니다." });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: "암호화 오류", error: err });
      }

      const insertSql = "INSERT INTO users (uid, user_id, password) VALUES (?, ?, ?)";
      db.query(insertSql, [uuidv4(), userId, hashedPassword], (err, result) => {
        if (err) {
          return res.status(500).json({ message: "회원가입 실패", error: err });
        }

        return res.status(201).json({ success: true, message: "회원가입 성공!" });
      });
    });
  });
});




>>>>>>> origin/feature/User_DB

// 🔌 소켓 통신
io.on("connection", (socket) => {
  console.log("✅ A user connected");

  socket.on("chat message", ({ user, msg, time }) => {
    console.log("📨 Message received:", user, msg, time);
<<<<<<< HEAD
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
=======
    io.emit("chat message", { user, msg, time });
>>>>>>> origin/feature/User_DB
  });

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected");
  });
});

// 🚀 서버 실행
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
