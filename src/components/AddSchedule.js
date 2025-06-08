import React, { useState } from "react";

function AddSchedule({ project_id }) {
  const [name, setName] = useState("");
  const [start_date, setStartDate] = useState("");
  const [end_date, setEndDate] = useState("");
  const [message, setMessage] = useState("");

  const handleAddSchedule = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token"); // 저장된 JWT 가져오기

    try {
      const response = await fetch(`http://localhost:3000/projects/${project_id}/schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // JWT를 Authorization 헤더에 포함
        },
        body: JSON.stringify({ name, start_date, end_date }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("일정 추가 성공!");
      } else {
        setMessage(data.message || "일정 추가 실패");
      }
    } catch (err) {
      console.error(err);
      setMessage("서버 오류");
    }
  };

  return (
    <div>
      <h2>일정 추가</h2>
      <form onSubmit={handleAddSchedule}>
        <input
          type="text"
          placeholder="일정 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="date"
          value={start_date}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={end_date}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button type="submit">일정 추가</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AddSchedule;