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
const mysql = require("mysql2");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

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





// 🔌 소켓 통신
io.on("connection", (socket) => {
  console.log("✅ A user connected");

  socket.on("chat message", ({ user, msg, time }) => {
    console.log("📨 Message received:", user, msg, time);
    io.emit("chat message", { user, msg, time });
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
