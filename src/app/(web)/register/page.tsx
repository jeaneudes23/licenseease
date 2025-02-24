import RegisterForm from '@/features/accounts/components/RegisterForm'
import React from 'react'

export default function page() {
  return (
    <main className='max-w-md mx-auto'>
      <div className='px-6 py-10 border shadow grid gap-8 mt-16 rounded-md bg-white'>
        <h2 className='text-2xl font-medium capitalize'>Create a new account</h2>
        <RegisterForm />
      </div>
    </main>
  )
}
