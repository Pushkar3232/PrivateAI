import React, { useState, useEffect, useRef } from 'react';
import Response from "../../components/Response";

const Chat = ({ currentChatId, onChatCreated }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

// Change the useEffect for loading messages to:
useEffect(() => {
  const loadMessages = async () => {
    if (!currentChatId) {
      setMessages([]);
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/chats/${currentChatId}`);
      if (!response.ok) throw new Error('Failed to load chat');
      const data = await response.json();
      setMessages(data.messages || []); // Add fallback for empty messages
    } catch (error) {
      console.error("Error loading chat:", error);
      setMessages([]);
    }
  };
  loadMessages();
}, [currentChatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    let chatId = currentChatId;
    let newChat = false;
    
    // Create new chat if none exists
    if (!chatId) {
      const response = await fetch('http://localhost:5000/api/chats', { method: 'POST' });
      const data = await response.json();
      chatId = data.chat_id;
      newChat = true;
    }

    // Update UI immediately
    setMessages(prev => [...prev, { query, response: "Loading..." }]);
    setLoading(true);
    setQuery('');

    try {
      const response = await fetch('http://localhost:5000/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: query,
          chat_id: chatId
        })
      });

      if (query.includes("@image")) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        updateLastMessage(imageUrl);
      } else {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let result = "";

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          result += decoder.decode(value, { stream: true });
          updateLastMessage(result);
        }
      }

      if (newChat) {
        onChatCreated(chatId);
      }
    } catch (error) {
      console.error("Error:", error);
      updateLastMessage("Error processing request");
    } finally {
      setLoading(false);
    }
  };

  const updateLastMessage = (content) => {
    setMessages(prev => prev.map((item, index) => 
      index === prev.length - 1 ? { 
        ...item, 
        response: typeof content === 'string' ? content : <img src={content} alt="Generated" />
      } : item
    ));
  };

  return (
    <div className="w-full h-screen overflow-auto bg-slate-950 p-4">
      <div 
        ref={chatContainerRef}
        className="chat-container"
        style={{ 
          maxHeight: 'calc(100vh - 100px)', 
          overflowY: 'auto',
          paddingBottom: '80px'
        }}
      >
        {messages.map((message, index) => (
          <div key={index} className="mb-4">
            <div className="text-white mb-2">
              <Response data={message.query} type="query" />
            </div>
            <div className="text-white">
              <Response 
                data={message.response} 
                type={typeof message.response === 'string' ? "text" : "image"} 
              />
            </div>
          </div>
        ))}
      </div>

      <form 
        onSubmit={handleSubmit}
        className="fixed bottom-0 left-0 right-0 bg-slate-800 p-4 flex items-center"
      >
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
          disabled={loading}
          className="flex-1 p-2 bg-slate-700 text-white rounded-lg focus:outline-none"
          placeholder="Type your message..."
          rows="1"
          style={{ resize: 'none' }}
        />
        <button
          type="submit"
          disabled={loading}
          className="ml-2 p-2 bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
          ) : (
            '➤'
          )}
        </button>
      </form>
    </div>
  );
};

export default Chat;