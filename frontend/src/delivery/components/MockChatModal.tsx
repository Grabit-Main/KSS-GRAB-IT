import React, { useState, useRef, useEffect } from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { Send, X, User, CheckCheck } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'AGENT' | 'CUSTOMER';
  text: string;
  time: string;
}

export const MockChatModal: React.FC = () => {
  const { state, closeModal } = useDelivery();
  const { currentOrder } = state;

  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'CUSTOMER',
      text: `Hi! Are you picking up my order from ${currentOrder?.merchant.name || 'the store'}?`,
      time: '2 mins ago'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const cannedReplies = [
    "I've arrived outside with your order! 📍",
    'Stuck in traffic, reaching in ~5 minutes 🛵',
    'Could you please share the building gate/buzzer code? 🔑',
    'Package collected from store, on my way! 🚀'
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'AGENT',
      text: text.trim(),
      time: 'Just now'
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');

    // Simulate customer reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let replyText = 'Thanks for the update! See you soon.';
      if (text.toLowerCase().includes('gate') || text.toLowerCase().includes('code')) {
        replyText = 'The gate buzzer code is #4012. You can dial it and I will buzz you in!';
      } else if (text.toLowerCase().includes('traffic')) {
        replyText = 'No worries, take your time and ride safe!';
      } else if (text.toLowerCase().includes('arrived') || text.toLowerCase().includes('outside')) {
        replyText = 'Great! Coming down to the front lobby right away.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now() + 1}`,
          sender: 'CUSTOMER',
          text: replyText,
          time: 'Just now'
        }
      ]);
    }, 1400);
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content glass-strong"
        style={{
          maxWidth: '440px',
          height: '560px',
          borderRadius: '24px',
          border: '1px solid var(--glass-border-strong)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-glass-modal)',
          overflow: 'hidden'
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            background: 'rgba(29, 29, 31, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: '#FFFFFF',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(52, 199, 89, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid var(--color-green)'
              }}
            >
              <User size={20} color="var(--color-green)" />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#FFFFFF' }}>
                {currentOrder?.customer.name || 'Customer'}
              </h4>
              <span style={{ fontSize: '11px', color: 'var(--color-soft-gray)' }}>
                Order #{currentOrder?.orderNumber} • Live Chat
              </span>
            </div>
          </div>

          <button
            onClick={closeModal}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Message Thread */}
        <div
          style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            backgroundColor: 'var(--color-warm-white)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ textAlign: 'center', margin: '4px 0' }}>
            <span
              style={{
                fontSize: '11px',
                backgroundColor: 'rgba(0,0,0,0.06)',
                padding: '3px 10px',
                borderRadius: '10px',
                color: 'var(--color-soft-gray)'
              }}
            >
              Secure in-app chat for delivery coordination
            </span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.sender === 'AGENT';
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    backgroundColor: isMe ? 'var(--color-blue)' : 'var(--color-pure-white)',
                    color: isMe ? '#FFFFFF' : 'var(--color-graphite)',
                    border: isMe ? 'none' : '1px solid var(--color-border-gray)',
                    borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    wordBreak: 'break-word'
                  }}
                >
                  {msg.text}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', fontSize: '10px', color: 'var(--color-soft-gray)' }}>
                  <span>{msg.time}</span>
                  {isMe && <CheckCheck size={12} color="var(--color-blue)" />}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div
              style={{
                alignSelf: 'flex-start',
                backgroundColor: 'var(--color-pure-white)',
                border: '1px solid var(--color-border-gray)',
                borderRadius: '14px 14px 14px 2px',
                padding: '8px 12px',
                fontSize: '12px',
                color: 'var(--color-soft-gray)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span className="animate-pulse">{currentOrder?.customer.name} is typing...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Canned Replies */}
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: 'var(--color-pure-white)',
            borderTop: '1px solid var(--color-border-gray)',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          {cannedReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(reply)}
              style={{
                fontSize: '11px',
                padding: '5px 10px',
                borderRadius: '14px',
                backgroundColor: 'var(--color-warm-white)',
                border: '1px solid var(--color-border-gray)',
                color: 'var(--color-graphite)',
                flexShrink: 0,
                cursor: 'pointer'
              }}
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input Field */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--color-pure-white)',
            borderTop: '1px solid var(--color-border-gray)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <input
            type="text"
            placeholder="Type message to customer..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--radius-input)',
              border: '1px solid var(--color-border-gray)',
              backgroundColor: 'var(--color-warm-white)'
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={!inputVal.trim()}
            style={{ padding: '10px 14px', borderRadius: 'var(--radius-button)' }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
