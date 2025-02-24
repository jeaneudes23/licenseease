import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { agents } from '../schema/agentSchema'

export default function AgentsDataTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Address</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {agents.map((agent, index) =>
          <TableRow key={index}>
            <TableCell>{agent.name}</TableCell>
            <TableCell>{agent.email}</TableCell>
            <TableCell>{agent.phone}</TableCell>
            <TableCell>{agent.address}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
