import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CategoriesCreateForm from '@/features/categories/components/CategoriesCreateForm'
import React from 'react'

export default function page() {
  return (
    <main className='grid gap-6 px-4'>
      <div>
        <h2 className='text-2xl capitalize font-bold'>New Category</h2>
      </div>
      <Card>
        <CardHeader>
        </CardHeader>
        <CardContent className='text-sm'>
          <CategoriesCreateForm />
        </CardContent>
      </Card>
    </main>
  )
}
