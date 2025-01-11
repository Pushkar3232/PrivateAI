import React from 'react'

const Response = (props) => {
  return (
    <>
      <div 
        className={`bg-slate-900 w-5/12 mx-2 my-3 text-white py-6 px-8 rounded-lg ${props.type === 'query' ? 'ml-auto text-left' : 'mr-auto text-left'}`}
      >
        <h1 className='mb-8'>{props.data} </h1>
      </div>
    </>
  )
}

export default Response