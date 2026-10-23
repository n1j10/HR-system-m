import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionForm } from "@/components/shared/action-form";
import { FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { requirePermission } from "@/lib/auth";
import { formatMoney, MONTH_NAMES } from "@/lib/format";
import { getPayrollRuns } from "@/features/payroll/queries";
import { createPayrollRun } from "@/features/payroll/actions";

export default async function PayrollPage() {
  await requirePermission("payroll:manage");
  const payrollRuns = await getPayrollRuns();
  const today = new Date();

  return (
    <>
      <PageHeader title="Payroll" description="Create the monthly payroll, review it, approve it and mark it as paid." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent>
            {payrollRuns.length === 0 ? (
              <EmptyState message="No payrolls yet. Create the first one." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Total net (IQD)</TableHead>
                    <TableHead>Total net (USD)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRuns.map((payrollRun) => (
                    <TableRow key={payrollRun.id}>
                      <TableCell>
                        <Link href={`/payroll/${payrollRun.id}`} className="font-medium hover:underline">
                          {MONTH_NAMES[payrollRun.month - 1]} {payrollRun.year}
                        </Link>
                      </TableCell>
                      <TableCell>{payrollRun.employeeCount}</TableCell>
                      <TableCell>{formatMoney(payrollRun.totalNetIqd, "IQD")}</TableCell>
                      <TableCell>{formatMoney(payrollRun.totalNetUsd, "USD")}</TableCell>
                      <TableCell><StatusBadge status={payrollRun.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>New payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm action={createPayrollRun} className="grid gap-4">
              <FormField label="Month" htmlFor="month">
                <NativeSelect id="month" name="month" defaultValue={String(today.getMonth() + 1)} className="w-full">
                  {MONTH_NAMES.map((monthName, index) => (
                    <NativeSelectOption key={monthName} value={String(index + 1)}>{monthName}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </FormField>
              <FormField label="Year" htmlFor="year">
                <Input id="year" name="year" type="number" defaultValue={today.getFullYear()} required />
              </FormField>
              <p className="text-muted-foreground text-xs">
                Mark absences in attendance first. Absent days and unpaid leave are deducted automatically.
              </p>
              <SubmitButton>Create payroll</SubmitButton>
            </ActionForm>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
