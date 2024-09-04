import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './Chatroom.css';

const socket = io('http://localhost:5000'); 

const Chatroom = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    socket.on('chatMessage', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('chatMessage'); 
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const messageData = {
        username: username, 
        message: message,
      };

      socket.emit('chatMessage', messageData); 
      setMessage('');
    }
  };

  return (
    <div className="chatroom-container">
      <h2>Chatroom</h2>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className="chat-message">
            <strong>{msg.username}</strong> <em>{msg.timestamp}</em>: {msg.message}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="chat-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button type="submit" className="chat-send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatroom;
