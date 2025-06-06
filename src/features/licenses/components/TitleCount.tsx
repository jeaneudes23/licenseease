import React from 'react'

export default function TitleCount({count}: {count: number}) {
  console.log('TitleCount rendered with count:', count)
  return (
    <div className='flex justify-center'>
      <div className='size-14 grid place-content-center rounded-full border-2 border-primary text-primary text-2xl font-bold '>
        {count}
      </div>
    </div>
  )
}
