import React, { useState } from "react";
import io from "socket.io-client";

const socket = io("https://project-manager-o39c.onrender.com", {
  withCredentials: true,
  transports: ["websocket"],
});
function MeetingSummary() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleGenerateSummary = () => {
    setLoading(true);
    setShowModal(true);
    socket.emit("generate summary", (response) => {
      setLoading(false);
      if (response.success) {
        setSummary(response.summary);
      } else {
        setSummary("요약 생성에 실패했습니다.");
      }
    });
  };

  const handleClose = () => {
    setShowModal(false);
    setSummary("");
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={handleGenerateSummary}
        style={{
          marginLeft: 16,
          padding: "8px 18px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontSize: "15px",
          cursor: "pointer"
        }}
      >
        회의록 생성
      </button>
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
        }}>
          <div style={{
            background: "#222", color: "#fff", padding: "32px 24px", borderRadius: "12px", minWidth: "320px", maxWidth: "90vw", boxShadow: "0 4px 24px rgba(0,0,0,0.3)"
          }}>
            <h3 style={{ marginBottom: 16 }}>회의 요약</h3>
            <div style={{ minHeight: 60, marginBottom: 16 }}>
              {loading ? "회의록 생성 중..." : summary}
            </div>
            <button
              onClick={handleClose}
              style={{
                marginTop: 8,
                padding: "8px 20px",
                backgroundColor: "#444",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default MeetingSummary;