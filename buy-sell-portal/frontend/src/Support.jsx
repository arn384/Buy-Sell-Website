import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_KEY = 'AIzaSyCxzy07NKAhq7Y0FDpSUE_DJxQ625_kp7I';

function Support() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const genAI = new GoogleGenerativeAI(API_KEY);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      text: inputMessage,
      sender: 'user'
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro"});
      const result = await model.generateContent(inputMessage);
      const response = await result.response;
      const botMessage = {
        text: response.text(),
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        text: 'Sorry, something went wrong. Please try again.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <Navbar />
      <div className="flex-grow-1 container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8">
            <div className="card shadow mb-4">
              <div className="card-body p-4" style={{ height: '60vh', overflowY: 'auto' }}>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`d-flex mb-3 ${
                      msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-3 ${
                        msg.sender === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-secondary bg-opacity-25 text-dark'
                      }`}
                      style={{ maxWidth: '70%', wordWrap: 'break-word' }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <form onSubmit={sendMessage} className="d-flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="form-control"
                disabled={loading}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;