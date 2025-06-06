// ─────────────────────────────────────────────────────────────────
// src/features/accounts/components/LoginForm.tsx
// ─────────────────────────────────────────────────────────────────

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import SubmitButton from '@/components/SubmitButton'
import Link from 'next/link'

export default function LoginForm() {
  const router = useRouter()

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('http://127.0.0.1:5000/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Show error from backend (e.g. "Invalid credentials")
        setError(data.message || 'Login failed.')
      } else {
        // 1) Store token globally
        //    Assuming your backend returns { token: 'jwt-xyz...', user: { ... } }
        localStorage.setItem('authToken', data.token)

        //    If you also want to store user data:
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }

        // 2) Optionally, set up a global fetch helper (see notes below)
        //    so you can automatically include `Authorization: Bearer ...` on future requests.

        // 3) Redirect to a protected page
        router.push('/applications')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 text-sm">
      <div className="grid gap-3">
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
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="grid gap-6">
        <SubmitButton size="lg" disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
        </SubmitButton>
        <p className="text-center">
          Don’t have an account?{' '}
          <Link href="/register" className="text-primary">
            Register
          </Link>
        </p>
      </div>
    </form>
  )
}
