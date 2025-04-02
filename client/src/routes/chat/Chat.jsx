import React, { useState, useEffect, useRef } from 'react';
import Response from "../../components/Response";

const Chat = ({ currentChatId, onChatCreated }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

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
        setMessages(data.messages || []); // fallback for empty messages
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
  const useAutoResizeTextarea = (query) => {
    const textareaRef = useRef(null);
  
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        // Reset height to get the correct scrollHeight
        textarea.style.height = 'auto';
        // Set new height including scroll height
        const newHeight = Math.min(textarea.scrollHeight, 200); // Max 200px
        textarea.style.height = `${newHeight}px`;
      }
    }, [query]);
  
    return textareaRef;
  };
  const textareaRef = useAutoResizeTextarea(query);

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
  className="fixed bottom-0 w-10/12   pt-4"
>
  <div className="mx-auto max-w-3xl px-4">
    <div className="relative rounded-xl  border border-slate-700 bg-slate-900 shadow-xl">
      <textarea
        ref={textareaRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
        disabled={loading}
        className="w-full resize-none bg-transparent p-4 pr-16 text-slate-200 placeholder-slate-500 focus:outline-none scrollbar-thin"
        placeholder="Message PrivateAI..."
        style={{
          minHeight: '54px',
          overflowY: 'auto',
        }}
      />
      <button
        type="submit"
        disabled={loading}
        className="absolute right-2 bottom-2 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
      >
        {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
        ) : (
          <svg
            className="h-5 w-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        )}
      </button>
    </div>
    <div className="py-3 text-center text-xs text-slate-500">
      AI can make mistakes. Consider checking important information.
    </div>
  </div>
</form>
    </div>
  );
};

export default Chat;
