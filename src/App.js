import React from "react";
import TaskManager from "./components/TaskManager";
import DarkModeToggle from "./components/DarkModeToggle";
import Chat from "./components/Chat"; // ✅ 추가
import "./styles.css";

function App() {
  return (
    <div className="app-container">
      <h1>프로젝트 관리 앱</h1>
      <DarkModeToggle />
      <TaskManager />
      <Chat /> {/* ✅ 추가 */}
    </div>
  );
}

export default App;
