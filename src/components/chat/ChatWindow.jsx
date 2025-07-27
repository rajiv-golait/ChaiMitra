import React, { useState, useEffect, useRef } from 'react';
import { firestore } from '../../services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatWindow = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const dummy = useRef();

  useEffect(() => {
    if (!chatId) return;

    const q = query(collection(firestore, `chats/${chatId}/messages`), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newMessages = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setMessages(newMessages);
    });

    return unsubscribe;
  }, [chatId]);

  useEffect(() => {
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (message) => {
    await addDoc(collection(firestore, `chats/${chatId}/messages`), {
      text: message,
      senderId: 'some-user-id', // Replace with actual user ID
      timestamp: serverTimestamp(),
    });
  };

  return (
    <div className="chat-window">
      <MessageList messages={messages} />
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
