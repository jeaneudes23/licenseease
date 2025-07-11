import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { agents } from '../schema/agentSchema'
import { Badge } from '@/components/ui/badge'
import { User, Building } from 'lucide-react'

export default function AgentsDataTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Registration</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Local Representatives</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {agents.map((agent, index) =>
          <TableRow key={index}>
            <TableCell>
              <div className='flex items-center gap-2'>
                <Building className='size-4 text-muted-foreground' />
                <div>
                  <div className='font-medium'>{agent.companyName}</div>
                  <div className='text-sm text-muted-foreground'>{agent.companyType}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div className='font-medium'>{agent.registrationNumber}</div>
                <div className='text-sm text-muted-foreground'>{agent.companyEmail}</div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div className='font-medium'>{agent.companyPhone}</div>
                <div className='text-sm text-muted-foreground'>{agent.companyAddress}</div>
              </div>
            </TableCell>
            <TableCell>
              <div className='flex flex-wrap gap-1'>
                {agent.representatives.length > 0 ? (
                  agent.representatives.map((rep, repIndex) => (
                    <Badge key={repIndex} variant="outline" className='text-xs'>
                      {rep.fullName}
                    </Badge>
                  ))
                ) : (
                  <span className='text-sm text-muted-foreground'>No representatives</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                {agent.status || 'pending'}
              </Badge>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
