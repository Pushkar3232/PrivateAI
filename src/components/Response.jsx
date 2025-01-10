import React from 'react'

const Response = (props) => {
  return (
    <>
      <div 
        className={`bg-slate-900 w-5/12 text-white py-2 px-3 rounded-lg ${props.type === 'query' ? 'ml-auto text-left' : 'mr-auto text-left'}`}
      >
        <h1>{props.data} </h1>
      </div>
    </>
  )
}

export default Response