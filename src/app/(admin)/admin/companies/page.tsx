import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CompaniesDataTable from '@/features/companies/components/CompaniesDataTable'
import Link from 'next/link'

export default function page() {
  return (
    <main className='grid gap-6 px-4'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl capitalize font-bold'>Companies</h2>
        {/* <Link href={'/admin/categories/create'} className={buttonVariants()}>New Company</Link> */}
      </div>
      <div>
        <Card>
          <CardHeader>
          </CardHeader>
          <CardContent>
            <CompaniesDataTable />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
