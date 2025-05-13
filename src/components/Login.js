import React, { useState } from "react";
import "./Login.css"; 

function Login({ onLogin, onShowRegister }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin("dummyToken");
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-title">
          <span role="img" aria-label="말풍선">💬</span>
          <span>로그인</span>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-btn">로그인</button>
        </form>
        <p className="register-text">
          계정이 없나요?{" "}
          <button type="button" className="register-btn" onClick={onShowRegister}>
            회원가입
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
