// App.jsx - Updated with better layout structure
import React, { useState, useEffect } from 'react'
import SlideData from './components/SlideData'
import Chat from './routes/chat/Chat'

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null)
  const [chatList, setChatList] = useState([])
  const [refreshChats, setRefreshChats] = useState(false)

  useEffect(() => {
    const loadInitialChats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/chats')
        const data = await response.json()
        setChatList(data)
      } catch (error) {
        console.error('Error loading initial chats:', error)
      }
    }
    loadInitialChats()
  }, [refreshChats])

  const handleNewChatCreated = (chatId) => {
    setCurrentChatId(chatId)
    setRefreshChats(prev => !prev)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 to-slate-950 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg text-white transition-all"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`fixed md:relative z-40 w-72 h-screen transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <SlideData 
          onSelectChat={(chatId) => {
            setCurrentChatId(chatId);
            setIsSidebarOpen(false); 
            
          }}
          
          currentChatId={currentChatId}
          refreshChats={refreshChats}
        />
      </div>

      {/* Main chat area with independent scroll */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Chat 
          currentChatId={currentChatId}
          onChatCreated={handleNewChatCreated}
        />
      </div>
    </div>
  )
}

export default App