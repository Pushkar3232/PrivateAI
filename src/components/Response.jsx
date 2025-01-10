import React from 'react'

const Response = (props) => {
  return (
    <>
    <h1 className='text-8xl font-mono justify-center text-white '>Chat</h1>
    <div className='bg-slate-900 text-white py-2 px-3 rounded-lg '>
        <h1 >{props.data}</h1>
    </div>
    </>
  )
}

export default Response