"use client"

import SubmitButton from '@/components/SubmitButton'
import React, { useState } from 'react'
import AgentRepresentativeForm from './AgentRepresentativeForm'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/firebase'

interface Representative {
  id: string
  names: string
  idPassport: string
  telephone: string
  email: string
  identificationDocument?: File | null
  communicationLanguage: string
}

export default function AgentCreateForm() {
  const [representatives, setRepresentatives] = useState<Representative[]>([])
  const [formData, setFormData] = useState({
    companyName: '',
    nationality: '',
    legalType: '',
    idType: '',
    identificationNumber: '',
    address: '',
    poBox: '',
    fax: '',
    telephone: '',
    email: '',
    creationDate: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      // Save to Firestore with role "operator"
      const agentData = {
        ...formData,
        representatives,
        role: 'operator',
        createdAt: new Date(),
        status: 'active'
      }

      const docRef = await addDoc(collection(db, 'agents'), agentData)
      
      setMessage('✅ Agent company registered successfully!')
      console.log('Agent registered with ID:', docRef.id)
      
      // Reset form
      setFormData({
        companyName: '',
        nationality: '',
        legalType: '',
        idType: '',
        identificationNumber: '',
        address: '',
        poBox: '',
        fax: '',
        telephone: '',
        email: '',
        creationDate: ''
      })
      setRepresentatives([])
      
    } catch (error) {
      console.error('Error registering agent:', error)
      setMessage('❌ Failed to register agent company. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='grid gap-6'>
      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

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
            <label htmlFor="nationality" className="text-sm font-medium">Nationality</label>
            <select 
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" 
              required
            >
              <option value="">Select nationality</option>
              <option value="rwandan">Rwandan</option>
              <option value="kenyan">Kenyan</option>
              <option value="ugandan">Ugandan</option>
              <option value="tanzanian">Tanzanian</option>
              <option value="congolese">Congolese</option>
              <option value="burundian">Burundian</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className='grid gap-1'>
            <label htmlFor="legalType" className="text-sm font-medium">Legal Type</label>
            <select 
              id="legalType"
              name="legalType"
              value={formData.legalType}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" 
              required
            >
              <option value="">Select legal type</option>
              <option value="limited_company">Limited Company</option>
              <option value="corporation">Corporation</option>
              <option value="partnership">Partnership</option>
              <option value="sole_proprietorship">Sole Proprietorship</option>
              <option value="cooperative">Cooperative</option>
              <option value="ngo">Non-Governmental Organization</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className='grid gap-1'>
            <label htmlFor="idType" className="text-sm font-medium">ID Type</label>
            <select 
              id="idType"
              name="idType"
              value={formData.idType}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" 
              required
            >
              <option value="">Select ID type</option>
              <option value="national_id">National ID</option>
              <option value="passport">Passport</option>
            </select>
          </div>

          <div className='grid gap-1'>
            <label htmlFor="identificationNumber" className="text-sm font-medium">Identification Number *</label>
            <input 
              type="text" 
              id="identificationNumber"
              name="identificationNumber"
              value={formData.identificationNumber}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" 
              placeholder="Enter ID or passport number"
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
              placeholder="Company address"
            />
          </div>

          <div className='grid gap-1'>
            <label htmlFor="poBox" className="text-sm font-medium">P.O. Box</label>
            <input 
              type="text" 
              id="poBox"
              name="poBox"
              value={formData.poBox}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" 
              placeholder="P.O. Box number"
            />
          </div>

          <div className='grid gap-1'>
            <label htmlFor="fax" className="text-sm font-medium">Fax</label>
            <input 
              type="text" 
              id="fax"
              name="fax"
              value={formData.fax}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" 
              placeholder="Fax number"
            />
          </div>

          <div className='grid gap-1'>
            <label htmlFor="telephone" className="text-sm font-medium">Telephone</label>
            <input 
              type="tel" 
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" 
              placeholder="Phone number"
            />
          </div>

          <div className='grid gap-1'>
            <label htmlFor="email" className="text-sm font-medium">Email Address</label>
            <input 
              type="email" 
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" 
              placeholder="company@example.com"
            />
          </div>

          <div className='grid gap-1'>
            <label htmlFor="creationDate" className="text-sm font-medium">Creation Date</label>
            <input 
              type="date" 
              id="creationDate"
              name="creationDate"
              value={formData.creationDate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" 
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
        <SubmitButton disabled={isSubmitting}>
          {isSubmitting ? 'Registering...' : 'Register Company'}
        </SubmitButton>
      </div>
    </form>
  )
}
