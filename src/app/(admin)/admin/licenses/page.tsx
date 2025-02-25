import LicensesDataTable from '@/features/licenses/components/LicensesDataTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function page() {
  return (
    <main className='grid gap-6 px-4'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl capitalize font-bold'>Licenses</h2>
        <Link href={'/admin/licenses/create'} className={buttonVariants()}>New License</Link>
      </div>
      <div>
        <Card>
          <CardHeader>
          </CardHeader>
          <CardContent className='grid'>
            <LicensesDataTable />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
