'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function SubmitApplicationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [form, setForm] = useState({
    description: '',
    documents: {
      businessPlan: null as File | null,
      rdbCertificate: null as File | null,
      companyContracts: null as File | null,
      otherDocuments: [] as File[]
    }
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<any>(null)

  const licenseCategories = [
    {
      id: 'application-service-provider',
      title: 'Application Service Provider',
      description: 'Provide software applications and services to customers over the internet, including SaaS, web applications, and cloud-based solutions.',
      requirements: [
        'Valid business registration certificate',
        'Technical infrastructure documentation',
        'Data protection and privacy compliance certificate',
        'Service level agreement (SLA) templates',
        'Business continuity and disaster recovery plan',
        'Professional liability insurance certificate',
        'Technical team qualifications and certifications'
      ],
      processingTime: '5-10 business days',
      fees: {
        application: 50,
        license: 250,
        renewal: 200
      },
      validity: '2 years'
    },
    {
      id: 'network-infrastructure',
      title: 'Network Infrastructure',
      description: 'Deploy, maintain, and operate network infrastructure including fiber optic cables, wireless towers, data centers, and telecommunications equipment.',
      requirements: [
        'Environmental impact assessment report',
        'Technical specifications and equipment documentation',
        'Safety and health compliance certificates',
        'Site acquisition agreements and permits',
        'Engineering plans and network topology diagrams',
        'Equipment supplier certifications',
        'Installation and maintenance team qualifications'
      ],
      processingTime: '10-25 business days',
      fees: {
        application: 75,
        license: 400,
        renewal: 300
      },
      validity: '3 years'
    },
    {
      id: 'network-service-provider',
      title: 'Network Service Provider',
      description: 'Provide internet connectivity, telecommunications services, and network access to end users including ISP services, mobile networks, and enterprise connectivity.',
      requirements: [
        'Spectrum allocation request and documentation',
        'Network coverage plans and service area maps',
        'Quality of service (QoS) guarantees and metrics',
        'Interconnection agreements with other providers',
        'Customer service and support procedures',
        'Billing and payment processing systems documentation',
        'Network security and monitoring capabilities'
      ],
      processingTime: '7-21 business days',
      fees: {
        application: 100,
        license: 500,
        renewal: 400
      },
      validity: '5 years'
    }
  ]

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
      }
    } else {
      router.push('/login')
    }

    // Get selected category from URL params
    const categoryId = searchParams.get('category')
    if (categoryId) {
      const category = licenseCategories.find(cat => cat.id === categoryId)
      if (category) {
        setSelectedCategory(category)
      }
    }
  }, [searchParams, router])

  const handleFileChange = (type: string, files: FileList | null) => {
    if (!files) return

    if (type === 'otherDocuments') {
      setForm(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          otherDocuments: Array.from(files)
        }
      }))
    } else {
      setForm(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [type]: files[0]
        }
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCategory || !user) {
      setMessage('Missing required information. Please try again.')
      return
    }

    // Check if at least one document is uploaded
    const hasAnyDocument = form.documents.businessPlan || 
                          form.documents.rdbCertificate || 
                          form.documents.companyContracts || 
                          form.documents.otherDocuments.length > 0

    if (!form.description || !hasAnyDocument) {
      setMessage('Description and at least one document are required.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('license_type', selectedCategory.title)
      formData.append('description', form.description)
      formData.append('applicant_name', `${user.firstName} ${user.lastName}`)
      formData.append('applicant_email', user.email)
      formData.append('applicant_phone', user.phone || '')
      formData.append('company', user.company || '')

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

      console.log('Submitting application to:', 'http://127.0.0.1:5002/applications')
      
      const response = await fetch('http://127.0.0.1:5002/applications', {
        method: 'POST',
        body: formData,
      })

      console.log('Response status:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = 'Failed to submit application'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          console.error('Failed to parse error response:', e)
          errorMessage = `Server error (${response.status}): ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Success response:', data)
      
      // Validate the response has required fields
      if (!data.application_id) {
        throw new Error('Invalid response: missing application ID')
      }
      
      setMessage('✅ Application submitted successfully!')
      
      // Store payment info for the payment page
      const paymentInfo = {
        id: data.application_id,
        licenseType: selectedCategory.title,
        fees: selectedCategory.fees
      }
      localStorage.setItem('pendingPayment', JSON.stringify(paymentInfo))
      
      // Reset form
      setForm({
        description: '',
        documents: {
          businessPlan: null,
          rdbCertificate: null,
          companyContracts: null,
          otherDocuments: []
        }
      })

      // Redirect to payment page after showing success message
      setTimeout(() => {
        router.push(`/client-dashboard/payment?applicationId=${paymentInfo.id}&licenseType=${encodeURIComponent(selectedCategory.title)}&fees=${encodeURIComponent(JSON.stringify(selectedCategory.fees))}`)
      }, 2000)

    } catch (error) {
      console.error('Error submitting application:', error)
      setMessage(error instanceof Error ? error.message : 'Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
          <p className="text-gray-600">Please wait while we load your application form.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to License Selection
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Application</h1>
          <p className="text-gray-600">Complete your application for {selectedCategory.title}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Application Summary */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">{selectedCategory.title}</h2>
            <p className="text-blue-800 mb-4">{selectedCategory.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Processing Time:</span>
                <br />
                <span className="text-blue-800">{selectedCategory.processingTime}</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Application Fee:</span>
                <br />
                <span className="text-blue-800">${selectedCategory.fees.application}</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">License Fee:</span>
                <br />
                <span className="text-blue-800">${selectedCategory.fees.license}</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Validity:</span>
                <br />
                <span className="text-blue-800">{selectedCategory.validity}</span>
              </div>
            </div>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.includes('✅') 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Application Description *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={6}
                placeholder="Describe your business, intended use of the license, technical capabilities, and how you plan to implement the service..."
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Provide a detailed description of your business and how you intend to use this license.
              </p>
            </div>

            {/* File Upload Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Plan
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('businessPlan', e.target.files)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {form.documents.businessPlan && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ {form.documents.businessPlan.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RDB Certificate
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('rdbCertificate', e.target.files)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {form.documents.rdbCertificate && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ {form.documents.rdbCertificate.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Contracts
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('companyContracts', e.target.files)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {form.documents.companyContracts && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ {form.documents.companyContracts.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Documents
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    onChange={(e) => handleFileChange('otherDocuments', e.target.files)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {form.documents.otherDocuments.length > 0 && (
                    <div className="text-sm text-green-600 mt-1">
                      ✓ {form.documents.otherDocuments.length} file(s) selected
                      <ul className="list-disc list-inside mt-1 text-gray-600">
                        {form.documents.otherDocuments.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                <strong>Note:</strong> At least one document is required. Accepted formats: PDF, JPG, PNG (Max 5MB per file)
              </p>
            </div>

            {/* Required Documents List */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Required Documents for {selectedCategory.title}:</h4>
              <ul className="space-y-2">
                {selectedCategory.requirements.map((req: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting Application...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function SubmitApplication() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubmitApplicationContent />
    </Suspense>
  )
}
