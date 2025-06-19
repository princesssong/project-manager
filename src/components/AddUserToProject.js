import React, { useState } from "react";

function AddUserToProject({ project_id }) {
  const [userUUID, setUserUUID] = useState(""); // UUID를 입력받아야 함
  const [nickname, setNickname] = useState(""); // User의 nickname (optional, but has FK)
  const [role, setRole] = useState("member");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!userUUID.trim()) {
      setMessage("사용자의 UUID를 입력해주세요.");
      return;
    }
    if (!project_id) {
      setMessage("프로젝트 UUID가 유효하지 않습니다.");
      return;
    }

    const token = localStorage.getItem("token");
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`https://project-manager-o39c.onrender.com/projects/${project_id}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userUUID,  // DB는 user_id (User.UUID)
          nickname: nickname || undefined,  // nullable FK
          role,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ 사용자 추가 성공!");
        setUserUUID("");
        setNickname("");
        setRole("member");
      } else {
        setMessage(data.message || "❌ 사용자 추가 실패");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ 서버 오류 발생");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <h2>프로젝트에 사용자 추가</h2>
      <form onSubmit={handleAddUser}>
        <input
          type="text"
          placeholder="사용자 UUID"
          value={userUUID}
          onChange={(e) => setUserUUID(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <input
          type="text"
          placeholder="닉네임 (선택)"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        >
          <option value="member">일반 사용자</option>
          <option value="admin">관리자</option>
        </select>
        <button type="submit" disabled={isSubmitting} style={{ width: "100%", padding: "10px" }}>
          {isSubmitting ? "추가 중..." : "사용자 추가"}
        </button>
      </form>
      {message && <p style={{ marginTop: "10px", color: "blue" }}>{message}</p>}
    </div>
  );
}

export default AddUserToProject;
