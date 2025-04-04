import { useState } from "react";

function Register({ onRegister }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("회원가입 요청:", { userId, password, nickname });
    onRegister();
  };

  return (
    <div>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="아이디" value={userId} onChange={(e) => setUserId(e.target.value)} required />
        <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="text" placeholder="닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} required />
        <button type="submit">회원가입</button>
      </form>
    </div>
  );
}

export default Register; // ✅ 여기 확인!!
