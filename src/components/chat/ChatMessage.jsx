import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ChatMessage = ({ message }) => {
  const { user } = useAuth();
  const { text, senderId, timestamp } = message;
  const messageClass = senderId === user?.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <p>{text}</p>
      <span>{timestamp?.toDate().toLocaleTimeString()}</span>
    </div>
  );
};

export default ChatMessage;
