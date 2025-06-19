import React, { useState, useEffect } from "react";

function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setIsDarkMode(true);
  }, []);

  useEffect(() => {
    document.body.className = isDarkMode ? "dark-mode" : "";
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return (
    <button onClick={() => setIsDarkMode(!isDarkMode)}>
      {isDarkMode ? "☀️ 라이트 모드" : "🌙 다크 모드"}
    </button>
  );
}

export default DarkModeToggle;
