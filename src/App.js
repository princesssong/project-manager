import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TaskManager from "./components/TaskManager";
import DarkModeToggle from "./components/DarkModeToggle";
import Chat from "./components/Chat";
import Login from "./components/Login";
import Register from "./components/Register";
import SummaryPage from "./components/SummaryPage";
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
    <Router>
      <div className="app-container">
        <h1>프로젝트 관리 앱</h1>
        <DarkModeToggle />
        
        {/* 항상 표시되는 Chat 컴포넌트 */}
        <Chat />

        <Routes>
          <Route path="/" element={<TaskManager />} />
          <Route path="/summary" element={<SummaryPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
