'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAuth, signOut } from 'firebase/auth'
import app from '@/firebase'
import ClientDashboardLayout from '@/features/client/components/ClientDashboardLayout'
import ProfileTab from '@/features/client/components/ProfileTab'
import SettingsTab from '@/features/client/components/SettingsTab'
import { apiRequest, APIError } from '@/lib/api'

export default function ClientDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const auth = getAuth(app)

  const [tab, setTab] = useState('profile')
  const [form, setForm] = useState({
    licenseType: '',
    description: '',
    document: null as File | null,
  })
  const [applications, setApplications] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    try {
      const data = await apiRequest('http://127.0.0.1:5000/applications')
      setApplications(data)
    } catch (err) {
      console.error('Error fetching applications:', err)
      if (err instanceof APIError && err.status === 401) {
        // Token expired and couldn't refresh, redirect to login
        router.push('/login')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.licenseType || !form.description || !form.document) return setMessage('All fields required.')
    
    setIsSubmitting(true)
    setMessage('')
    
    const formData = new FormData()
    formData.append('license_type', form.licenseType)
    formData.append('description', form.description)
    formData.append('file', form.document)

    try {
      const data = await apiRequest('http://127.0.0.1:5000/applications', {
        method: 'POST',
        body: formData,
      })
      
      // Add the new application with pending status immediately
      const newApplication = {
        id: data.id || Date.now(),
        license_type: form.licenseType,
        description: form.description,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        ...data
      }
      setApplications(prev => [...prev, newApplication])
      
      setMessage('✅ Application submitted successfully!')
      setForm({ licenseType: '', description: '', document: null })
      
      // Redirect to payment page after 1 second
      setTimeout(() => {
        router.push(`/licenses/${form.licenseType.toLowerCase().replace(/\s+/g, '-')}/pay?type=first-time-application-fee`)
      }, 1000)
    } catch (err) {
      if (err instanceof APIError && err.status === 401) {
        setMessage('Your session has expired. Please log in again.')
        router.push('/login')
      } else {
        setMessage(err instanceof APIError ? err.message : 'Failed to submit application.')
      }
    } finally {
      setIsSubmitting(false)
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
    
    // Check for payment success
    const paymentStatus = searchParams.get('payment')
    const tabParam = searchParams.get('tab')
    
    if (paymentStatus === 'success') {
      setMessage('✅ Payment completed successfully! Your application is now being processed.')
      setTab(tabParam || 'dashboard')
      // Clear URL parameters
      window.history.replaceState({}, '', '/client-dashboard')
    }
  }, [searchParams])

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
                disabled={isSubmitting}
                className='bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
              >
                {isSubmitting ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    Processing...
                  </>
                ) : (
                  'Submit Application'
                )}
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
