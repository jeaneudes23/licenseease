import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import UserCompaniesDatatable from '@/features/companies/components/UserCompaniesDataTable'

export default function page() {
  return (
    <main className='container py-12'>
    <Card>
      <CardHeader>
        <CardTitle>Companies</CardTitle>
      </CardHeader>
      <CardContent>
        <UserCompaniesDatatable />
      </CardContent>
    </Card>
  </main>
  )
}
