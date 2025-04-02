import React, { useEffect, useState } from 'react'

const SlideData = ({ onSelectChat, currentChatId, refreshChats }) => {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadChats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/chats')
        if (!response.ok) throw new Error('Failed to load chats')
        const data = await response.json()
        setChats(data)
      } catch (error) {
        console.error('Chat load error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadChats()
  }, [refreshChats]) // Re-run when refreshChats changes

  return (
    <div className="w-full h-screen overflow-hidden bg-slate-900 text-white flex flex-col">
      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={() => onSelectChat(null)}
          className="w-full p-2 bg-slate-950 hover:bg-slate-800 rounded-full transition-colors"
        >
          New Chat
        </button>
      </div>

      {/* Scrollable Chat List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {loading ? (
          <div className="text-center text-gray-400 py-4">Loading...</div>
        ) : chats.length === 0 ? (
          <div className="text-center text-gray-400 py-4">No chats available</div>
        ) : (
          chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`cursor-pointer p-2 mx-2 my-1 rounded-lg transition-colors ${
                currentChatId === chat.id ? 'bg-slate-800' : 'hover:bg-slate-900'
              }`}
            >
              <div className="text-sm font-medium truncate">
                {chat.preview}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {new Date(chat.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SlideData
