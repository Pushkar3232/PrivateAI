import React, { useState } from 'react';
import Response from "../../components/Response";

const Chat = () => {
  const [data, setData] = useState(''); 
  const [queriesAndResponses, setQueriesAndResponses] = useState([]); 

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    
    
    setQueriesAndResponses(prev => [
      ...prev, 
      { query: data, response: data }
    ]);
    
    setData('');
    console.log('User Query:', data); 
  };

  return (
    <div className="w-full h-full bg-slate-950 p-4">
      
      {queriesAndResponses.map((item, index) => (
        <div key={index}>
          
          <div className="text-white">
          <Response data={item.query} type="query"/>
          </div>

         
          <div className="text-white">
            <Response data={item.response}type='response'/>
          </div>
        </div>
      ))}

      <div className="fixed flex-initial bottom-0 w-4/5 bg-slate-800 p-4 flex items-center rounded-md">
        <input
          type="text"
          name="query"
          id="query"
          value={data}
          className="w-full p-2 bg-slate-700 text-white rounded-lg focus:outline-none"
          placeholder="Type your message..."
          onChange={(e) => setData(e.target.value)} // Update the data state
        />
        
        <button
          className="px-4 py-1"
          onClick={handleQuerySubmit} // Handle the query submit
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32" className="icon-2xl">
            <path fill="currentColor" fillRule="evenodd" d="M15.192 8.906a1.143 1.143 0 0 1 1.616 0l5.143 5.143a1.143 1.143 0 0 1-1.616 1.616l-3.192-3.192v9.813a1.143 1.143 0 0 1-2.286 0v-9.813l-3.192 3.192a1.143 1.143 0 1 1-1.616-1.616z" clipRule="evenodd"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Chat;
