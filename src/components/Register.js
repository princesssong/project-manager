import { useState } from "react";
import "./Login.css";
import axios from "axios";
import { validateInput } from "../utils/validation";

function Register({ onRegister }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationResult = validateInput(userId, password);
    if (!validationResult.isValid) {
      setError(validationResult.message);
      return;
    }

    try {
      const res = await axios.post("http://localhost:4000/register", {
        userId,
        password,
      });

      const { success, message } = res.data;

      if (success) {
        setSuccess("✅ 회원가입 성공!");
        onRegister(); // 로그인 화면으로 이동
      } else {
        setError("❌ 회원가입 실패: " + (message || "알 수 없는 오류"));
      }
    } catch (err) {
      console.error("회원가입 요청 중 오류:", err);
      if (err.response?.data?.message) {
        setError("❌ " + err.response.data.message);
      } else {
        setError("❌ 서버 오류로 회원가입에 실패했습니다.");
      }
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-title">
          <span role="img" aria-label="회원가입">🔐</span>
          <span>회원가입</span>
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
          <button type="submit" className="login-btn">회원가입</button>
        </form>
        {success && <p style={{ color: "green", marginTop: "10px" }}>{success}</p>}
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </div>
    </div>
  );
}

export default Register;
