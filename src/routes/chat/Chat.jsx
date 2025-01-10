import React, { useState } from 'react'
import Response from "../../components/Response";

const Chat = () => {
    const [data, setData] = useState('')
  return (
    <div className="w-full h-full bg-slate-950 p-4">
    <Response data="My Data"/>
    </div>
  )
}

export default Chat