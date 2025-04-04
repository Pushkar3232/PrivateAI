import React, { useState, useEffect, useRef } from 'react';
import Response from "../../components/Response";
import { FiArrowDown, FiSend, FiPlus } from 'react-icons/fi';

const Chat = ({ currentChatId, onChatCreated }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatContainerRef = useRef(null);
  const isAtBottomRef = useRef(true);

  // Load messages when chat ID changes
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
        setMessages(data.messages || []);
      } catch (error) {
        console.error("Error loading chat:", error);
        setMessages([]);
      }
    };
    loadMessages();
  }, [currentChatId]);

  // Auto-scroll logic
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container && isAtBottomRef.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // Scroll event handler
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const delta = container.scrollHeight - container.scrollTop - container.clientHeight;
      const isNearBottom = delta <= 100;
      isAtBottomRef.current = isNearBottom;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    let chatId = currentChatId;
    let newChat = false;
    
    if (!chatId) {
      const response = await fetch('http://localhost:5000/api/chats', { method: 'POST' });
      const data = await response.json();
      chatId = data.chat_id;
      newChat = true;
    }

    setMessages(prev => [...prev, { query, response: "Loading..." }]);
    isAtBottomRef.current = true;
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

  const scrollToBottom = () => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
      isAtBottomRef.current = true;
      setShowScrollButton(false);
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
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 200);
        textarea.style.height = `${newHeight}px`;
      }
    }, [query]);
  
    return textareaRef;
  };
  const textareaRef = useAutoResizeTextarea(query);

  return (
    <div className="flex-1 flex flex-col relative bg-slate-900/60 backdrop-blur-lg border-l border-slate-700/30 overflow-hidden">
      {/* Chat Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar pt-8 pb-24 px-6"
        style={{
          background: `
            linear-gradient(
              180deg,
              rgba(15, 23, 42, 0.95) 0%,
              rgba(15, 23, 42, 0.98) 100%
            )
          `,
        }}
      >
        {/* Empty State */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-8 max-w-3xl mx-auto">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                PrivateAI
              </h1>
              <p className="text-slate-300 text-lg font-light">
                Your intelligent assistant powered by AI
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {[
                "Explain quantum computing in simple terms",
                "Suggest fun weekend activities",
                "How do I make a great pizza dough?",
                "Write a poem about artificial intelligence"
              ].map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(prompt)}
                  className="group relative p-4 text-left rounded-xl border border-slate-700/50 hover:border-purple-400/30 bg-slate-900/50 hover:bg-slate-800/30 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  <p className="text-slate-300 text-sm font-medium">{prompt}</p>
                  <span className="text-xs text-purple-400/70 mt-2 block">
                    <FiPlus className="inline mr-1" />
                    Quick prompt
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages List */}
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.map((message, index) => (
            <div key={index} className="group relative">
              <div className={`${message.query ? 'pl-12' : 'pr-12'}`}>
                {message.query && (
                  <div className="mb-8">
                    <div className="inline-block bg-slate-800/60 backdrop-blur-sm rounded-2xl px-6 py-4 border border-slate-700/30 shadow-xl">
                      <Response data={message.query} type="query" />
                    </div>
                  </div>
                )}
                {message.response && (
                  <div className="relative">
                    <div className="absolute -left-10 top-3 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-lg">
                      <span className="text-xs font-bold">AI</span>
                    </div>
                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl px-6 py-4 border border-slate-700/30 shadow-xl">
                      <Response 
                        data={message.response} 
                        type={typeof message.response === 'string' ? "text" : "image"} 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Container */}
      <div className="sticky bottom-0 bg-transparent pt-12 pb-8 px-6">
        <form 
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto relative rounded-xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-lg shadow-2xl"
        >
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
            disabled={loading}
            className="w-full resize-none bg-transparent p-4 pr-16 text-slate-200 placeholder-slate-500 focus:outline-none text-base scrollbar-thin"
            placeholder="Message PrivateAI..."
            style={{
              minHeight: '54px',
              overflowY: 'auto',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 transition-all shadow-lg"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/50 border-t-transparent" />
            ) : (
              <FiSend className="h-5 w-5 text-white" />
            )}
          </button>
        </form>
        <p className="text-center text-xs text-slate-500/80 mt-4">
          PrivateAI can make mistakes. Verify important information.
        </p>
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-8 p-3 bg-slate-800/50 backdrop-blur-sm rounded-full shadow-lg hover:bg-slate-700/50 transition-colors border border-slate-700/30 hover:border-purple-400/30 group"
        >
          <FiArrowDown className="w-5 h-5 text-slate-300 group-hover:text-purple-400 transition-colors" />
        </button>
      )}
    </div>
  );
};

export default Chat;