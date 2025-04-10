import { useState } from "react";

function Login({ onLogin, onShowRegister }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("✅ 로그인 성공:", data);
        onLogin(data.token); // 서버가 반환한 토큰을 저장 (예: localStorage에 저장 가능)
      } else {
        console.error("❌ 로그인 실패:", data.message);
        alert(data.message || "로그인 실패");
      }
    } catch (error) {
      console.error("🚨 오류 발생:", error);
      alert("서버 오류");
    }
  };
  

  return (
    <div>
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="아이디" value={userId} onChange={(e) => setUserId(e.target.value)} required />
        <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">로그인</button>
      </form>
      <p>
        계정이 없나요? <button onClick={onShowRegister}>회원가입</button>
      </p>
    </div>
  );
}

export default Login; // ✅ 여기 확인!!
