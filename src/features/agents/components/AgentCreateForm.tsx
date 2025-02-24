import SubmitButton from '@/components/SubmitButton'
import React from 'react'

export default function AgentCreateForm() {
  return (
    <form className='grid gap-6'>
      <div className='grid md:grid-cols-2 gap-3'>
        <div className='grid gap-1'>
          <label htmlFor="name" className="primary">Name</label>
          <input type="text" className="primary" />
        </div>
        <div className='grid gap-1'>
          <label htmlFor="email" className="primary">Email</label>
          <input type="email" className="primary" />
        </div>
        <div className='grid gap-1'>
          <label htmlFor="phone" className="primary">Phone</label>
          <input type="text" className="primary" />
        </div>
        <div className='grid gap-1'>
          <label htmlFor="address" className="primary">Address</label>
          <input type="text" className="primary" />
        </div>
        <div className='grid gap-1'>
          <label htmlFor="password" className="primary">Password</label>
          <input type="text" className="primary" />
        </div>
      </div>
      <div>
        <SubmitButton>Create</SubmitButton>
      </div>
    </form>
  )
}
