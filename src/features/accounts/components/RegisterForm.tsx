// ─────────────────────────────────────────────────────────────────
// src/features/accounts/components/RegisterForm.tsx
// ─────────────────────────────────────────────────────────────────

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import SubmitButton from '@/components/SubmitButton'
import Link from 'next/link'

export default function RegisterForm() {
  const router = useRouter()

  const [name, setName] = useState('')
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
      const res = await fetch('http://127.0.0.1:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Registration failed.')
      } else {
        setSuccess('Registration successful! Redirecting...')
        setTimeout(() => {
          router.push('/login')
        }, 1500)
      }
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 text-sm">
      <div className="grid gap-3">
        <div className="grid gap-1">
          <label htmlFor="name" className="primary">
            Name
          </label>
          <input
            id="name"
            type="text"
            className="primary"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor="email" className="primary">
            Email address
          </label>
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
          <label htmlFor="password" className="primary">
            Password
          </label>
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
          <label htmlFor="password2" className="primary">
            Confirm password
          </label>
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
          <Link href="/login" className="text-primary">
            Login
          </Link>
        </p>
      </div>
    </form>
  )
}
