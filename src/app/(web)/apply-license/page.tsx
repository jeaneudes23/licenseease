'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ApplyLicense() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

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
      guidelines: [
        'Ensure your technical infrastructure meets minimum security standards',
        'Provide detailed documentation of your service offerings',
        'Include proof of data backup and recovery procedures',
        'Submit evidence of staff technical training and certifications',
        'Demonstrate compliance with international data protection standards'
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
      guidelines: [
        'Conduct thorough environmental impact assessments for all installations',
        'Ensure all equipment meets international telecommunications standards',
        'Provide detailed network coverage maps and expansion plans',
        'Include emergency response and maintenance procedures',
        'Submit proof of technical staff qualifications and training'
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
      guidelines: [
        'Provide comprehensive network coverage plans with timeline',
        'Demonstrate ability to meet quality of service requirements',
        'Include detailed customer support and complaint resolution procedures',
        'Submit evidence of network monitoring and security measures',
        'Provide financial projections and sustainability plans'
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

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  const handleStartApplication = () => {
    if (selectedCategory) {
      router.push(`/submit-application?category=${selectedCategory}`)
    }
  }

  const selectedCategoryData = licenseCategories.find(cat => cat.id === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply for a License</h1>
          <p className="text-gray-600">Select the license category that best fits your business needs.</p>
        </div>

        {!selectedCategory ? (
          <div className="grid md:grid-cols-3 gap-6">
            {licenseCategories.map((category) => (
              <div 
                key={category.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => handleCategorySelect(category.id)}
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{category.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{category.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Processing Time:</span>
                      <span className="font-medium">{category.processingTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">License Fee:</span>
                      <span className="font-medium">${category.fees.license}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Validity:</span>
                      <span className="font-medium">{category.validity}</span>
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Select This Category
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : selectedCategoryData && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedCategoryData.title}</h2>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-8 leading-relaxed">{selectedCategoryData.description}</p>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h3>
                  <ul className="space-y-3">
                    {selectedCategoryData.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Guidelines</h3>
                  <ul className="space-y-3">
                    {selectedCategoryData.guidelines.map((guideline, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{guideline}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Structure</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">${selectedCategoryData.fees.application}</div>
                    <div className="text-sm text-gray-500">Application Fee</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">${selectedCategoryData.fees.license}</div>
                    <div className="text-sm text-gray-500">License Fee</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">${selectedCategoryData.fees.renewal}</div>
                    <div className="text-sm text-gray-500">Renewal Fee</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{selectedCategoryData.validity}</div>
                    <div className="text-sm text-gray-500">Validity Period</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <h4 className="font-semibold text-blue-900">Important Information</h4>
                </div>
                <ul className="text-blue-800 space-y-1">
                  <li>• Processing time: {selectedCategoryData.processingTime}</li>
                  <li>• All documents must be submitted in PDF format</li>
                  <li>• Applications are reviewed in the order they are received</li>
                  <li>• You will receive email notifications about your application status</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleStartApplication}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Start Application
                </button>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Choose Different Category
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
