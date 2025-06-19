import React, { useState } from "react";

function CreateProject() {
  const [project_name, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [message, setMessage] = useState("");

  const handleCreateProject = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const userID = localStorage.getItem("userID");

    if (!token || !userID) {
      setMessage("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await fetch("https://project-manager-o39c.onrender.com/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_name,
          description,
          goal,
          userID, // 서버가 userID를 활용할 경우
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ 프로젝트 생성 성공!");
        setProjectName("");
        setDescription("");
        setGoal("");
      } else {
        setMessage(data.message || "❌ 프로젝트 생성 실패");
      }
    } catch (err) {
      console.error(err);
      setMessage("서버 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
      <h2>프로젝트 생성</h2>
      <form onSubmit={handleCreateProject}>
        <input
          type="text"
          placeholder="프로젝트 이름"
          value={project_name}
          onChange={(e) => setProjectName(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        <textarea
          placeholder="프로젝트 설명"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px", padding: "8px", minHeight: "80px" }}
        />
        <textarea
          placeholder="프로젝트 목표"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px", padding: "8px", minHeight: "80px" }}
        />
        <button type="submit" style={{ width: "100%", padding: "10px" }}>
          프로젝트 생성
        </button>
      </form>
      {message && <p style={{ marginTop: "15px", color: "blue" }}>{message}</p>}
    </div>
  );
}

export default CreateProject;
