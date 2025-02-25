import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CompaniesDataTable from '@/features/companies/components/CompaniesDataTable'

export default function page() {
  return (
    <main className='container py-12'>
    <Card>
      <CardHeader>
        <CardTitle>Companies</CardTitle>
      </CardHeader>
      <CardContent>
        <CompaniesDataTable />
      </CardContent>
    </Card>
  </main>
  )
}
