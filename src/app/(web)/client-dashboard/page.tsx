'use client'

import React, { useState, useEffect } from 'react'
import { LogOut, Moon, Settings, User, FileText, LayoutDashboard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getAuth, signOut } from 'firebase/auth'
import app from '@/firebase'

export default function ClientDashboard() {
  const router = useRouter()
  const auth = getAuth(app)

  const [tab, setTab] = useState('profile')
  const [form, setForm] = useState({
    licenseType: '',
    description: '',
    document: null as File | null,
  })
  const [applications, setApplications] = useState([])
  const [message, setMessage] = useState('')
  const [dark, setDark] = useState(false)

  const toggleTheme = () => setDark(!dark)

  const fetchApplications = async () => {
    const token = localStorage.getItem('authToken')
    try {
      const res = await fetch('http://127.0.0.1:5000/applications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) setApplications(data)
    } catch (err) {
      console.error('Error fetching applications:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('authToken')
    if (!form.licenseType || !form.description || !form.document) return setMessage('All fields required.')
    const formData = new FormData()
    formData.append('license_type', form.licenseType)
    formData.append('description', form.description)
    formData.append('file', form.document)

    try {
      const res = await fetch('http://127.0.0.1:5000/applications', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('✅ Submitted!')
        setForm({ licenseType: '', description: '', document: null })
        fetchApplications()
      } else {
        setMessage(data.error || 'Something went wrong.')
      }
    } catch (err) {
      setMessage('Failed to submit application.')
    }
  }

  const logout = () => {
    signOut(auth)
    localStorage.removeItem('authToken')
    router.push('/login')
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  return (
    <div className={`${dark ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-black'} flex h-screen`}>
      <aside className='w-64 p-4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
        <h2 className='text-2xl font-bold mb-6 flex items-center gap-2'><User className='w-6 h-6' /> LicenseEase</h2>
        <div className='flex flex-col gap-2 text-sm'>
          {[{ key: 'profile', icon: <User className='w-5 h-5' />, label: 'Profile' },
            { key: 'dashboard', icon: <LayoutDashboard className='w-5 h-5' />, label: 'Dashboard' },
            { key: 'licenses', icon: <FileText className='w-5 h-5' />, label: 'Licenses' },
            { key: 'settings', icon: <Settings className='w-5 h-5' />, label: 'Settings' }].map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-white hover:text-black hover:shadow-md transition ${tab === item.key ? 'bg-white text-black shadow-md' : 'text-gray-500'}`}
            >
              {item.icon} <span className='font-medium'>{item.label}</span>
            </button>
          ))}
        </div>
        <div className='mt-8 flex gap-3'>
          <button onClick={toggleTheme}><Moon /></button>
          <button onClick={logout}><LogOut /></button>
        </div>
      </aside>

      <main className='flex-grow p-6 overflow-y-auto'>
        {tab === 'profile' && (
          <div>
            <h2 className='text-2xl font-bold mb-4'>Profile</h2>
            <div className='flex items-center gap-6'>
              <div className='w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-600'></div>
              <div>
                <p><strong>Name:</strong> John Doe</p>
                <p><strong>Email:</strong> johndoe@example.com</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'dashboard' && (
          <div>
            <h2 className='text-2xl font-bold mb-4'>Dashboard Overview</h2>
            <p>You’ve submitted <strong>{applications.length}</strong> applications.</p>
          </div>
        )}

        {tab === 'licenses' && (
          <div>
            <h2 className='text-2xl font-bold mb-4'>Submit a License Application</h2>
            {message && <p className='text-blue-600 mb-2'>{message}</p>}
            <form onSubmit={handleSubmit} className='space-y-4 bg-white dark:bg-gray-900 p-4 rounded shadow'>
              <div>
                <label className='block'>License Type</label>
                <input
                  type='text'
                  value={form.licenseType}
                  onChange={(e) => setForm({ ...form, licenseType: e.target.value })}
                  className='w-full p-2 border rounded text-black'
                />
              </div>
              <div>
                <label className='block'>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className='w-full p-2 border rounded text-black'
                />
              </div>
              <div>
                <label className='block'>Document</label>
                <input
                  type='file'
                  accept='.pdf,.jpg,.png'
                  onChange={(e) => setForm({ ...form, document: e.target.files?.[0] || null })}
                  className='text-black'
                />
              </div>
              <button type='submit' className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>Submit</button>
            </form>
          </div>
        )}

        {tab === 'settings' && (
          <div>
            <h2 className='text-2xl font-bold mb-4'>Settings</h2>
            <p>Edit profile settings, update preferences, etc.</p>
          </div>
        )}
      </main>
    </div>
  )
}
