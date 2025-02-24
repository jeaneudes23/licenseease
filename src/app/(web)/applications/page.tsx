import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import UserApplicationsDataTable from '@/features/applications/components/UserApplicationsDataTable'
import React from 'react'

export default function page() {
  return (
    <main className='container py-12'>
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <UserApplicationsDataTable />
        </CardContent>
      </Card>
    </main>
  )
}
