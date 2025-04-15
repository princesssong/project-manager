import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import styles from './SummaryPage.module.css';

const socket = io("https://project-manager-server-kufd.onrender.com");

function SummaryPage() {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    console.log('📨 Sending request to generate summary'); // 디버깅 로그 추가
    socket.emit('generate summary', (response) => {
      console.log('📨 Response received:', response); // 디버깅 로그 추가
      if (response.success) {
        setSummary(response.summary); // 서버에서 받은 요약 저장
      } else {
        alert(response.error || '요약 생성에 실패했습니다.');
      }
      setLoading(false); // 로딩 상태 해제
    });
  }, []);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>📋 회의 요약</h2>
      {loading ? (
        <p>회의록을 생성 중입니다...</p>
      ) : summary ? (
        <p>{summary}</p>
      ) : (
        <p>회의록을 생성할 수 없습니다.</p>
      )}
    </div>
  );
}

export default SummaryPage;