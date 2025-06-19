import { useState } from "react";
import axios from "axios";
import { validateInput } from "../utils/validation";
import "./Login.css";

function Register({ onRegister }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    const validationResult = validateInput(userId, password, nickname);
    if (!validationResult.isValid) {
      setError(validationResult.message);
      return;
    }

    try {
      const res = await axios.post("https://project-manager-o39c.onrender.com/register", {
        userId,
        password,
        nickname,
      });

      const { success, message } = res.data;

      if (success) {
        setSuccess("✅ 회원가입 성공!");
        onRegister();
      } else {
        setError("❌ 회원가입 실패: " + (message || "알 수 없는 오류"));
      }
    } catch (err) {
      console.error("회원가입 요청 중 오류:", err);

      if (err.response && err.response.data && err.response.data.message) {
        setError("❌ " + err.response.data.message);
      } else {
        setError("❌ 서버 오류로 회원가입에 실패했습니다.");
      }
    }
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
          {success && <div style={{ color: 'green', fontSize: '0.9rem' }}>{success}</div>}
          <button type="submit" className="login-btn">회원가입</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
