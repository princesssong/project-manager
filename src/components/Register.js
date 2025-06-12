import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [userID, setUserID] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setMessage("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    try {
      const response = await fetch("https://project-manager-o39c.onrender.com/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userID, password, nickname }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ 회원가입 성공! 로그인 페이지로 이동합니다...");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setMessage(data.message || "❌ 회원가입 실패");
      }
    } catch (err) {
      console.error(err);
      setMessage("서버 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <h2>회원가입</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="아이디"
          value={userID}
          onChange={(e) => setUserID(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <input
          type="password"
          placeholder="비밀번호 (6자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <input
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <button type="submit" style={{ width: "100%", padding: "10px" }}>
          회원가입
        </button>
      </form>
      {message && <p style={{ marginTop: "15px", color: "blue" }}>{message}</p>}
    </div>
  );
}

export default Register;
