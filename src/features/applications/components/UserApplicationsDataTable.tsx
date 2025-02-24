import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { applications } from '../schema/applicationSchema'

export default function UserApplicationsDataTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>License</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date Submitted</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((application, index) =>
          <TableRow key={index}>
            <TableCell>{application.license}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 text-xs font-medium text-white rounded-md ${application.status === 'approved' ? 'bg-accent' : application.status === 'rejected' ? 'bg-red-600' : 'bg-gray-600'}`}>{application.status}</span>
            </TableCell>
            <TableCell>{application.date}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
