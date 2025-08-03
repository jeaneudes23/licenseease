'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAuth, signOut } from 'firebase/auth'
import app from '@/firebase'
import ClientDashboardLayout from '@/features/client/components/ClientDashboardLayout'
import ProfileTab from '@/features/client/components/ProfileTab'
import SettingsTab from '@/features/client/components/SettingsTab'
import { apiRequest, APIError } from '@/lib/api'

function ClientDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const auth = getAuth(app)

  const [tab, setTab] = useState('dashboard')
  const [form, setForm] = useState({
    licenseType: '',
    description: '',
    documents: {
      businessPlan: null as File | null,
      rdbCertificate: null as File | null,
      companyContracts: null as File | null,
      otherDocuments: [] as File[]
    },
  })
  const [applications, setApplications] = useState<any[]>([])
  const [licenseCategories, setLicenseCategories] = useState<any[]>([])
  const [servicesLoading, setServicesLoading] = useState(false)
  const [servicesError, setServicesError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('en')
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
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
      const response = await fetch('http://127.0.0.1:5000/applications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setApplications(data)
      console.log('Applications loaded:', data)
    } catch (err) {
      console.error('Error fetching applications:', err)
      // Don't redirect for application fetch errors - just log them
    }
  }

  const fetchLicenseCategories = async () => {
    setServicesLoading(true)
    setServicesError('')
    try {
      // Try with direct fetch first (no auth required for public license data)
      const response = await fetch('http://127.0.0.1:5000/get_services', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setLicenseCategories(data)
      console.log('License categories loaded successfully:', data)
    } catch (err) {
      console.error('Error fetching license categories:', err)
      setServicesError(`Unable to load license categories: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setServicesLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if at least one document is uploaded
    const hasAnyDocument = form.documents.businessPlan || 
                          form.documents.rdbCertificate || 
                          form.documents.companyContracts || 
                          form.documents.otherDocuments.length > 0
    
    if (!form.licenseType || !form.description || !hasAnyDocument) {
      return setMessage('License type, description, and at least one document are required.')
    }
    
    setIsSubmitting(true)
    setMessage('')
    
    const formData = new FormData()
    formData.append('license_type', form.licenseType)
    formData.append('description', form.description)
    
    // Append all documents with their types
    if (form.documents.businessPlan) {
      formData.append('businessPlan', form.documents.businessPlan)
    }
    if (form.documents.rdbCertificate) {
      formData.append('rdbCertificate', form.documents.rdbCertificate)
    }
    if (form.documents.companyContracts) {
      formData.append('companyContracts', form.documents.companyContracts)
    }
    form.documents.otherDocuments.forEach((file, index) => {
      formData.append(`otherDocument_${index}`, file)
    })

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
      setForm({ 
        licenseType: '', 
        description: '', 
        documents: {
          businessPlan: null,
          rdbCertificate: null,
          companyContracts: null,
          otherDocuments: []
        }
      })
      
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
    fetchLicenseCategories()
    
    // Load user data from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUserProfile({
          name: `${userData.firstName} ${userData.lastName}`,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone || '',
          address: userData.company || '',
          profilePicture: ''
        })
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    
    // Check for payment success
    const paymentStatus = searchParams.get('payment')
    const tabParam = searchParams.get('tab')
    const categoryParam = searchParams.get('category')
    
    if (paymentStatus === 'success') {
      setMessage('✅ Payment completed successfully! Your application is now being processed.')
      setTab(tabParam || 'dashboard')
      // Clear URL parameters
      window.history.replaceState({}, '', '/client-dashboard')
    }
    
    // Set tab from URL parameter
    if (tabParam) {
      setTab(tabParam)
    }
    
    // Pre-select license category if coming from application page
    if (categoryParam && licenseCategories.length > 0) {
      const selectedCategory = licenseCategories.find((cat: any) => 
        cat.licenses?.some((license: any) => 
          license.name.toLowerCase().replace(/\s+/g, '-') === categoryParam ||
          license.id === categoryParam
        )
      )
      if (selectedCategory && selectedCategory.licenses) {
        const selectedLicense = selectedCategory.licenses.find((license: any) => 
          license.name.toLowerCase().replace(/\s+/g, '-') === categoryParam ||
          license.id === categoryParam
        )
        if (selectedLicense) {
          setForm({ ...form, licenseType: selectedLicense.name })
        }
      }
    }
  }, [searchParams, licenseCategories])

  return (
    <ClientDashboardLayout
      activeTab={tab}
      onTabChange={setTab}
      onLogout={logout}
      darkMode={darkMode}
    >
     
      {tab === 'dashboard' && (
        <div className='px-6 py-4'>
          <div className='mb-8'>
            <h2 className='text-3xl font-bold mb-2'>Welcome back, {userProfile.firstName || userProfile.name?.split(' ')[0] || 'User'}!</h2>
            <p className='text-gray-600 dark:text-gray-400'>Here&apos;s an overview of your license applications and account activity.</p>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
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

          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
            <h3 className='text-xl font-semibold mb-4'>Quick Actions</h3>
            <div className='flex flex-col sm:flex-row gap-4'>
              <button 
                onClick={() => router.push('/apply-license')}
                className='bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium'
              >
                Start New Application
              </button>
              <button 
                onClick={() => setTab('licenses')}
                className='border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium'
              >
                View All Licenses
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'profile' && (
        <ProfileTab
          userProfile={userProfile}
          onUpdateProfile={handleUpdateProfile}
        />
      )}

      {tab === 'applications' && (
        <div className='px-6 py-4'>
          <h2 className='text-2xl font-bold mb-6'>My Applications</h2>
          
          {applications.length === 0 ? (
            <div className='text-center py-12'>
              <div className='text-gray-400 text-6xl mb-4'>📋</div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>No Applications Yet</h3>
              <p className='text-gray-600 mb-6'>You haven&apos;t submitted any license applications yet.</p>
              <button 
                onClick={() => router.push('/apply-license')}
                className='bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors'
              >
                Apply for License
              </button>
            </div>
          ) : (
            <div className='space-y-4'>
              {applications.map((app) => (
                <div key={app.id} className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                        {app.license_type}
                      </h3>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        Application #{app.id} • Submitted {new Date(app.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'approved' ? 'bg-green-100 text-green-800' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </div>
                  </div>
                  
                  <div className='mb-4'>
                    <p className='text-sm text-gray-700 dark:text-gray-300'>
                      <strong>Description:</strong> {app.description?.substring(0, 200)}
                      {app.description?.length > 200 && '...'}
                    </p>
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                    <div>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        <strong>Applicant:</strong> {app.applicant_name || 'N/A'}
                      </p>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        <strong>Company:</strong> {app.company || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        <strong>Files:</strong> {app.files?.length || 0} document(s)
                      </p>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        <strong>Processing Time:</strong> 14-21 days
                      </p>
                    </div>
                  </div>
                  
                  {app.files && app.files.length > 0 && (
                    <div className='mb-4'>
                      <h4 className='text-sm font-medium text-gray-900 dark:text-white mb-2'>Uploaded Documents:</h4>
                      <div className='flex flex-wrap gap-2'>
                        {app.files.map((file: any, index: number) => (
                          <span key={index} className='bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs'>
                            {file.type}: {file.original_filename}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className='flex gap-2'>
                    <button className='text-blue-600 hover:text-blue-800 text-sm font-medium'>
                      View Details
                    </button>
                    {app.status === 'pending' && (
                      <button className='text-gray-600 hover:text-gray-800 text-sm font-medium'>
                        Track Status
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'licenses' && (
        <div className='px-6 py-4'>
          <div className='mb-8'>
            <h2 className='text-2xl font-bold mb-2'>License Categories</h2>
            <p className='text-gray-600 dark:text-gray-400'>Choose from our available IT service license categories. Each category has specific requirements and benefits.</p>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {/* Application Service Provider */}
            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer group'>
              <div className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='bg-blue-100 dark:bg-blue-900 p-3 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors'>
                    <svg className='w-6 h-6 text-blue-600 dark:text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                    </svg>
                  </div>
                  <div className='text-right'>
                    <div className='text-sm font-medium text-blue-600 dark:text-blue-400'>$250</div>
                    <div className='text-xs text-gray-500'>License Fee</div>
                  </div>
                </div>
                
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                  Application Service Provider
                </h3>
                
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed'>
                  Provide software applications and services to customers over the internet, including SaaS, web applications, and cloud-based solutions.
                </p>
                
                <div className='space-y-3 mb-6'>
                  <div className='flex items-center text-xs text-gray-500'>
                    <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                    </svg>
                    Processing: 14-21 days
                  </div>
                  <div className='flex items-center text-xs text-gray-500'>
                    <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                    </svg>
                    Validity: 2 years
                  </div>
                </div>
                
                <button 
                  onClick={() => router.push('/apply-license')}
                  className='w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium group-hover:bg-blue-700'
                >
                  Learn More & Apply
                </button>
              </div>
            </div>

            {/* Network Infrastructure */}
            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 cursor-pointer group'>
              <div className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='bg-green-100 dark:bg-green-900 p-3 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors'>
                    <svg className='w-6 h-6 text-green-600 dark:text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01' />
                    </svg>
                  </div>
                  <div className='text-right'>
                    <div className='text-sm font-medium text-green-600 dark:text-green-400'>$400</div>
                    <div className='text-xs text-gray-500'>License Fee</div>
                  </div>
                </div>
                
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors'>
                  Network Infrastructure
                </h3>
                
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed'>
                  Deploy, maintain, and operate network infrastructure including fiber optic cables, wireless towers, data centers, and telecommunications equipment.
                </p>
                
                <div className='space-y-3 mb-6'>
                  <div className='flex items-center text-xs text-gray-500'>
                    <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                    </svg>
                    Processing: 21-30 days
                  </div>
                  <div className='flex items-center text-xs text-gray-500'>
                    <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                    </svg>
                    Validity: 3 years
                  </div>
                </div>
                
                <button 
                  onClick={() => router.push('/apply-license')}
                  className='w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium group-hover:bg-green-700'
                >
                  Learn More & Apply
                </button>
              </div>
            </div>

            {/* Network Service Provider */}
            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 cursor-pointer group'>
              <div className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='bg-purple-100 dark:bg-purple-900 p-3 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors'>
                    <svg className='w-6 h-6 text-purple-600 dark:text-purple-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0' />
                    </svg>
                  </div>
                  <div className='text-right'>
                    <div className='text-sm font-medium text-purple-600 dark:text-purple-400'>$500</div>
                    <div className='text-xs text-gray-500'>License Fee</div>
                  </div>
                </div>
                
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors'>
                  Network Service Provider
                </h3>
                
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed'>
                  Provide internet connectivity, telecommunications services, and network access to end users including ISP services, mobile networks, and enterprise connectivity.
                </p>
                
                <div className='space-y-3 mb-6'>
                  <div className='flex items-center text-xs text-gray-500'>
                    <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                    </svg>
                    Processing: 30-45 days
                  </div>
                  <div className='flex items-center text-xs text-gray-500'>
                    <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                    </svg>
                    Validity: 5 years
                  </div>
                </div>
                
                <button 
                  onClick={() => router.push('/apply-license')}
                  className='w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium group-hover:bg-purple-700'
                >
                  Learn More & Apply
                </button>
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className='mt-12 bg-gray-50 dark:bg-gray-800 rounded-xl p-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Need Help Choosing?</h3>
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <h4 className='font-medium text-gray-900 dark:text-white mb-2'>General Requirements</h4>
                <ul className='text-sm text-gray-600 dark:text-gray-400 space-y-1'>
                  <li>• Valid business registration certificate</li>
                  <li>• Technical documentation and specifications</li>
                  <li>• Compliance and safety certificates</li>
                  <li>• Financial statements and business plan</li>
                </ul>
              </div>
              <div>
                <h4 className='font-medium text-gray-900 dark:text-white mb-2'>Application Process</h4>
                <ul className='text-sm text-gray-600 dark:text-gray-400 space-y-1'>
                  <li>• Submit application with required documents</li>
                  <li>• Pay application and license fees</li>
                  <li>• Technical review and evaluation</li>
                  <li>• License issuance upon approval</li>
                </ul>
              </div>
            </div>
            <div className='mt-6 flex flex-col sm:flex-row gap-4'>
              <button 
                onClick={() => router.push('/apply-license')}
                className='bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium'
              >
                Start Application Process
              </button>
              <button className='border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium'>
                Contact Support
              </button>
            </div>
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

export default function ClientDashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientDashboardContent />
    </Suspense>
  )
}
