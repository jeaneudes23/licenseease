"use client"

import React, { useState } from 'react'
import { Plus, Trash2, User, Phone, Mail, IdCard, Briefcase } from 'lucide-react'

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

interface AgentRepresentativeFormProps {
  representatives: Representative[]
  onUpdateRepresentatives: (reps: Representative[]) => void
}

export default function AgentRepresentativeForm({ representatives, onUpdateRepresentatives }: AgentRepresentativeFormProps) {
  const [newRep, setNewRep] = useState<Omit<Representative, 'id'>>({
    fullName: '',
    email: '',
    phone: '',
    nationalId: '',
    passport: '',
    role: '',
    address: ''
  })

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const handleAddRepresentative = () => {
    if (!newRep.fullName || !newRep.email || !newRep.phone || !newRep.nationalId || !newRep.role) {
      alert('Please fill in all required fields')
      return
    }

    const representative: Representative = {
      ...newRep,
      id: generateId()
    }

    onUpdateRepresentatives([...representatives, representative])
    setNewRep({
      fullName: '',
      email: '',
      phone: '',
      nationalId: '',
      passport: '',
      role: '',
      address: ''
    })
  }

  const handleRemoveRepresentative = (id: string) => {
    onUpdateRepresentatives(representatives.filter(rep => rep.id !== id))
  }

  const handleInputChange = (field: keyof Omit<Representative, 'id'>, value: string) => {
    setNewRep(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className='space-y-6'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
        <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
          <User className='size-5' />
          Local Representatives in Rwanda
        </h3>
        <p className='text-sm text-muted-foreground mb-4'>
          Add local representatives who can act on behalf of the company in Rwanda.
        </p>

        {/* Existing Representatives */}
        {representatives.length > 0 && (
          <div className='space-y-4 mb-6'>
            <h4 className='font-medium'>Current Representatives</h4>
            {representatives.map((rep) => (
              <div key={rep.id} className='border rounded-lg p-4 bg-gray-50 dark:bg-gray-700'>
                <div className='flex justify-between items-start mb-3'>
                  <div className='flex-1'>
                    <h5 className='font-semibold flex items-center gap-2'>
                      <User className='size-4' />
                      {rep.fullName}
                    </h5>
                    <p className='text-sm text-muted-foreground flex items-center gap-2'>
                      <Briefcase className='size-3' />
                      {rep.role}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveRepresentative(rep.id)}
                    className='text-red-500 hover:text-red-700 transition-colors'
                  >
                    <Trash2 className='size-4' />
                  </button>
                </div>
                <div className='grid grid-cols-2 gap-3 text-sm'>
                  <div className='flex items-center gap-2'>
                    <Mail className='size-3' />
                    <span>{rep.email}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Phone className='size-3' />
                    <span>{rep.phone}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <IdCard className='size-3' />
                    <span>ID: {rep.nationalId}</span>
                  </div>
                  {rep.passport && (
                    <div className='flex items-center gap-2'>
                      <IdCard className='size-3' />
                      <span>Passport: {rep.passport}</span>
                    </div>
                  )}
                </div>
                {rep.address && (
                  <p className='text-sm text-muted-foreground mt-2'>
                    Address: {rep.address}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add New Representative Form */}
        <div className='border-t pt-4'>
          <h4 className='font-medium mb-4'>Add New Representative</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Full Name *
              </label>
              <input
                type='text'
                value={newRep.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
                placeholder='Enter full name'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Email Address *
              </label>
              <input
                type='email'
                value={newRep.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
                placeholder='Enter email address'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Phone Number *
              </label>
              <input
                type='tel'
                value={newRep.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
                placeholder='Enter phone number'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>
                National ID *
              </label>
              <input
                type='text'
                value={newRep.nationalId}
                onChange={(e) => handleInputChange('nationalId', e.target.value)}
                className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
                placeholder='Enter national ID number'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Passport Number
              </label>
              <input
                type='text'
                value={newRep.passport}
                onChange={(e) => handleInputChange('passport', e.target.value)}
                className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
                placeholder='Enter passport number (optional)'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Role/Position *
              </label>
              <input
                type='text'
                value={newRep.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
                placeholder='e.g., Local Manager, Sales Representative'
                required
              />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium mb-1'>
                Address
              </label>
              <input
                type='text'
                value={newRep.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
                placeholder='Enter local address in Rwanda'
              />
            </div>
          </div>
          <button
            onClick={handleAddRepresentative}
            className='mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2'
          >
            <Plus className='size-4' />
            Add Representative
          </button>
        </div>
      </div>
    </div>
  )
}
