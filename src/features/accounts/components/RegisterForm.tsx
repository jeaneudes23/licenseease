import SubmitButton from '@/components/SubmitButton'
import Link from 'next/link'
import React from 'react'

export default function RegisterForm() {
  return (
    <form className="grid gap-6 text-sm">
    <div className="grid gap-3">
      <div className="grid gap-1">
        <label htmlFor="name" className="primary">Name</label>
        <input type="text" className="primary"/>
      </div>
      <div className="grid gap-1">
        <label htmlFor="email" className="primary">Email address</label>
        <input type="email" className="primary"/>
      </div>
      <div className="grid gap-1">
        <label htmlFor="password" className="primary">Password</label>
        <input type="password" className="primary"/>
      </div>
      <div className="grid gap-1">
        <label htmlFor="password2" className="primary">Confirm password</label>
        <input type="password" className="primary"/>
      </div>
    </div>
    <div className="grid gap-6">
      <SubmitButton size={'lg'}>Login</SubmitButton>
      <p className="text-center">Already have an account ? <Link href={'/login'} className='text-primary'>Login</Link></p> 
    </div>
  </form>
  )
}
