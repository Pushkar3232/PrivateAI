import React, { useState, useEffect, useRef } from 'react';
import Response from "../../components/Response"; 

const Chat = () => {
  const [query, setQuery] = useState('');
  const [queriesAndResponses, setQueriesAndResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Create a reference to the chat container to handle scrolling
  const chatContainerRef = useRef(null);

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
  
    if (!query.trim()) {
      alert("Please enter a query!");
      return;
    }
  
    const numberOfPreviousQueries = queriesAndResponses.length;
    let prompt = numberOfPreviousQueries === 0
      ? `user: ${query}`
      : queriesAndResponses
          .slice(Math.max(0, numberOfPreviousQueries - 3))
          .map(item => `user: ${item.query}\nyou: ${item.response}`)
          .join("\n") + `\nuser: ${query}`;
  
    setQueriesAndResponses((prev) => [...prev, { query, response: "Loading..." }]);
    setLoading(true);
  
    try {
      const response = await fetch('http://127.0.0.1:5000/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
  
      if (query.includes("@image")) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
  
        setQueriesAndResponses((prev) =>
          prev.map((item, index) =>
            index === prev.length - 1
              ? { ...item, response: <img src={imageUrl} alt="Generated" /> }
              : item
          )
        );
      } else {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let result = "";
  
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          result += decoder.decode(value, { stream: true });
  
          setQueriesAndResponses((prev) =>
            prev.map((item, index) =>
              index === prev.length - 1
                ? { ...item, response: result }
                : item
            )
          );
        }
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      setQueriesAndResponses((prev) =>
        prev.map((item, index) =>
          index === prev.length - 1
            ? { ...item, response: "Failed to fetch response." }
            : item
        )
      );
    } finally {
      setLoading(false);
      setQuery('');
    }
  };
  
  const handelKeyEnter = (e) => {
    if (e.key === 'Enter') {
      handleQuerySubmit(e);
    }
  };
  
  // This effect will scroll to the bottom of the chat container whenever the queriesAndResponses array changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [queriesAndResponses]); // This will run whenever queriesAndResponses updates

  function autoResize(textarea) {
    textarea.style.height = 'auto'; // Reset height to auto to shrink if needed
    textarea.style.height = (textarea.scrollHeight) + 'px'; // Adjust height based on content
  }

  return (
    <div className="w-full h-screen overflow-auto bg-slate-950 p-4">
      <div className="chat-container" ref={chatContainerRef} style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
        {queriesAndResponses.map((item, index) => (
          <div key={index}>
            <div className="text-white">
              <Response data={item.query} type="query" />
            </div>
            <div className="text-white">
              <Response data={item.response} type="response" />
            </div>
          </div>
        ))}
      </div>

      <div className="fixed flex-initial bottom-0 mb-2 w-10/12 bg-slate-800 p-4 flex items-center rounded-md">
        <textarea
          name="query"
          id="query"
          value={query}
          className="w-full p-2 bg-slate-700 text-white rounded-lg focus:outline-none"
          placeholder="Type your message..."
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handelKeyEnter}
          aria-label="Type your query"
          rows="1"
          style={{ resize: 'none', overflowY: 'auto' }}
        />
        <button
          className="px-2 py-1 bg-slate-400 rounded-full ml-3"
          onClick={handleQuerySubmit}
          disabled={loading}
          aria-label="Submit your query"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32" className="icon-2xl">
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M15.192 8.906a1.143 1.143 0 0 1 1.616 0l5.143 5.143a1.143 1.143 0 0 1-1.616 1.616l-3.192-3.192v9.813a1.143 1.143 0 0 1-2.286 0v-9.813l-3.192 3.192a1.143 1.143 0 1 1-1.616-1.616z"
                clipRule="evenodd"
              ></path>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default Chat;
