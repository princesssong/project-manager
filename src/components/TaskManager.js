import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./TaskManager.css";

// ✅ 날짜 문자열을 한국 시간 기준으로 정확하게 변환
function formatDate(date) {
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/\. /g, "-").replace(/\.$/, "");
}

// ✅ 랜덤 색상 지정
function getRandomColor() {
  const colors = ["#4a90e2", "#f39c12", "#2ecc71", "#e74c3c", "#9b59b6", "#16a085"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(savedTasks);
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTaskName.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      text: newTaskName,
      completed: false,
      start: formatDate(startDate),
      end: formatDate(endDate),
      color: getRandomColor(),
    };
    setTasks([...tasks, newTask]);
    setNewTaskName("");
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

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedTasks = [...tasks];
    const [movedTask] = reorderedTasks.splice(result.source.index, 1);
    reorderedTasks.splice(result.destination.index, 0, movedTask);
    setTasks(reorderedTasks);
  };

  return (
    <div className="task-manager">
      <div className="task-inputs">
        <input
          type="text"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="작업명 입력..."
        />
        <label>시작일: </label>
        <input
          type="date"
          value={formatDate(startDate)}
          onChange={(e) => setStartDate(new Date(e.target.value))}
        />
        <label>마감일: </label>
        <input
          type="date"
          value={formatDate(endDate)}
          onChange={(e) => setEndDate(new Date(e.target.value))}
        />
        <button onClick={addTask}>추가</button>
        <button onClick={() => setShowCalendar(!showCalendar)}>📅</button>
        <span>{formatDate(selectedDate)}</span>
      </div>

      {showCalendar && (
        <div className="calendar-wrapper">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={({ date }) => {
              const dayStr = formatDate(date); // ✅ 한국 날짜 기준 문자열
              return tasks
                .filter((task) => dayStr >= task.start && dayStr <= task.end)
                .map((task) => {
                  const isStart = dayStr === task.start;
                  const isEnd = dayStr === task.end;
                  const className = isStart
                    ? "gantt-bar gantt-start"
                    : isEnd
                    ? "gantt-bar gantt-end"
                    : "gantt-bar gantt-middle";
                  return (
                    <div
                      key={task.id}
                      className={className}
                      style={{ backgroundColor: task.color }}
                    />
                  );
                });
            }}
          />
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <ul ref={provided.innerRef} {...provided.droppableProps}>
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleCompletion(task.id)}
                      />
                      <span className="task-name">{task.text}</span>
                      <span className="task-date-range">
                        ({task.start} ~ {task.end})
                      </span>
                      <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                        삭제
                      </button>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default TaskManager;
