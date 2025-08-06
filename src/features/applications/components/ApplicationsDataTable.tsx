"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { FileText, User, Building } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Application {
  id: string | number
  applicant_name: string
  applicant_email: string
  company?: string
  license_type: string
  description: string
  status: string
  submitted_at: string
  files?: any[]
}

export default function ApplicationsDataTable() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchApplications = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5002/applications')
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }
      
      const data = await response.json()
      setApplications(data)
    } catch (err) {
      console.error('Error fetching applications:', err)
      setError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2">Loading applications...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500">{error}</div>
        <button 
          onClick={fetchApplications}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="size-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Submitted</h3>
        <p className="text-gray-600">Applications submitted by clients will appear here.</p>
      </div>
    )
  }

  return (
    <Table className='w-full min-w-[769px]'>
      <TableHeader>
        <TableRow>
          <TableHead>Applicant</TableHead>
          <TableHead>License Type</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date Submitted</TableHead>
          <TableHead>Files</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((application) =>
          <TableRow key={application.id}>
            <TableCell>
              <div className='flex items-center gap-3'>
                <div className='bg-blue-100 dark:bg-blue-900 p-2 rounded-lg'>
                  <User className='size-4 text-blue-600 dark:text-blue-400' />
                </div>
                <div>
                  <div className='font-medium'>{application.applicant_name}</div>
                  <div className='text-sm text-gray-600 dark:text-gray-400'>{application.applicant_email}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className='font-medium'>{application.license_type}</div>
              <div className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2'>
                {application.description?.substring(0, 100)}
                {application.description?.length > 100 && '...'}
              </div>
            </TableCell>
            <TableCell>
              <div className='flex items-center gap-2'>
                <Building className='size-4 text-gray-400' />
                <span>{application.company || 'Not provided'}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={
                application.status === 'approved' ? 'default' :
                application.status === 'rejected' ? 'destructive' :
                application.status === 'pending' ? 'secondary' :
                'outline'
              }>
                {application.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className='text-sm'>
                {new Date(application.submitted_at).toLocaleDateString()}
              </div>
              <div className='text-xs text-gray-500'>
                {new Date(application.submitted_at).toLocaleTimeString()}
              </div>
            </TableCell>
            <TableCell>
              <div className='text-sm'>
                {application.files?.length || 0} document(s)
              </div>
            </TableCell>
            <TableCell>
              <div className='flex gap-2'>
                <button className='text-blue-600 hover:text-blue-800 text-sm font-medium'>
                  View
                </button>
                <button className='text-green-600 hover:text-green-800 text-sm font-medium'>
                  Approve
                </button>
                <button className='text-red-600 hover:text-red-800 text-sm font-medium'>
                  Reject
                </button>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
