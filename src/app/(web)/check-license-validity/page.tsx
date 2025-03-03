import SubmitButton from '@/components/SubmitButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

export default function page() {
  return (
    <main className='space-y-12'>
      <div className='bg-primary py-12'>
        <div className="container text-primary-foreground">
          <h2 className='text-3xl font-extrabold capitalize'>Check License validity</h2>
        </div>
      </div>
      <form action="" className='text-sm flex items-end max-w-md mx-auto gap-4 flex-wrap'>
          <div className='grid gap-1 primary flex-grow'>
            <label hidden className='primary'>Document number</label>
            <input placeholder='Document Number' type="text" className='primary' />
          </div>
          <div>
            <SubmitButton>Check</SubmitButton>
          </div>
      </form>
      <div className='container '>
        ---Results Here
      </div>
    </main>
  )
}
