import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io("https://project-manager-server-kufd.onrender.com");
function Chat() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);

 useEffect(() => {
  socket.on('chat message', ({ user, msg, time }) => {
    setChatLog((prev) => [...prev, { user, msg, time }]);
  });

  return () => socket.off('chat message');
}, []);


  // 메시지 보낼 때 시간 추가
const sendMessage = (e) => {
  e.preventDefault();
  if (message.trim() === '' || username.trim() === '') return;

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  socket.emit('chat message', { user: username, msg: message, time });
  setMessage('');
};


  return (
    <div style={{ marginTop: '30px' }}>
      <h2>💬 팀 채팅</h2>

      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="사용자 이름"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '200px', padding: '6px', marginRight: '10px' }}
        />
      </div>

      <div style={{
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}}>
  {chatLog.map((item, idx) => (
    <div
      key={idx}
      style={{
        alignSelf: item.user === username ? 'flex-end' : 'flex-start',
        backgroundColor: item.user === username ? '#dcf8c6' : '#e6f0ff',
        padding: '10px',
        borderRadius: '10px',
        maxWidth: '60%',
        wordBreak: 'break-word',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{item.user}</div>
      <div>{item.msg}</div>
      <div style={{ fontSize: '0.75rem', textAlign: 'right', marginTop: '4px', color: '#888' }}>{item.time}</div>
    </div>
  ))}
</div>


      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지를 입력하세요"
          style={{ width: '80%', padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 12px', marginLeft: '5px' }}>
          전송
        </button>
      </form>
    </div>
  );
}

export default Chat;
