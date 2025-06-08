import React, { useState } from "react";

function Login() {
  const [userID, setUserID] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userID, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token); // 서버에서 받은 JWT를 저장
        setMessage("로그인 성공!");
      } else {
        setMessage(data.message || "로그인 실패");
      }
    } catch (err) {
      console.error(err);
      setMessage("서버 오류");
    }
  };

  return (
    <div>
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit">로그인</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;