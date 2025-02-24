import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CategoriesDataTable from '@/features/categories/components/CategoriesDataTable'
import Link from 'next/link'
import React from 'react'

export default function page() {
  return (
    <main className='grid gap-6 px-4'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl capitalize font-bold'>Categories</h2>
        <Link href={'/admin/categories/create'} className={buttonVariants()}>New Category</Link>
      </div>
      <div>
        <Card>
          <CardHeader>
            {/* <CardTitle>Categories</CardTitle> */}
          </CardHeader>
          <CardContent>
            <CategoriesDataTable />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
