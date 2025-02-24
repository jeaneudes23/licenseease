import SubmitButton from '@/components/SubmitButton'
import React from 'react'

export default function CategoriesCreateForm() {
  return (
    <form className='grid gap-6'>
      <div className='grid gap-3'>
        <div className='grid gap-1'>
          <label htmlFor="name" className="primary">Name</label>
          <input type="text" className="primary" />
        </div>
        <div className='grid gap-1'>
          <label htmlFor="description" className="primary">Description</label>
          <textarea name="description" id="" className="primary"></textarea>
        </div>
      </div>
      <div>
        <SubmitButton>Create</SubmitButton>
      </div>
    </form>
  )
}
