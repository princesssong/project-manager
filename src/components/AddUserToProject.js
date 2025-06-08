import React, { useState } from "react";

function AddUserToProject({ project_id }) {
  const [user_id, setUserId] = useState("");
  const [role, setRole] = useState("member");
  const [message, setMessage] = useState("");

  const handleAddUser = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token"); // 저장된 JWT 가져오기

    try {
      const response = await fetch(`http://localhost:3000/projects/${project_id}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // JWT를 Authorization 헤더에 포함
        },
        body: JSON.stringify({ user_id, role }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("사용자 추가 성공!");
      } else {
        setMessage(data.message || "사용자 추가 실패");
      }
    } catch (err) {
      console.error(err);
      setMessage("서버 오류");
    }
  };

  return (
    <div>
      <h2>프로젝트에 사용자 추가</h2>
      <form onSubmit={handleAddUser}>
        <input
          type="text"
          placeholder="사용자 ID"
          value={user_id}
          onChange={(e) => setUserId(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="member">일반 사용자</option>
          <option value="admin">관리자</option>
        </select>
        <button type="submit">사용자 추가</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AddUserToProject;