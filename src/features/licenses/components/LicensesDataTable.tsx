'use client'

import React, { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type License = {
  id: string
  name: string
  description?: string
  application_requirements: string[]
  renewal_requirements: string[]
  first_time_application_fee: number
  renewal_application_fee: number
  first_time_license_fee: number
  renewal_license_fee: number
  validity: number
  processing_time: number
}

type Category = {
  name: string
  licenses: License[]
}

type LicenseRow = License & { category: string }

export default function LicensesDataTable() {
  const [rows, setRows] = useState<LicenseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('http://127.0.0.1:5002/get_services', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const categories: Category[] = await response.json()
        const flattened: LicenseRow[] = categories.flatMap((cat) =>
          cat.licenses.map((lic) => ({
            ...lic,
            category: cat.name,
          }))
        )
        setRows(flattened)
      } catch (err) {
        console.error('Failed to fetch licenses:', err)
        setError(err instanceof Error ? err.message : 'Failed to load licenses')
        setRows([])
      } finally {
        setLoading(false)
      }
    }

    fetchLicenses()
  }, [])

  return (
    <Table className="w-full min-w-[1000px]">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>License Fee</TableHead>
          <TableHead>Validity</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2">Loading licenses...</span>
              </div>
            </TableCell>
          </TableRow>
        ) : error ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              <div className="text-red-600 dark:text-red-400">
                <p className="font-medium">Error loading licenses</p>
                <p className="text-sm">{error}</p>
              </div>
            </TableCell>
          </TableRow>
        ) : rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400">
                <p>No licenses found</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          rows.map((license, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="font-medium text-gray-900 dark:text-white">
                  {license.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  ID: {license.id}
                </div>
              </TableCell>
              <TableCell className="max-w-md">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                  {license.description || 'No description available'}
                </p>
              </TableCell>
              <TableCell>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {license.category}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">${license.first_time_license_fee}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  App fee: ${license.first_time_application_fee}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{license.validity} Years</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {license.processing_time} days processing
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                    Edit
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 text-sm">
                    View
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
