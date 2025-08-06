import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CompaniesDataTable from '@/features/companies/components/CompaniesDataTable'

export default function page() {
  return (
    <main className='grid gap-6 px-4'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl capitalize font-bold'>Companies</h2>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            View and manage companies registered by clients
          </p>
        </div>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <div className='bg-blue-100 dark:bg-blue-900 p-2 rounded-lg'>
                <svg className='size-5 text-blue-600 dark:text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                </svg>
              </div>
              Registered Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CompaniesDataTable />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
