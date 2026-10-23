import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireEmployeeProfile } from "@/lib/auth";
import { formatMoney, MONTH_NAMES } from "@/lib/format";
import { getMyPayslips } from "@/features/payroll/queries";

export default async function MyPayslipsPage() {
  const { employee } = await requireEmployeeProfile();
  const payslips = await getMyPayslips(employee.id);

  return (
    <>
      <PageHeader title="My payslips" description="Payslips appear here after HR approves the month." />
      <Card>
        <CardContent>
          {payslips.length === 0 ? (
            <EmptyState message="No payslips yet." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Net salary</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell>
                      <Link href={`/payslips/${payslip.id}`} className="font-medium hover:underline">
                        {MONTH_NAMES[payslip.payrollRun.month - 1]} {payslip.payrollRun.year}
                      </Link>
                    </TableCell>
                    <TableCell>{formatMoney(payslip.netSalary, payslip.currency)}</TableCell>
                    <TableCell><StatusBadge status={payslip.payrollRun.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
