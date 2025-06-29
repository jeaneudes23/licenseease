'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User2, FileText, GaugeCircle, Settings } from 'lucide-react'

export default function ClientDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'profile' | 'dashboard' | 'license' | 'settings'>('profile')
  const [user, setUser] = useState<{ email: string; uid: string; role: string } | null>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [form, setForm] = useState({ licenseType: '', description: '', document: null as File | null })
  const [message, setMessage] = useState('')

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null

  useEffect(() => {
    if (!token || !storedUser) return router.push('/login')
    setUser(JSON.parse(storedUser))
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/applications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) setApplications(data)
    } catch (err) {
      console.error('Fetch error:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.licenseType || !form.description || !form.document) return setMessage('All fields required')

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
        setMessage('✅ Submitted successfully!')
        setForm({ licenseType: '', description: '', document: null })
        fetchApplications()
      } else {
        setMessage(data.error || 'Submission failed')
      }
    } catch {
      setMessage('Submission failed')
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">Profile</h2>
            <p>Email: {user?.email}</p>
            <p>UID: {user?.uid}</p>
            <p>Role: {user?.role}</p>
          </div>
        )
      case 'dashboard':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">Your Activities</h2>
            <ul className="list-disc pl-6">
              {applications.map((app, i) => (
                <li key={i}>{app.license_type}: {app.status}</li>
              ))}
            </ul>
          </div>
        )
      case 'license':
        return (
          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div>
              <label>License Type</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={form.licenseType}
                onChange={(e) => setForm({ ...form, licenseType: e.target.value })}
              />
            </div>
            <div>
              <label>Description</label>
              <textarea
                className="w-full border rounded p-2"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label>Upload File</label>
              <input
                type="file"
                onChange={(e) => setForm({ ...form, document: e.target.files?.[0] || null })}
              />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
            {message && <p className="text-green-600">{message}</p>}
          </form>
        )
      case 'settings':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">Settings</h2>
            <p>Coming soon: Edit profile, upload picture, dark mode toggle, logout.</p>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-100 p-4 border-r">
        <div className="text-lg font-bold mb-6">LicenseEase</div>
        <nav className="space-y-2">
          <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-2 ${activeTab === 'profile' ? 'text-blue-600 font-semibold' : ''}`}>
            <User2 size={18} /> Profile
          </button>
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 ${activeTab === 'dashboard' ? 'text-blue-600 font-semibold' : ''}`}>
            <GaugeCircle size={18} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('license')} className={`flex items-center gap-2 ${activeTab === 'license' ? 'text-blue-600 font-semibold' : ''}`}>
            <FileText size={18} /> Licenses
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 ${activeTab === 'settings' ? 'text-blue-600 font-semibold' : ''}`}>
            <Settings size={18} /> Settings
          </button>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto bg-white">{renderContent()}</main>
    </div>
  )
}
