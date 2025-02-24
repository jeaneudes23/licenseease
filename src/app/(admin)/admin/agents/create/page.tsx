import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AgentCreateForm from '@/features/agents/components/AgentCreateForm'

export default function page() {
  return (
    <main className='grid gap-6 px-4'>
      <div>
        <h2 className='text-2xl capitalize font-bold'>New Agent</h2>
      </div>
      <Card>
        <CardHeader>
        </CardHeader>
        <CardContent className='text-sm'>
          <AgentCreateForm />
        </CardContent>
      </Card>
    </main>
  )
}
