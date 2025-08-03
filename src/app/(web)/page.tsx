'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const licenseCategories = [
    {
      id: 'asp',
      title: 'Application Service Provider',
      description: 'Provide software applications and services to customers over the internet.',
      keyRequirements: [
        'Business registration certificate',
        'Technical infrastructure documentation',
        'Data protection compliance certificate',
        'Service level agreement templates'
      ],
      processingTime: '14-21 days',
      fee: '$250'
    },
    {
      id: 'network-infra',
      title: 'Network Infrastructure',
      description: 'Deploy and maintain network infrastructure including cables, towers, and equipment.',
      keyRequirements: [
        'Environmental impact assessment',
        'Technical specifications document',
        'Safety compliance certificates',
        'Site acquisition agreements'
      ],
      processingTime: '21-30 days',
      fee: '$400'
    },
    {
      id: 'network-service',
      title: 'Network Service Provider',
      description: 'Provide internet, telecommunications, and network connectivity services.',
      keyRequirements: [
        'Spectrum allocation request',
        'Network coverage plans',
        'Quality of service guarantees',
        'Interconnection agreements'
      ],
      processingTime: '30-45 days',
      fee: '$500'
    }
  ]

  const handleApply = (categoryId: string) => {
    router.push(`/login?category=${categoryId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
              Welcome to <span className="text-blue-200">LicenseEase</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Simplifying IT service licensing in Rwanda. Get your telecommunications and network service licenses quickly and efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/login')}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started
              </button>
              <button 
                onClick={() => router.push('/login')}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose LicenseEase Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Why Choose LicenseEase?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We streamline the complex process of obtaining IT service licenses in Rwanda, making it faster, easier, and more transparent.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Processing</h3>
            <p className="text-gray-600">Submit applications online and track progress in real-time. Average processing time reduced by 60%.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Guidance</h3>
            <p className="text-gray-600">Clear requirements, document checklists, and step-by-step guidance throughout the process.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Compliant</h3>
            <p className="text-gray-600">Bank-grade security for your documents and data. Fully compliant with Rwanda&apos;s regulatory standards.</p>
          </div>
        </div>

        {/* License Categories Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            IT Service License Categories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our main license categories. Each comes with detailed requirements and streamlined application process.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {licenseCategories.map((category) => (
            <div 
              key={category.id} 
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                  <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                    {category.fee}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {category.description}
                </p>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Requirements:</h4>
                  <ul className="space-y-2">
                    {category.keyRequirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-600">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                  <span>Processing Time:</span>
                  <span className="font-medium">{category.processingTime}</span>
                </div>
                
                <button
                  onClick={() => handleApply(category.id)}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Your License?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of businesses that have successfully obtained their IT service licenses through LicenseEase.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/login')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Your Application
              </button>
              <button 
                onClick={() => router.push('/check-license-validity')}
                className="border-2 border-gray-300 text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 hover:text-gray-900 transition-colors"
              >
                Check License Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
