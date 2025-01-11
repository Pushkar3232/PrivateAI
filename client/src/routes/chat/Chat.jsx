import React, { useState } from 'react';
import Response from "../../components/Response";

const Chat = () => {
  const [query, setQuery] = useState(''); 
  const [queriesAndResponses, setQueriesAndResponses] = useState([]); 
  const [loading, setLoading] = useState(false);

  const handleQuerySubmit = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      alert("Please enter a query!");
      return;
    }

    setQueriesAndResponses((prev) => [...prev, { query, response: "Loading..." }]);

    setLoading(true);

    try {
      
      const response = await fetch('http://127.0.0.1:5000/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }), // Sending the query
      });

      const result = await response.json(); // Get the response from the backend

      // Update the response in the state
      setQueriesAndResponses((prev) =>
        prev.map((item, index) =>
          index === prev.length - 1
            ? { ...item, response: result.response }
            : item
        )
      );
    } catch (error) {
      console.error("Error fetching response:", error);
      // Handle errors gracefully
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

  return (
    <div className="w-full h-screen overflow-auto bg-slate-950 p-4">
      
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

      
      <div className="fixed flex-initial bottom-0 mb-2 w-4/5 bg-slate-800 p-4 flex items-center rounded-md">
        <input
          type="text"
          name="query"
          id="query"
          value={query}
          className="w-full p-2 bg-slate-700 text-white rounded-lg focus:outline-none"
          placeholder="Type your message..."
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Type your query"
        />
        <button
          className="px-4 py-1"
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
