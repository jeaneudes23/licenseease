import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { applications } from '@/features/applications/schema/applicationSchema'
import React from 'react'

export default function NewApplications() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application,index) => 
                  <TableRow key={index}>
                  <TableCell>{application.user}</TableCell>
                  <TableCell>{application.license}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-medium text-white rounded-md ${application.status === 'approved' ? 'bg-green-500 dark:bg-green-600' : application.status === 'rejected' ? 'bg-red-500 dark:bg-red-600' : 'bg-gray-500 dark:bg-gray-600'}`}>{application.status}</span>
                  </TableCell>
                  <TableCell>{application.date}</TableCell>
                </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
