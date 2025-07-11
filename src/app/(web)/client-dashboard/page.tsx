'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth, signOut } from 'firebase/auth'
import app from '@/firebase'
import ClientDashboardLayout from '@/features/client/components/ClientDashboardLayout'
import ProfileTab from '@/features/client/components/ProfileTab'
import SettingsTab from '@/features/client/components/SettingsTab'

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
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('en')
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'johndoe@example.com',
    phone: '',
    address: '',
    profilePicture: ''
  })
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true
  })

  const toggleTheme = () => setDarkMode(!darkMode)

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

  const handleUpdateProfile = (newProfile: any) => {
    setUserProfile(newProfile)
  }

  const handleNotificationChange = (type: string, enabled: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [type]: enabled
    }))
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  return (
    <ClientDashboardLayout
      activeTab={tab}
      onTabChange={setTab}
      onLogout={logout}
      darkMode={darkMode}
      onToggleDarkMode={toggleTheme}
      userProfile={userProfile}
    >
      {tab === 'profile' && (
        <ProfileTab
          userProfile={userProfile}
          onUpdateProfile={handleUpdateProfile}
        />
      )}

      {tab === 'dashboard' && (
        <div className='px-6 py-4'>
          <h2 className='text-2xl font-bold mb-6'>Dashboard Overview</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
              <h3 className='text-lg font-semibold mb-2'>Total Applications</h3>
              <p className='text-3xl font-bold text-primary'>{applications.length}</p>
            </div>
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
              <h3 className='text-lg font-semibold mb-2'>Pending</h3>
              <p className='text-3xl font-bold text-yellow-600'>{applications.filter((app: any) => app.status === 'pending').length}</p>
            </div>
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
              <h3 className='text-lg font-semibold mb-2'>Approved</h3>
              <p className='text-3xl font-bold text-green-600'>{applications.filter((app: any) => app.status === 'approved').length}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'licenses' && (
        <div className='px-6 py-4'>
          <h2 className='text-2xl font-bold mb-6'>Submit a License Application</h2>
          {message && (
            <div className={`mb-4 p-3 rounded-md ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>License Type</label>
                <input
                  type='text'
                  value={form.licenseType}
                  onChange={(e) => setForm({ ...form, licenseType: e.target.value })}
                  className='w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className='w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600'
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>Document</label>
                <input
                  type='file'
                  accept='.pdf,.jpg,.png'
                  onChange={(e) => setForm({ ...form, document: e.target.files?.[0] || null })}
                  className='w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600'
                  required
                />
              </div>
              <button 
                type='submit' 
                className='bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors'
              >
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <SettingsTab
          darkMode={darkMode}
          onToggleDarkMode={toggleTheme}
          language={language}
          onLanguageChange={setLanguage}
          notifications={notifications}
          onNotificationChange={handleNotificationChange}
        />
      )}
    </ClientDashboardLayout>
  )
}
