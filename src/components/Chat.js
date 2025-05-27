import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import styles from './Chat.module.css';

// 소켓 서버에 연결
const socket = io("https://project-manager-o39c.onrender.com");



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

function Chat() {
  // 상태 정의
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);

  // 메시지 수신 처리
  useEffect(() => {
    socket.on('chat message', ({ user, msg, time, createdAt }) => {
      setChatLog((prev) => [...prev, { user, msg, time, createdAt }]);
    });

    return () => {
      socket.off('chat message');
    };
  }, []);

  // 메시지 전송 처리
  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '' || username.trim() === '') return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const createdAt = now.toISOString();
    socket.emit('chat message', { user: username, msg: message, time, createdAt });
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

      {/* 사용자 이름 입력 */}
      <div className={styles.username}>
        <input
          type="text"
          placeholder="사용자 이름"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* 채팅 로그 출력 */}
      <div className={styles.chatLog}>
        {chatLog.map((item, idx) => {
          const isMine = item.user === username;
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
                    <span className={styles.username}>{item.user}</span>
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