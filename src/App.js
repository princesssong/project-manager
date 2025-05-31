import React, { useState } from "react";
import TaskManager from "./components/TaskManager";
import DarkModeToggle from "./components/DarkModeToggle";
import Chat from "./components/Chat"; 
import Login from "./components/Login";
import Register from "./components/Register";
import "./styles.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userId, setUserId] = useState(null);
  const [nickname, setNickname] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = async (token) => {
    try {
      localStorage.setItem("token", token);

      const response = await fetch("https://project-manager-o39c.onrender.com/protected", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setUserId(data.user.userId); // ✅ 로그인한 사용자 ID 저장
      setNickname(data.user.nickname); // ✅ 로그인한 사용자 닉네임 저장
      setProjectId(data.user.projectId); // ✅ 로그인한 사용자 프로젝트 ID 저장

      if (!response.ok) {
        throw new Error(data.message || "보호된 API 접근 실패");
      }

      console.log("🔐 보호된 API 응답:", data);
      setToken(token);
    } catch (error) {
      console.error("❌ 인증 오류:", error);
      alert("로그인 후 인증 요청 실패");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserId(null); // ✅ userId도 초기화
    setNickname(null); // ✅ nickname도 초기화
    setProjectId(null); // ✅ projectId도 초기화
  };

  if (!token) {
    return showRegister ? (
      <Register onRegister={() => setShowRegister(false)} />
    ) : (
      <Login onLogin={handleLogin} onShowRegister={() => setShowRegister(true)} />
    );
  }

  return (
    <div className="app-container">
      <h1>프로젝트 관리 앱</h1>
      <button onClick={handleLogout}>🚪 로그아웃</button>
      <DarkModeToggle />
      <TaskManager />
      <Chat userId={userId} nickname={nickname} projectId={projectId} />
    </div>
  );
}

export default App;
