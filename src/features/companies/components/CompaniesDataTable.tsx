import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { companies } from '../schema/companySchema'

export default function CompaniesDataTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Date Registered</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((company, index) =>
          <TableRow key={index}>
            <TableCell>{company.name}</TableCell>
            <TableCell>{company.registered_at}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
