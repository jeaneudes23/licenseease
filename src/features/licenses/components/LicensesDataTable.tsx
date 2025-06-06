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

  useEffect(() => {
    const saved = window.localStorage.getItem('services')
    console.log('Loaded "services" from localStorage:', saved)
    if (!saved) {
      setRows([])
      return
    }

    try {
      const categories: Category[] = JSON.parse(saved)
      const flattened: LicenseRow[] = categories.flatMap((cat) =>
        cat.licenses.map((lic) => ({
          ...lic,
          category: cat.name,
        }))
      )
      setRows(flattened)
    } catch (e) {
      console.error('Failed to parse "services" from localStorage', e)
      setRows([])
    }
  }, [])

  return (
    <Table className="w-full min-w-[769px]">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>License Fee</TableHead>
          <TableHead>Validity</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((license, index) => (
          <TableRow key={index}>
            <TableCell>{license.name}</TableCell>
            <TableCell>{license.category}</TableCell>
            <TableCell>{license.first_time_license_fee} USD</TableCell>
            <TableCell>{license.validity} Years</TableCell>
            <TableCell>
              {/* Placeholder for any action buttons */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
