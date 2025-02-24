import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { clients } from '../schema/clientSchema'


export default function ClientsDataTable() {
  return (
    <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Phone</TableHead>
        <TableHead>Address</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {clients.map((client, index) =>
        <TableRow key={index}>
          <TableCell>{client.name}</TableCell>
          <TableCell>{client.email}</TableCell>
          <TableCell>{client.phone}</TableCell>
          <TableCell>{client.address}</TableCell>
          <TableCell></TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
  )
}
