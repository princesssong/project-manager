import React, { useState } from "react";
import TaskManager from "./components/TaskManager";
import DarkModeToggle from "./components/DarkModeToggle";
import Chat from "./components/Chat"; 
import Login from "./components/Login";  // ✅ 추가
import Register from "./components/Register"; // ✅ 추가
import "./styles.css";


function App() {
  const [token, setToken] = useState(null); // 로그인 상태
  const [showRegister, setShowRegister] = useState(false); // 회원가입 화면 여부

  if (!token) {
    return showRegister ? (
      <Register onRegister={() => setShowRegister(false)} />
    ) : (
      <Login onLogin={setToken} onShowRegister={() => setShowRegister(true)} />
    );
  }

  return (
    <div className="app-container">
      <h1>프로젝트 관리 앱</h1>
      <DarkModeToggle />
      <TaskManager />
      <Chat />
    </div>
  );
}

export default App;
