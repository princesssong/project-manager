import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import styles from './Chat.module.css';

const socket = io("http://localhost:4000");

const PROFILE_COLORS = [
  "#FF6B6B", "#FF8E72", "#FFD166", "#D2FF7C", "#7DFFB3", "#72F0FF",
  "#A6D1FF", "#BFA6FF", "#FFA6E3", "#FFB6C1", "#A2D5AB", "#F0D9FF",
  "#FFCD94", "#C2F784", "#86E3CE", "#FF9AA2", "#D5AAFF", "#B9FBC0",
  "#A0CED9", "#C0B9DD", "#E5EAF5", "#E1F7D5", "#FCD5CE", "#BDE0FE"
];

function getRandomColor() {
  const index = Math.floor(Math.random() * PROFILE_COLORS.length);
  return PROFILE_COLORS[index];
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
}

function Chat() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [userColorMap, setUserColorMap] = useState({});
  const [userColor, setUserColor] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // 이름이 바뀌었을 때 새 색상 지정
  useEffect(() => {
    if (!username) return;
    setUserColorMap((prev) => {
      if (prev[username]) return prev;
      const newColor = getRandomColor();
      setUserColor(newColor);
      return { ...prev, [username]: newColor };
    });
  }, [username]);

  useEffect(() => {
    socket.on('chat message', ({ user, msg, time, createdAt }) => {
      setChatLog((prev) => [...prev, { user, msg, time, createdAt }]);
      setUserColorMap((prevMap) => {
        if (!prevMap[user]) {
          return { ...prevMap, [user]: getRandomColor() };
        }
        return prevMap;
      });
    });
    return () => socket.off('chat message');
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '' || username.trim() === '') return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const createdAt = now.toISOString();
    socket.emit('chat message', { user: username, msg: message, time, createdAt });
    setUserColorMap((prev) => ({ ...prev, [username]: userColor }));
    setMessage('');
  };

  const deleteMessage = (index) => {
    setChatLog((prev) => prev.filter((_, i) => i !== index));
  };

  let lastDate = null;

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>💬 팀 채팅</h2>

      <div className={styles.username}>
        <input
          type="text"
          placeholder="사용자 이름"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={() => setShowColorPicker(!showColorPicker)} className={styles.colorChangeBtn}>
          색상 변경
        </button>
      </div>

      {showColorPicker && (
        <div className={styles.colorPicker}>
          {PROFILE_COLORS.map((color) => (
            <button
              key={color}
              className={styles.colorDot}
              style={{ backgroundColor: color }}
              onClick={() => {
                setUserColor(color);
                setUserColorMap((prev) => ({ ...prev, [username]: color }));
                setShowColorPicker(false);
              }}
            />
          ))}
        </div>
      )}

      <div className={styles.chatLog}>
        {chatLog.map((item, idx) => {
          const isMine = item.user === username;
          const avatarColor = userColorMap[item.user] || getRandomColor();
          const messageDate = item.createdAt?.split('T')[0];
          const showDate = messageDate !== lastDate;
          lastDate = messageDate;

          return (
            <React.Fragment key={idx}>
              {showDate && (
                <div className={styles.dateSeparator}>
                  — {formatDate(messageDate)} —
                </div>
              )}
              <div className={`${styles.messageRow} ${isMine ? styles.myMessage : styles.otherMessage}`}>
                <div className={styles.avatar} style={{ backgroundColor: avatarColor }}>
                  {item.user[0].toUpperCase()}
                </div>
                <div className={styles.messageContent}>
                  <div className={styles.messageMeta}>
                    <span className={styles.username}>{item.user}</span>
                    <span className={styles.time}>{item.time}</span>
                  </div>
                  <div className={styles.messageText}>{item.msg}</div>
                  {isMine && (
                    <button className={styles.deleteBtn} onClick={() => deleteMessage(idx)}>삭제</button>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <form onSubmit={sendMessage} className={styles.form}>
        <textarea
          rows="1"
          className={styles.textarea}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지를 입력하세요"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(e);
            }
          }}
        />
        <button type="submit">전송</button>
      </form>
    </div>
  );
}

export default Chat;
