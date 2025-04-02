import React, { useState, useEffect } from 'react'
import SlideData from './components/SlideData'
import Chat from './routes/chat/Chat'

const App = () => {
  const [currentChatId, setCurrentChatId] = useState(null)
  const [chatList, setChatList] = useState([])
  const [refreshChats, setRefreshChats] = useState(false)

  // Load initial chat list (this is handled in SlideData too, but you can keep this for other purposes)
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
  }, [refreshChats]) // trigger re-load when refreshChats changes

  const handleNewChatCreated = (chatId) => {
    setCurrentChatId(chatId)
    setRefreshChats(prev => !prev) // toggle refreshChats to force refresh
  }

  return (
    <div className="flex h-full">
      <div className="w-1/6 flex">
        <SlideData 
          onSelectChat={setCurrentChatId}
          currentChatId={currentChatId}
          refreshChats={refreshChats}
        />
      </div>
      <div className="flex-1 w-full h-full">
        <Chat 
          currentChatId={currentChatId}
          onChatCreated={handleNewChatCreated}
        />
      </div>
    </div>
  )
}

export default App
