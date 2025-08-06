"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Building, User, Phone, Mail, MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Representative {
  id: string
  fullName: string
  idPassport: string
  telephone: string
  email: string
  communicationLanguage: string
  role: string
}

interface Company {
  id: string
  companyName: string
  nationality: string
  legalType: string
  identificationNumber: string
  address: string
  telephone: string
  email: string
  creationDate: string
  representatives: Representative[]
  registeredAt: string
  status: string
  submittedBy: string
}

export default function CompaniesDataTable() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5002/companies')
      
      if (!response.ok) {
        throw new Error('Failed to fetch companies')
      }
      
      const data = await response.json()
      setCompanies(data)
    } catch (err) {
      console.error('Error fetching companies:', err)
      setError('Failed to load companies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Loading companies...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500">{error}</div>
        <button 
          onClick={fetchCompanies}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <Building className="size-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Companies Registered</h3>
        <p className="text-gray-600">Companies registered by clients will appear here.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company Information</TableHead>
          <TableHead>Contact Details</TableHead>
          <TableHead>Representatives</TableHead>
          <TableHead>Registration Info</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((company) =>
          <TableRow key={company.id}>
            <TableCell>
              <div className='flex items-start gap-3'>
                <div className='bg-blue-100 dark:bg-blue-900 p-2 rounded-lg'>
                  <Building className='size-4 text-blue-600 dark:text-blue-400' />
                </div>
                <div>
                  <div className='font-medium text-gray-900 dark:text-white'>
                    {company.companyName}
                  </div>
                  <div className='text-sm text-gray-600 dark:text-gray-400'>
                    {company.legalType?.replace(/_/g, ' ').toUpperCase()} • {company.nationality}
                  </div>
                  <div className='text-xs text-gray-500 mt-1'>
                    Reg: {company.identificationNumber}
                  </div>
                </div>
              </div>
            </TableCell>
            
            <TableCell>
              <div className='space-y-1'>
                <div className='flex items-center gap-2 text-sm'>
                  <Mail className='size-3 text-gray-400' />
                  {company.email}
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <Phone className='size-3 text-gray-400' />
                  {company.telephone}
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <MapPin className='size-3 text-gray-400' />
                  {company.address}
                </div>
              </div>
            </TableCell>
            
            <TableCell>
              <div className='space-y-2'>
                {company.representatives && company.representatives.length > 0 ? (
                  <>
                    <div className='text-sm font-medium'>
                      {company.representatives.length} Representative{company.representatives.length > 1 ? 's' : ''}
                    </div>
                    <div className='space-y-1'>
                      {company.representatives.slice(0, 2).map((rep) => (
                        <div key={rep.id} className='flex items-center gap-2'>
                          <User className='size-3 text-gray-400' />
                          <div>
                            <div className='text-sm font-medium'>{rep.fullName}</div>
                            <div className='text-xs text-gray-600'>
                              {rep.role} • {rep.email}
                            </div>
                          </div>
                        </div>
                      ))}
                      {company.representatives.length > 2 && (
                        <div className='text-xs text-gray-500'>
                          +{company.representatives.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <span className='text-sm text-gray-500'>No representatives</span>
                )}
              </div>
            </TableCell>
            
            <TableCell>
              <div className='space-y-1'>
                <div className='text-sm font-medium'>
                  {new Date(company.registeredAt).toLocaleDateString()}
                </div>
                <div className='text-xs text-gray-600'>
                  Submitted by: {company.submittedBy}
                </div>
                {company.creationDate && (
                  <div className='text-xs text-gray-500'>
                    Founded: {new Date(company.creationDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </TableCell>
            
            <TableCell>
              <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                {company.status}
              </Badge>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
