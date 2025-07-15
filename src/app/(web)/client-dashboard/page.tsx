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
          <div className='mb-8'>
            <h2 className='text-3xl font-bold mb-2'>Welcome back, {userProfile.lastName}!</h2>
            <p className='text-gray-600 dark:text-gray-400'>Here's an overview of your license applications and account activity.</p>
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

      {tab === 'licenses' && (
        <div className='px-6 py-4'>
          <h2 className='text-2xl font-bold mb-6'>License Categories & Requirements</h2>
          
          {servicesError && (
            <div className='mb-6 p-4 bg-red-100 text-red-700 rounded-md border border-red-200'>
              <div className='flex items-center gap-2'>
                <span className='text-lg'>⚠️</span>
                <span>{servicesError}</span>
              </div>
              <button 
                onClick={fetchLicenseCategories}
                className='mt-2 text-sm underline hover:no-underline'
              >
                Try again
              </button>
            </div>
          )}

          {servicesLoading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
              <span className='ml-3 text-gray-600'>Loading license categories...</span>
            </div>
          ) : (
            <div className='space-y-6'>
              {licenseCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'>
                  <div className='bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600'>
                    <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>{category.name}</h3>
                  </div>
                  <div className='p-6'>
                    <div className='grid gap-6'>
                      {category.licenses?.map((license: any, licenseIndex: number) => (
                        <div key={licenseIndex} className='border border-gray-200 dark:border-gray-600 rounded-lg p-4'>
                          <div className='flex justify-between items-start mb-4'>
                            <h4 className='text-lg font-medium text-gray-900 dark:text-white'>{license.name}</h4>
                            <div className='text-right text-sm text-gray-600 dark:text-gray-400'>
                              <div>Validity: {license.validity} years</div>
                              <div>Processing: {license.processing_time} days</div>
                            </div>
                          </div>
                          
                          <div className='grid md:grid-cols-2 gap-4'>
                            <div>
                              <h5 className='font-medium text-gray-900 dark:text-white mb-2'>Application Requirements:</h5>
                              {license.application_requirements?.length > 0 ? (
                                <ul className='list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1'>
                                  {license.application_requirements.map((req: string, reqIndex: number) => (
                                    <li key={reqIndex}>{req}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className='text-sm text-gray-500 italic'>No specific requirements listed</p>
                              )}
                            </div>
                            
                            <div>
                              <h5 className='font-medium text-gray-900 dark:text-white mb-2'>Fees:</h5>
                              <div className='text-sm text-gray-600 dark:text-gray-400 space-y-1'>
                                <div>Application: ${license.first_time_application_fee}</div>
                                <div>License: ${license.first_time_license_fee}</div>
                                <div className='text-xs text-gray-500'>
                                  Renewal: ${license.renewal_application_fee} + ${license.renewal_license_fee}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => setForm({ ...form, licenseType: license.name })}
                            className='mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm'
                          >
                            Apply for this license
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              {licenseCategories.length === 0 && !servicesLoading && !servicesError && (
                <div className='text-center py-12 text-gray-500'>
                  <span className='text-4xl mb-4 block'>📋</span>
                  <p>No license categories available at the moment.</p>
                </div>
              )}
            </div>
          )}

          {message && (
            <div className={`mt-6 p-3 rounded-md ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          {form.licenseType && (
            <div className='mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-t-4 border-primary'>
              <h3 className='text-lg font-semibold mb-4'>Submit Application for: {form.licenseType}</h3>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium mb-2'>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className='w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600'
                    rows={4}
                    placeholder='Describe your business or intended use for this license...'
                    required
                  />
                </div>
                <div className='space-y-4'>
                  <h4 className='text-sm font-medium'>Required Documents</h4>
                  
                  <div className='grid md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium mb-2'>Business Plan</label>
                      <input
                        type='file'
                        accept='.pdf,.jpg,.png'
                        onChange={(e) => setForm({ 
                          ...form, 
                          documents: { 
                            ...form.documents, 
                            businessPlan: e.target.files?.[0] || null 
                          }
                        })}
                        className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm'
                      />
                      {form.documents.businessPlan && (
                        <p className='text-xs text-green-600 mt-1'>✓ {form.documents.businessPlan.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className='block text-sm font-medium mb-2'>RDB Certificate</label>
                      <input
                        type='file'
                        accept='.pdf,.jpg,.png'
                        onChange={(e) => setForm({ 
                          ...form, 
                          documents: { 
                            ...form.documents, 
                            rdbCertificate: e.target.files?.[0] || null 
                          }
                        })}
                        className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm'
                      />
                      {form.documents.rdbCertificate && (
                        <p className='text-xs text-green-600 mt-1'>✓ {form.documents.rdbCertificate.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className='block text-sm font-medium mb-2'>Company Contracts</label>
                      <input
                        type='file'
                        accept='.pdf,.jpg,.png'
                        onChange={(e) => setForm({ 
                          ...form, 
                          documents: { 
                            ...form.documents, 
                            companyContracts: e.target.files?.[0] || null 
                          }
                        })}
                        className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm'
                      />
                      {form.documents.companyContracts && (
                        <p className='text-xs text-green-600 mt-1'>✓ {form.documents.companyContracts.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className='block text-sm font-medium mb-2'>Other Documents</label>
                      <input
                        type='file'
                        accept='.pdf,.jpg,.png'
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          setForm({ 
                            ...form, 
                            documents: { 
                              ...form.documents, 
                              otherDocuments: files 
                            }
                          })
                        }}
                        className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm'
                      />
                      {form.documents.otherDocuments.length > 0 && (
                        <div className='text-xs text-green-600 mt-1'>
                          ✓ {form.documents.otherDocuments.length} file(s) selected
                          <ul className='list-disc list-inside mt-1 text-gray-600'>
                            {form.documents.otherDocuments.map((file, index) => (
                              <li key={index}>{file.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className='text-xs text-gray-500'>
                    <strong>Note:</strong> At least one document is required. Accepted formats: PDF, JPG, PNG
                  </p>
                </div>
                <div className='flex gap-3'>
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
                  <button 
                    type='button'
                    onClick={() => setForm({ 
                      licenseType: '', 
                      description: '', 
                      documents: {
                        businessPlan: null,
                        rdbCertificate: null,
                        companyContracts: null,
                        otherDocuments: []
                      }
                    })}
                    className='px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm'
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
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
