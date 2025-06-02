import { useState } from "react";
import "./Login.css";

function Register({ onRegister }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    console.log("회원가입 요청:", { userId, password, nickname });
    onRegister();
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-title">회원가입</div>
        <form className="login-form" onSubmit={handleSubmit}>
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
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
          {error && <div style={{ color: 'red', fontSize: '0.9rem' }}>{error}</div>}
          <button type="submit" className="login-btn">
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
