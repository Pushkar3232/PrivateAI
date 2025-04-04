// App.jsx - Updated with better layout structure
import React, { useState, useEffect } from 'react'
import SlideData from './components/SlideData'
import Chat from './routes/chat/Chat'

const App = () => {
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
      {/* Sidebar with fixed position */}
      <div className="w-72 flex-shrink-0 h-screen sticky top-0 border-r border-slate-700/50">
        <SlideData 
          onSelectChat={setCurrentChatId}
          currentChatId={currentChatId}
          refreshChats={refreshChats}
        />
      </div>

      {/* Main chat area with independent scroll */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Chat 
          currentChatId={currentChatId}
          onChatCreated={handleNewChatCreated}
        />
      </div>
    </div>
  )
}

export default App