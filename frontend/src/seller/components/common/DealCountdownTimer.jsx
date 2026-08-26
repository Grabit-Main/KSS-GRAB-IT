import React, { useState, useEffect } from 'react';

export const DealCountdownTimer = ({ initialSeconds = 11867 }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '8px 0 4px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-graphite)', letterSpacing: '-0.2px' }}>
        Deal ends in
      </span>
      <span
        style={{
          backgroundColor: '#FFEBD9',
          color: '#E05315',
          fontSize: '12px',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '6px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          letterSpacing: '0.4px',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span role="img" aria-label="bomb" style={{ fontSize: '12px' }}>💣</span>
        <span>{hours}h : {minutes}m : {seconds}s</span>
      </span>
    </div>
  );
};
