// src/components/Register.js

import { useState } from "react";
import axios from "axios";
import { validateInput } from "../utils/validation";  // validation.js 파일 import

function Register({ onRegister }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 입력값 검증
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
        onRegister(); // 필요 시 로그인 화면으로 이동하는 함수
      } else {
        // 서버에서 전달된 중복 ID 메시지를 오류로 처리
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
    <div>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">회원가입</button>
      </form>
      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Register;
