"use client"

import SubmitButton from '@/components/SubmitButton'
import React, { useState } from 'react'
import AgentRepresentativeForm from './AgentRepresentativeForm'

interface Representative {
  id: string
  fullName: string
  email: string
  phone: string
  nationalId: string
  passport?: string
  role: string
  address: string
}

export default function AgentCreateForm() {
  const [representatives, setRepresentatives] = useState<Representative[]>([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    companyName: '',
    companyType: '',
    registrationNumber: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would handle the form submission with both agent data and representatives
    console.log('Agent Data:', formData)
    console.log('Representatives:', representatives)
  }

  return (
    <form onSubmit={handleSubmit} className='grid gap-6'>
      {/* Agent Basic Information */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
        <h3 className='text-lg font-semibold mb-4'>Agent Information</h3>
        <div className='grid md:grid-cols-2 gap-4'>
          <div className='grid gap-1'>
            <label htmlFor="name" className="text-sm font-medium">Contact Person Name</label>
            <input 
              type="text" 
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" 
              required
            />
          </div>
          <div className='grid gap-1'>
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input 
              type="email" 
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" 
              required
            />
          </div>
          <div className='grid gap-1'>
            <label htmlFor="phone" className="text-sm font-medium">Phone</label>
            <input 
              type="text" 
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" 
              required
            />
          </div>
          <div className='grid gap-1'>
            <label htmlFor="address" className="text-sm font-medium">Address</label>
            <input 
              type="text" 
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" 
              required
            />
          </div>
          <div className='grid gap-1'>
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input 
              type="password" 
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" 
              required
            />
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
        <h3 className='text-lg font-semibold mb-4'>Company Information</h3>
        <div className='grid md:grid-cols-2 gap-4'>
          <div className='grid gap-1'>
            <label htmlFor="companyName" className="text-sm font-medium">Company Name</label>
            <input 
              type="text" 
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" 
              required
            />
          </div>
          <div className='grid gap-1'>
            <label htmlFor="companyType" className="text-sm font-medium">Company Type</label>
            <select 
              id="companyType"
              name="companyType"
              value={formData.companyType}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" 
              required
            >
              <option value="">Select company type</option>
              <option value="technology">Technology</option>
              <option value="software">Software</option>
              <option value="hardware">Hardware</option>
              <option value="consulting">Consulting</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className='grid gap-1'>
            <label htmlFor="registrationNumber" className="text-sm font-medium">Registration Number</label>
            <input 
              type="text" 
              id="registrationNumber"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" 
              placeholder="Company registration number"
            />
          </div>
        </div>
      </div>

      {/* Local Representatives */}
      <AgentRepresentativeForm
        representatives={representatives}
        onUpdateRepresentatives={setRepresentatives}
      />

      <div>
        <SubmitButton>Create Agent</SubmitButton>
      </div>
    </form>
  )
}
