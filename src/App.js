import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const handleLogin = async (token) => {
    try {
      localStorage.setItem("token", token);
      const response = await fetch("https://project-manager-o39c.onrender.com/protected", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "보호된 API 접근 실패");
      }

      setUserId(data.user.userId);
      setNickname(data.user.nickname);
      setProjectId(data.user.projectId);
      setToken(token);
      navigate("/"); // 로그인 성공 후 메인으로
    } catch (error) {
      console.error("❌ 인증 오류:", error);
      alert("로그인 후 인증 요청 실패");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserId(null);
    setNickname(null);
    setProjectId(null);
    navigate("/login");
  };

  // 로그인 상태 아닐 때 라우팅
  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login onLogin={handleLogin} />} />
      </Routes>
    );
  }

  // 로그인 이후 메인 앱
  return (
    <>
      <div className="app-container">
        <h1>프로젝트 관리 앱</h1>
        <button onClick={handleLogout}>🚪 로그아웃</button>
        <DarkModeToggle />
        <TaskManager />
        <Chat userId={userId} nickname={nickname} projectId={projectId} />
      </div>
    </>
  );
}

export default App;
