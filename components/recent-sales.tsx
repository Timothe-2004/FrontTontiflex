'use client';

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

const recentSales = [
  {
    id: 1,
    date: '2025-06-24',
    amount: '150€',
    client: 'John Doe',
    status: 'completed',
  },
  {
    id: 2,
    date: '2025-06-23',
    amount: '200€',
    client: 'Jane Smith',
    status: 'pending',
  },
  {
    id: 3,
    date: '2025-06-22',
    amount: '120€',
    client: 'Mike Johnson',
    status: 'completed',
  },
];

export function RecentSales() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dernières Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentSales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.date}</TableCell>
                <TableCell>{sale.amount}</TableCell>
                <TableCell>{sale.client}</TableCell>
                <TableCell>{sale.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
