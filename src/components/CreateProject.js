import React, { useState } from "react";

function CreateProject() {
  const [project_name, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [message, setMessage] = useState("");

  const handleCreateProject = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token"); // 저장된 JWT 가져오기

    try {
      const response = await fetch("https://project-manager-o39c.onrender.com/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // JWT를 Authorization 헤더에 포함
        },
        body: JSON.stringify({ project_name, description, goal }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("프로젝트 생성 성공!");
      } else {
        setMessage(data.message || "프로젝트 생성 실패");
      }
    } catch (err) {
      console.error(err);
      setMessage("서버 오류");
    }
  };

  return (
    <div>
      <h2>프로젝트 생성</h2>
      <form onSubmit={handleCreateProject}>
        <input
          type="text"
          placeholder="프로젝트 이름"
          value={project_name}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <textarea
          placeholder="프로젝트 설명"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <textarea
          placeholder="프로젝트 목표"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
        <button type="submit">프로젝트 생성</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CreateProject;