import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import styles from './Chat.module.css';

const TEST_PROJECT_ID = 'test-project-001'; // UUID 또는 고유 문자열이면 OK
// 테스트용 프로젝트 ID (실제 사용 시 props로 전달받아야 함)
// const TEST_USERNAME = 'test-user'; // 테스트용 사용자 이름 (실제 사용 시 props로 전달받아야 함)


// 사용자 이름을 기반으로 랜덤 색상 생성
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
}

// 날짜 포맷 (예: 2025년 4월 10일 (수))
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
}

function Chat({ userId, nickname, projectId }) {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [userMap, setUserMap] = useState({}); // ✅ ID → 닉네임 매핑

  
  const socketRef = useRef(); 

  // ✅ userId로 nickname을 불러오는 함수
  const fetchNickname = async (userId) => {
    if (userMap[userId]) return; // 이미 불러왔으면 스킵

    try {
      const res = await fetch(`https://project-manager-o39c.onrender.com/users/${userId}`);
      const data = await res.json();
      if (data.nickname) {
        setUserMap((prev) => ({ ...prev, [userId]: data.nickname }));
      }
    } catch (err) {
      console.error(`❌ 닉네임 조회 실패 (${userId})`, err);
    }
  };

  // 메시지 수신 처리
  useEffect(() => {
    socketRef.current = io("https://project-manager-o39c.onrender.com", {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem("token"), // 예시
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

    // ✅ 메시지 수신 시 닉네임 요청 및 채팅 추가
    socketRef.current.on("chat message", ({ user, msg, time, createdAt }) => {
      fetchNickname(user);
      setChatLog((prev) => [...prev, { user, msg, time, createdAt }]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // 메시지 전송 처리
  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '' || !userId) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const createdAt = now.toISOString();
    socketRef.current.emit('chat message', {
      user: userId,
      msg: message,
      time,
      createdAt,
      projectId: TEST_PROJECT_ID, // 테스트용 프로젝트 ID
    });
    setMessage('');
  };

  // 메시지 삭제 (인덱스 기반)
  const deleteMessage = (index) => {
    setChatLog((prev) => prev.filter((_, i) => i !== index));
  };

  let lastDate = null;

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>💬 팀 채팅</h2>

      {/* 채팅 로그 출력 */}
      <div className={styles.chatLog}>
        {chatLog.map((item, idx) => {
          const isMine = item.user === userId;
          const avatarColor = stringToColor(item.user);
          const messageDate = item.createdAt?.split('T')[0];
          const showDate = messageDate !== lastDate;
          lastDate = messageDate;

          return (
            <React.Fragment key={idx}>
              {/* 날짜 구분선 */}
              {showDate && (
                <div className={styles.dateSeparator}>
                  — {formatDate(messageDate)} —
                </div>
              )}
              <div className={`${styles.messageRow} ${isMine ? styles.myMessage : styles.otherMessage}`}>
                {/* 아바타 표시 */}
                {!isMine && (
                  <div className={styles.avatar} style={{ backgroundColor: avatarColor }}>
                    {item.user[0].toUpperCase()}
                  </div>
                )}
                <div className={styles.messageContent}>
                  <div className={styles.messageMeta}>
                    {/* ✅ 닉네임으로 보여주기 */}
                    <span className={styles.username}>
                      {userMap[item.user] || item.user}
                    </span>
                    <span className={styles.time}>{item.time}</span>
                  </div>
                  <div className={styles.messageText}>{item.msg}</div>
                  {/* 내 메시지에만 삭제 버튼 표시 */}
                  {isMine && (
                    <button className={styles.deleteBtn} onClick={() => deleteMessage(idx)}>삭제</button>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* 메시지 입력창 */}
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