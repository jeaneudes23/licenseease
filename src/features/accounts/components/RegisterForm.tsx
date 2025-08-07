// ─────────────────────────────────────────────────────────────────
// src/features/accounts/components/RegisterForm.tsx
// ─────────────────────────────────────────────────────────────────

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import SubmitButton from '@/components/SubmitButton'
import Link from 'next/link'

export default function RegisterForm() {
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== password2) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const token = await userCredential.user.getIdToken()
      const uid = userCredential.user.uid

      // Send UID and role to backend to assign default role
      const res = await fetch('http://127.0.0.1:5002/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, role: 'client' }) // default role
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to assign role')
      }

      setSuccess('Registration successful! Redirecting...')
      setTimeout(() => router.push('/login'), 1500)
    } catch (err: any) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 text-sm">
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1">
            <label htmlFor="firstName" className="primary">First Name</label>
            <input
              id="firstName"
              type="text"
              className="primary"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="lastName" className="primary">Last Name</label>
            <input
              id="lastName"
              type="text"
              className="primary"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="grid gap-1">
          <label htmlFor="company" className="primary">Company</label>
          <input
            id="company"
            type="text"
            className="primary"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-1">
          <label htmlFor="phone" className="primary">Phone</label>
          <input
            id="phone"
            type="tel"
            className="primary"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+250123456789"
            required
          />
        </div>
        <div className="grid gap-1">
          <label htmlFor="email" className="primary">Email address</label>
          <input
            id="email"
            type="email"
            className="primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-1">
          <label htmlFor="password" className="primary">Password</label>
          <input
            id="password"
            type="password"
            className="primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-1">
          <label htmlFor="password2" className="primary">Confirm password</label>
          <input
            id="password2"
            type="password"
            className="primary"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">{success}</p>}

      <div className="grid gap-6">
        <SubmitButton size="lg" disabled={loading}>
          {loading ? 'Registering…' : 'Register'}
        </SubmitButton>
        <p className="text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-primary">Login</Link>
        </p>
      </div>
    </form>
  )
}