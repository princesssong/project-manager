import React, { useState } from "react";

function Register() {
  const [userID, setUserID] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

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
        setMessage("회원가입 성공!");
      } else {
        setMessage(data.message || "회원가입 실패");
      }
    } catch (err) {
      console.error(err);
      setMessage("서버 오류");
    }
  };

  return (
    <div>
      <h2>회원가입</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="아이디"
          value={userID}
          onChange={(e) => setUserID(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <button type="submit">회원가입</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;