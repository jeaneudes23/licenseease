"use client"

import React, { useState } from 'react'
import { Building, User, Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface Representative {
  id: string
  fullName: string
  idPassport: string
  telephone: string
  email: string
  communicationLanguage: string
  role: string
}

interface CompanyInfo {
  companyName: string
  nationality: string
  legalType: string
  idType: string
  identificationNumber: string
  address: string
  poBox: string
  fax: string
  telephone: string
  email: string
  creationDate: string
}

interface CompanyRepresentativesTabProps {
  companyInfo: CompanyInfo
  representatives: Representative[]
  onUpdateCompany: (info: CompanyInfo) => void
  onUpdateRepresentatives: (reps: Representative[]) => void
}

export default function CompanyRepresentativesTab({
  companyInfo,
  representatives,
  onUpdateCompany,
  onUpdateRepresentatives
}: CompanyRepresentativesTabProps) {
  const [isEditingCompany, setIsEditingCompany] = useState(false)
  const [isAddingRep, setIsAddingRep] = useState(false)
  const [editingRepId, setEditingRepId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const [companyFormData, setCompanyFormData] = useState<CompanyInfo>(companyInfo)
  const [newRepFormData, setNewRepFormData] = useState({
    fullName: '',
    idPassport: '',
    telephone: '',
    email: '',
    communicationLanguage: 'English',
    role: 'Representative'
  })

  const handleCompanyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCompanyFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRepInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewRepFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveCompany = () => {
    onUpdateCompany(companyFormData)
    setIsEditingCompany(false)
    setMessage('✅ Company information updated successfully!')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleCancelCompanyEdit = () => {
    setCompanyFormData(companyInfo)
    setIsEditingCompany(false)
  }

  const handleAddRepresentative = () => {
    if (!newRepFormData.fullName || !newRepFormData.email || !newRepFormData.telephone) {
      setMessage('❌ Please fill in all required fields for the representative.')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    const newRep: Representative = {
      id: Date.now().toString(),
      ...newRepFormData
    }

    onUpdateRepresentatives([...representatives, newRep])
    setNewRepFormData({
      fullName: '',
      idPassport: '',
      telephone: '',
      email: '',
      communicationLanguage: 'English',
      role: 'Representative'
    })
    setIsAddingRep(false)
    setMessage('✅ Representative added successfully!')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDeleteRepresentative = (id: string) => {
    onUpdateRepresentatives(representatives.filter(rep => rep.id !== id))
    setMessage('✅ Representative removed successfully!')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className='space-y-8'>
      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Company Information Section */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h3 className='text-xl font-semibold flex items-center gap-2'>
            <Building className='size-5' />
            Company Information
          </h3>
          {!isEditingCompany && (
            <button
              onClick={() => setIsEditingCompany(true)}
              className='bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2'
            >
              <Edit2 className='size-4' />
              Edit Company
            </button>
          )}
        </div>

        <div className='grid md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium mb-2'>Company Name</label>
            {isEditingCompany ? (
              <input
                type="text"
                name="companyName"
                value={companyFormData.companyName}
                onChange={handleCompanyInputChange}
                className='w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600'
                required
              />
            ) : (
              <p className='p-3 bg-gray-50 dark:bg-gray-700 rounded-md'>{companyInfo.companyName || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Nationality</label>
            {isEditingCompany ? (
              <select
                name="nationality"
                value={companyFormData.nationality}
                onChange={handleCompanyInputChange}
                className='w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600'
              >
                <option value="">Select nationality</option>
                <option value="rwandan">Rwandan</option>
                <option value="kenyan">Kenyan</option>
                <option value="ugandan">Ugandan</option>
                <option value="tanzanian">Tanzanian</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <p className='p-3 bg-gray-50 dark:bg-gray-700 rounded-md'>{companyInfo.nationality || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Legal Type</label>
            {isEditingCompany ? (
              <select
                name="legalType"
                value={companyFormData.legalType}
                onChange={handleCompanyInputChange}
                className='w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600'
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
            ) : (
              <p className='p-3 bg-gray-50 dark:bg-gray-700 rounded-md'>{companyInfo.legalType || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Registration Number</label>
            {isEditingCompany ? (
              <input
                type="text"
                name="identificationNumber"
                value={companyFormData.identificationNumber}
                onChange={handleCompanyInputChange}
                className='w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600'
              />
            ) : (
              <p className='p-3 bg-gray-50 dark:bg-gray-700 rounded-md'>{companyInfo.identificationNumber || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Address</label>
            {isEditingCompany ? (
              <input
                type="text"
                name="address"
                value={companyFormData.address}
                onChange={handleCompanyInputChange}
                className='w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600'
              />
            ) : (
              <p className='p-3 bg-gray-50 dark:bg-gray-700 rounded-md'>{companyInfo.address || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Phone</label>
            {isEditingCompany ? (
              <input
                type="tel"
                name="telephone"
                value={companyFormData.telephone}
                onChange={handleCompanyInputChange}
                className='w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600'
              />
            ) : (
              <p className='p-3 bg-gray-50 dark:bg-gray-700 rounded-md'>{companyInfo.telephone || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Email</label>
            {isEditingCompany ? (
              <input
                type="email"
                name="email"
                value={companyFormData.email}
                onChange={handleCompanyInputChange}
                className='w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600'
              />
            ) : (
              <p className='p-3 bg-gray-50 dark:bg-gray-700 rounded-md'>{companyInfo.email || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Creation Date</label>
            {isEditingCompany ? (
              <input
                type="date"
                name="creationDate"
                value={companyFormData.creationDate}
                onChange={handleCompanyInputChange}
                className='w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600'
              />
            ) : (
              <p className='p-3 bg-gray-50 dark:bg-gray-700 rounded-md'>{companyInfo.creationDate || 'Not provided'}</p>
            )}
          </div>
        </div>

        {isEditingCompany && (
          <div className='flex gap-4 mt-6'>
            <button
              onClick={handleSaveCompany}
              className='bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2'
            >
              <Save className='size-4' />
              Save Changes
            </button>
            <button
              onClick={handleCancelCompanyEdit}
              className='bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2'
            >
              <X className='size-4' />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Representatives Section */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h3 className='text-xl font-semibold flex items-center gap-2'>
            <User className='size-5' />
            Company Representatives
          </h3>
          <button
            onClick={() => setIsAddingRep(true)}
            className='bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2'
          >
            <Plus className='size-4' />
            Add Representative
          </button>
        </div>

        {/* Add New Representative Form */}
        {isAddingRep && (
          <div className='mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700'>
            <h4 className='text-lg font-medium mb-4'>Add New Representative</h4>
            <div className='grid md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={newRepFormData.fullName}
                  onChange={handleRepInputChange}
                  className='w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>ID/Passport</label>
                <input
                  type="text"
                  name="idPassport"
                  value={newRepFormData.idPassport}
                  onChange={handleRepInputChange}
                  className='w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>Phone *</label>
                <input
                  type="tel"
                  name="telephone"
                  value={newRepFormData.telephone}
                  onChange={handleRepInputChange}
                  className='w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={newRepFormData.email}
                  onChange={handleRepInputChange}
                  className='w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>Language</label>
                <select
                  name="communicationLanguage"
                  value={newRepFormData.communicationLanguage}
                  onChange={handleRepInputChange}
                  className='w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500'
                >
                  <option value="English">English</option>
                  <option value="Kinyarwanda">Kinyarwanda</option>
                  <option value="French">French</option>
                  <option value="Swahili">Swahili</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>Role</label>
                <input
                  type="text"
                  name="role"
                  value={newRepFormData.role}
                  onChange={handleRepInputChange}
                  className='w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500'
                />
              </div>
            </div>
            <div className='flex gap-4 mt-4'>
              <button
                onClick={handleAddRepresentative}
                className='bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors'
              >
                Add Representative
              </button>
              <button
                onClick={() => setIsAddingRep(false)}
                className='bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Representatives Table */}
        {representatives.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {representatives.map((rep) => (
                <TableRow key={rep.id}>
                  <TableCell>
                    <div>
                      <div className='font-medium'>{rep.fullName}</div>
                      <div className='text-sm text-muted-foreground'>{rep.idPassport}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className='font-medium'>{rep.telephone}</div>
                      <div className='text-sm text-muted-foreground'>{rep.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{rep.communicationLanguage}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{rep.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleDeleteRepresentative(rep.id)}
                        className='text-red-600 hover:text-red-800 p-1'
                        title="Remove representative"
                      >
                        <Trash2 className='size-4' />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className='text-center py-8'>
            <User className='size-12 text-gray-400 mx-auto mb-4' />
            <h4 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>No Representatives Added</h4>
            <p className='text-gray-600 dark:text-gray-400 mb-4'>Add company representatives to manage communications and operations.</p>
          </div>
        )}
      </div>
    </div>
  )
}
