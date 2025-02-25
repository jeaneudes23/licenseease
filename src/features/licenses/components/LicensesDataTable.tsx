import React from 'react'
import { licenseCategories } from '../schema/licenseSchema'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const licenses = licenseCategories.flatMap(category => category.licenses)
export default function LicensesDataTable() {
  return (
    <Table className='w-full min-w-[769px]'>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Caategory</TableHead>
          <TableHead>License Fee</TableHead>
          <TableHead>Validity</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {licenses.map((license, index) =>
          <TableRow key={index}>
            <TableCell>{license.name}</TableCell>
            <TableCell>{license.name}</TableCell>
            <TableCell>{license.first_time_license_fee} </TableCell>
            <TableCell>{license.validity} Years</TableCell>
            <TableCell></TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
