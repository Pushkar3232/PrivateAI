import React from 'react'
import SlideData from './components/SlideData'
import Chat from './routes/chat/Chat'

const App = () => {
  return (
    <div className="flex h-screen">
      <div className="w-1/6 flex">
        <SlideData />
      </div>

      <div className="flex-1 w-5/6">
        <Chat />
      </div>
    </div>
  )
}

export default App