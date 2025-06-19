import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import styles from './Chat.module.css';

const TEST_PROJECT_ID = 'test-project-001'; // 테스트용 프로젝트 ID

// 닉네임 기반 랜덤 색상 생성 (기본 제공 함수)
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
}

// 임의 색상 리스트 예시
const PROFILE_COLORS = [
  '#e57373', '#ba68c8', '#7986cb', '#4db6ac',
  '#81c784', '#ffd54f', '#ff8a65', '#a1887f',
];

// 랜덤 색상 반환
function getRandomColor() {
  return PROFILE_COLORS[Math.floor(Math.random() * PROFILE_COLORS.length)];
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
}

function Chat({ username: propUsername, projectId = TEST_PROJECT_ID }) {
  const [username, setUsername] = useState(propUsername || '');
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [userMap, setUserMap] = useState({});       // userId -> 닉네임 매핑
  const [userColorMap, setUserColorMap] = useState({}); // userId -> 색상 매핑
  const [userColor, setUserColor] = useState('');   // 현재 사용자의 색상
  const [showColorPicker, setShowColorPicker] = useState(false);

  const socketRef = useRef();

  // 닉네임 조회 함수
  const fetchNickname = async (userId) => {
    if (userMap[userId]) return; // 이미 있음

    try {
      const res = await fetch(`https://project-manager-o39c.onrender.com/users/${userId}`);
      const data = await res.json();
      if (data.nickname) {
        setUserMap(prev => ({ ...prev, [userId]: data.nickname }));
      }
    } catch (err) {
      console.error(`❌ 닉네임 조회 실패 (${userId})`, err);
    }
  };

  // username 변경 시 색상 자동 지정
  useEffect(() => {
    if (!username) return;
    setUserColorMap(prev => {
      if (prev[username]) return prev;
      const newColor = getRandomColor();
      setUserColor(newColor);
      return { ...prev, [username]: newColor };
    });
  }, [username]);

  // socket.io 연결 및 이벤트 등록
  useEffect(() => {
    socketRef.current = io("https://project-manager-o39c.onrender.com", {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected:", socketRef.current.id);
    });

    socketRef.current.on("disconnect", () => {
      console.warn("❌ Socket disconnected");
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err);
    });

    socketRef.current.on("chat message", ({ user, msg, time, createdAt }) => {
      fetchNickname(user);
      setChatLog(prev => [...prev, { user, msg, time, createdAt }]);
      setUserColorMap(prevMap => {
        if (!prevMap[user]) {
          return { ...prevMap, [user]: getRandomColor() };
        }
        return prevMap;
      });
    });

    return () => {
      socketRef.current.off("chat message");
      socketRef.current.disconnect();
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '' || !username.trim()) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const createdAt = now.toISOString();

    socketRef.current.emit('chat message', {
      user: username,
      msg: message,
      time,
      createdAt,
      projectId,
    });

    setUserColorMap(prev => ({ ...prev, [username]: userColor }));
    setMessage('');
  };

  const deleteMessage = (index) => {
    setChatLog(prev => prev.filter((_, i) => i !== index));
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
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className={styles.colorChangeBtn}
        >
          색상 변경
        </button>
      </div>

      {showColorPicker && (
        <div className={styles.colorPicker}>
          {PROFILE_COLORS.map(color => (
            <button
              key={color}
              className={styles.colorDot}
              style={{ backgroundColor: color }}
              onClick={() => {
                setUserColor(color);
                setUserColorMap(prev => ({ ...prev, [username]: color }));
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
                    <span className={styles.username}>
                      {userMap[item.user] || item.user}
                    </span>
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
