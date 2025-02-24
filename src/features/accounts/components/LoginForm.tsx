"use client"

import SubmitButton from "@/components/SubmitButton"
import Link from "next/link"

export default function LoginForm() {
  return (
    <form className="grid gap-6 text-sm">
      <div className="grid gap-3">
        <div className="grid gap-1">
          <label htmlFor="email" className="primary">Email address</label>
          <input type="email" className="primary"/>
        </div>
        <div className="grid gap-1">
          <label htmlFor="password" className="primary">Password</label>
          <input type="password" className="primary"/>
        </div>
      </div>
      <div className="grid gap-6">
        <SubmitButton size={'lg'}>Login</SubmitButton>
        <p className="text-center">Don&apos;t have an account ? <Link href={'/register'} className='text-primary'>Register</Link></p> 
      </div>
    </form>
  )
}
