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
const mysql = require("mysql2");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

function formatDateToMySQL(datetime) {
  const date = new Date(datetime);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}



// JWT 인증을 위한 라이브러리
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("⚠️ JWT_SECRET이 설정되지 않았습니다. 기본값이 사용됩니다. 운영 환경에서는 반드시 설정해야 합니다.");
} 
// jwt 사용을 위한 import
const tokenIsValid = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "defaultSecret");
    return !!decoded;
  } catch (err) {
    console.error("❌ JWT 인증 실패:", err.message);
    return false;
  }
};

const http = require("http");
const socketIO = require("socket.io");
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // 키를 환경변수에서 불러옴
const gemini = new GoogleGenerativeAI(GEMINI_API_KEY);

const app = express();

// 🌐 미들웨어: CORS 설정
const allowedOrigins = [
  "http://localhost:3000",
  "https://project-manager-hw3rplts3-nornsongs-projects.vercel.app", // 실제 배포 주소
  "https://project-manager-alpha-fawn.vercel.app",                  // 도메인 주소들
  "https://project-manager-nornsongs-projects.vercel.app",
  "https://project-manager-git-main-nornsongs-projects.vercel.app",
  "project-manager-kxb6b8w31-nornsongs-projects.vercel.app",
  "project-manager-git-feature-interim-check-nornsongs-projects.vercel.app"
];

// 소켓 서버 CORS 설정
const httpServer = require('http').createServer(app);
const { Server } = require('socket.io');

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});


app.use(cors({
  origin: function (origin, callback) {
    // origin이 undefined이면 로컬(또는 테스트 툴 등) → 허용
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("❌ CORS 차단됨 Origin:", origin);
      callback(new Error("CORS 정책에 의해 차단된 Origin입니다: " + origin));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));


app.use(express.json());

// ✅ JWT 토큰 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>" 구조

  if (!token) {
    return res.status(401).json({ message: "인증 토큰이 제공되지 않았습니다." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
    }

    req.user = user; // 토큰에서 추출한 사용자 정보 저장
    next();
  });
};

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
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

console.log("✅ MySQL 풀 생성 완료");

// 👉 연결 확인 코드 추가
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL 연결 실패:", err);
    process.exit(1); // 연결 실패 시 서버 종료
  } else {
    console.log("✅ MySQL 연결 성공");
    connection.release(); // 풀에 연결 반환
  }
});

/* MySQL createPool() 사용에 따른 비활성화
// MySQL 연결
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL 연결 실패:", err);
    return;
  }
  console.log("✅ MySQL 연결 성공");
});*/


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

      // ✅ 토큰 발급
      const token = jwt.sign(
        { uid: user.id, userId: user.user_id, nickname: user.nickname },
        process.env.JWT_SECRET || "defaultSecret",  // .env에 JWT_SECRET 설정 권장
        { expiresIn: "1h" }
      );

      return res.status(200).json({ message: "로그인 성공", token });
    });
  });
});





// 🧾 회원가입 라우트


// 비밀번호 해싱 후 DB 저장
app.post("/register", (req, res) => {
  const { userId, password, nickname } = req.body;

  // 👉 입력값 검증 추가
  if (!userId || !password || !nickname) {
    return res.status(400).json({ message: "모든 필드를 입력해주세요." });
  }

  console.log(`회원가입 요청 ID: ${userId}`);  // 요청된 userId 확인

  const checkSql = "SELECT * FROM users WHERE user_id = ?";
  db.query(checkSql, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "DB 오류", error: err });
    }

    if (result.length > 0) {
      return res.status(400).json({ success: false, message: "이미 존재하는 ID입니다." });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: "암호화 오류", error: err });
      }

      const insertSql = "INSERT INTO users (id, user_id, password, nickname) VALUES (?, ?, ?, ?)";
      db.query(insertSql, [uuidv4(), userId, hashedPassword, nickname], (err, result) => {
        if (err) {
          console.error("회원가입 DB 오류:", err);
          return res.status(500).json({ message: "회원가입 실패", error: err });
        }

        return res.status(201).json({ success: true, message: "회원가입 성공!" });
      });
    });
  });
});






// 🔐 인증이 필요한 API
app.get("/protected", authenticateToken, (req, res) => {
  res.json({
    message: "✅ 보호된 API 접근 성공",
    user: req.user, // JWT에서 추출한 사용자 정보
  });
});
// 사용자 정보 조회 API
app.get("/users/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = "SELECT user_id, nickname FROM users WHERE user_id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ 사용자 조회 DB 오류:", err);
      return res.status(500).json({ message: "DB 오류" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다" });
    }

    const user = results[0];
    res.json({ userId: user.user_id, nickname: user.nickname });
  });
});





// JWT 토큰 유효성 검사 함수
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.warn("❌ 소켓 인증 실패: 토큰 없음");
    return next(new Error("인증 토큰 없음"));
  }
  if (tokenIsValid(token)) {
    next();
  } else {
    console.warn("❌ 소켓 인증 실패: 유효하지 않은 토큰");
    next(new Error("인증 실패"));
  }
});



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

// 🔌 소켓 통신
io.on("connection", (socket) => {
  console.log("✅ A user connected");

  socket.on("chat message", ({ user, msg, createdAt, projectId }) => {
    console.log("📨 Message received:", user, msg, createdAt, projectId);
  
    const timestamp = formatDateToMySQL(createdAt || new Date());

    // 1. 사용자 존재 확인
    const checkUser = `SELECT 1 FROM users WHERE id = ? LIMIT 1`;
    db.query(checkUser, [user], (err, userResult) => {
      if (err || userResult.length === 0) {
        console.error("❌ 존재하지 않는 사용자:", user);
        return;
      }

      // 2. 프로젝트 존재 확인
      const checkProject = `SELECT 1 FROM Project WHERE project_id = ? LIMIT 1`;
      db.query(checkProject, [projectId], (err, projResult) => {
        if (err || projResult.length === 0) {
          console.error("❌ 존재하지 않는 프로젝트:", projectId);
          return;
        }

        // 3. 채팅 저장
        const insertSql = `INSERT INTO Chat (content, timestamp, user_id, project_id) VALUES (?, ?, ?, ?)`;
        db.query(insertSql, [msg, timestamp, user, projectId], (err, result) => {
          if (err) {
            console.error("❌ 채팅 저장 실패:", err);
            return;
          }
          console.log("✅ 채팅 저장 성공, ID:", result.insertId);

          // 메모리 저장
          chatHistory.push({ user, msg, time: timestamp });

          // 4. 모든 사용자에게 메시지 전송
          io.emit("chat message", {
            user,
            msg,
            time: timestamp,
            createdAt: timestamp,
            projectId,
          });
        });
      });
    });
  });


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
    console.log("요약에 사용될 chatHistory:", recentChatHistory);
    const summary = await summarizeChat(recentChatHistory);
    callback({ success: true, summary });
  });


    /*const insertSql = `INSERT INTO Chat (content, timestamp, user_id, project_id) VALUES (?, ?, ?, ?)`;
    db.query(insertSql, [msg, timestamp, user, projectId], (err, result) => {
      if (err) {
        console.error("❌ 채팅 저장 실패:", err);
        return;
      }
      console.log("✅ 채팅 저장 성공, ID:", result.insertId);
    });
  
    io.emit("chat message", { user, msg, time: timestamp, createdAt: timestamp, projectId });
  });*/

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected");
  });
});





// 🚀 서버 실행
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
