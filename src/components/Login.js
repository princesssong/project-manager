import { useState } from "react";

function Login({ onLogin, onShowRegister }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("로그인 요청:", { userId, password });
    onLogin("dummyToken");
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
