import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";


function ProjectManagement() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));
    return savedTasks || [{ id: "1", text: "기본 작업", completed: false }];
  });
  const [newTask, setNewTask] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    document.body.className = isDarkMode ? "dark-mode" : "";
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), text: newTask, completed: false }]);
    setNewTask("");
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const toggleCompletion = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleEditTask = (taskId, newText) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, text: newText } : task
      )
    );
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedTasks = [...tasks];
    const [movedTask] = reorderedTasks.splice(result.source.index, 1);
    reorderedTasks.splice(result.destination.index, 0, movedTask);
    setTasks(reorderedTasks);
  };

  return (
    <div className={`container ${isDarkMode ? "dark" : ""}`}>
      <h2>📌 프로젝트 관리</h2>
      <div className="theme-toggle">
        <button onClick={() => setIsDarkMode(!isDarkMode)}>
          {isDarkMode ? "☀️ 라이트 모드" : "🌙 다크 모드"}
        </button>
      </div>
      <div className="task-input">
        <input
          type="text"
          placeholder="새로운 작업 추가..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button className="add-btn" onClick={addTask}>추가</button>
      </div>
      {tasks.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
<Droppable droppableId="taskList">
  {(provided) => (
    <ul ref={provided.innerRef} {...provided.droppableProps} className="task-list">
      {tasks.length > 0 ? (
        tasks.map((task, index) => (
          <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
            {(provided) => (
              <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                <input type="checkbox" checked={task.completed} onChange={() => toggleCompletion(task.id)} />
                <input type="text" value={task.text} onChange={(e) => handleEditTask(task.id, e.target.value)} />
                <button onClick={() => deleteTask(task.id)}>삭제</button>
              </li>
            )}
          </Draggable>
        ))
      ) : (
        <li className="empty-task">📝 추가할 작업을 입력하세요.</li>
      )}
      {provided.placeholder}
    </ul>
  )}
</Droppable>

        </DragDropContext>
      ) : (
        <p className="empty-message">📝 추가할 작업을 입력하세요.</p>
      )}
    </div>
  );
}

export default ProjectManagement;
