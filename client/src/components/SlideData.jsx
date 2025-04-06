import React, { useEffect, useState } from 'react'
import { FiPlus, FiClock, FiMessageSquare, FiX, FiChevronLeft } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'

const SlideData = ({ onSelectChat, currentChatId, refreshChats, onToggle, isVisible }) => {
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
  }, [refreshChats])

  return (
    <div className="h-full bg-slate-900/50 backdrop-blur-lg border-r border-slate-700/50 flex flex-col">
      {/* New Chat Button */}
      <div className="p-4 border-b border-slate-700/50">
        <button
          onClick={() => onSelectChat(null)}
          className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/10 hover:from-purple-500/30 hover:to-blue-500/20 rounded-xl transition-all duration-300 border border-slate-700/50 hover:border-purple-400/30 group"
        >
          <FiPlus className="text-purple-400 group-hover:text-purple-300 transition-colors" />
          <span className="text-slate-200 font-medium group-hover:text-slate-100 transition-colors">
            New Chat
          </span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-2">
        {loading ? (
          <div className="text-center text-slate-500/80 py-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent" />
            </div>
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center text-slate-500/80 py-4 px-2">
            <div className="inline-block p-4 bg-slate-800/30 rounded-xl">
              <FiMessageSquare className="mx-auto text-2xl mb-2 text-purple-500/80" />
              <p className="text-sm">No conversations yet</p>
            </div>
          </div>
        ) : (
          chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`group relative mx-2 my-1 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                currentChatId === chat.id 
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/10 border border-purple-400/20'
                  : 'hover:bg-slate-800/20 border border-transparent hover:border-slate-700/50'
              }`}
            >
              {/* Active Chat Indicator */}
              {currentChatId === chat.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-400 rounded-r-full shadow-md" />
              )}

              {/* Chat Preview */}
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800/50 flex items-center justify-center text-purple-400/80 text-xs">
                  <FiMessageSquare />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200 truncate">
                    {chat.preview || "New Chat"}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-500/80 mt-1">
                    <FiClock className="flex-shrink-0" />
                    <span>
                      {formatDistanceToNow(new Date(chat.created_at), { 
                        addSuffix: true 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="text-center text-xs text-slate-500/80">
          Powered by PrivateAI
          <br />
          <span className="text-[0.7rem]">v1.0.0</span>
        </div>
      </div>
    </div>
  )
}

export default SlideData