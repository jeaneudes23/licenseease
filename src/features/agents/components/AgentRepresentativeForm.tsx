"use client"

import React, { useState } from 'react'
import { Plus, Trash2, User, Phone, Mail, Upload, FileText } from 'lucide-react'

interface Representative {
  id: string
  names: string
  idPassport: string
  telephone: string
  email: string
  identificationDocument?: File | null
  communicationLanguage: string
}

interface AgentRepresentativeFormProps {
  representatives: Representative[]
  onUpdateRepresentatives: (reps: Representative[]) => void
}

export default function AgentRepresentativeForm({ representatives, onUpdateRepresentatives }: AgentRepresentativeFormProps) {
  const [newRep, setNewRep] = useState<Omit<Representative, 'id'>>({
    names: '',
    idPassport: '',
    telephone: '',
    email: '',
    identificationDocument: null,
    communicationLanguage: ''
  })

  const [uploadError, setUploadError] = useState('')

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const handleAddRepresentative = () => {
    if (!newRep.names || !newRep.idPassport || !newRep.telephone || !newRep.email || !newRep.communicationLanguage) {
      alert('Please fill in all required fields')
      return
    }

    const representative: Representative = {
      ...newRep,
      id: generateId()
    }

    onUpdateRepresentatives([...representatives, representative])
    setNewRep({
      names: '',
      idPassport: '',
      telephone: '',
      email: '',
      identificationDocument: null,
      communicationLanguage: ''
    })
    setUploadError('')
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setUploadError('')

    if (!file) return

    // Check file size (50MB max)
    const maxSize = 50 * 1024 * 1024 // 50MB in bytes
    if (file.size > maxSize) {
      setUploadError('File size must be less than 50MB')
      return
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/vnd.rar'
    ]

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['jpeg', 'jpg', 'png', 'pdf', 'zip', 'rar']

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
      setUploadError('Only JPEG, JPG, PNG, PDF, ZIP, and RAR files are allowed')
      return
    }

    setNewRep(prev => ({
      ...prev,
      identificationDocument: file
    }))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
                      {rep.names}
                    </h5>
                    <p className='text-sm text-muted-foreground'>
                      Language: {rep.communicationLanguage}
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
                    <span>{rep.telephone}</span>
                  </div>
                  <div className='flex items-center gap-2 col-span-2'>
                    <FileText className='size-3' />
                    <span>ID/Passport: {rep.idPassport}</span>
                  </div>
                  {rep.identificationDocument && (
                    <div className='flex items-center gap-2 col-span-2'>
                      <Upload className='size-3' />
                      <span>Document: {rep.identificationDocument.name}</span>
                    </div>
                  )}
                </div>
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
                Names *
              </label>
              <input
                type='text'
                value={newRep.names}
                onChange={(e) => handleInputChange('names', e.target.value)}
                className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
                placeholder='Enter full names'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium mb-1'>
                ID/Passport *
              </label>
              <input
                type='text'
                value={newRep.idPassport}
                onChange={(e) => handleInputChange('idPassport', e.target.value)}
                className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
                placeholder='Enter ID or passport number'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium mb-1'>
                Telephone *
              </label>
              <input
                type='tel'
                value={newRep.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
                className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
                placeholder='Enter telephone number'
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
                Communication Language *
              </label>
              <select
                value={newRep.communicationLanguage}
                onChange={(e) => handleInputChange('communicationLanguage', e.target.value)}
                className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
                required
              >
                <option value="">Select language</option>
                <option value="english">English</option>
                <option value="kinyarwanda">Kinyarwanda</option>
                <option value="french">French</option>
                <option value="swahili">Swahili</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium mb-1'>
                Identification Document
              </label>
              <div className='space-y-2'>
                <input
                  type='file'
                  onChange={handleFileUpload}
                  accept='.jpeg,.jpg,.png,.pdf,.zip,.rar'
                  className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                />
                <p className='text-xs text-gray-500'>
                  Accepts: JPEG, JPG, PNG, PDF, ZIP, RAR (Max: 50MB)
                </p>
                {uploadError && (
                  <p className='text-xs text-red-500'>{uploadError}</p>
                )}
                {newRep.identificationDocument && (
                  <div className='flex items-center gap-2 text-xs text-green-600'>
                    <FileText className='size-3' />
                    <span>{newRep.identificationDocument.name}</span>
                    <span>({formatFileSize(newRep.identificationDocument.size)})</span>
                  </div>
                )}
              </div>
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
