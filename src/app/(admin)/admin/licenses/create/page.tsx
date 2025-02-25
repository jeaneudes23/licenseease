import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LicenseCreateForm from '@/features/licenses/components/LicenseCreateForm'

export default function page() {
  return (
    <main className='grid gap-6 px-4'>
    <div>
      <h2 className='text-2xl capitalize font-bold'>New License</h2>
    </div>
    <Card>
      <CardHeader>
      </CardHeader>
      <CardContent>
        <LicenseCreateForm />
      </CardContent>
    </Card>
  </main>
  )
}
