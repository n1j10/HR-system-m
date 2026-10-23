import Link from "next/link";
import { notFound } from "next/navigation";
import { BanknoteIcon, CheckIcon, DownloadIcon, Trash2Icon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionForm } from "@/components/shared/action-form";
import { SubmitButton } from "@/components/shared/submit-button";
import { requirePermission } from "@/lib/auth";
import { formatMoney, getFullName, MONTH_NAMES } from "@/lib/format";
import { getPayrollRunWithPayslips } from "@/features/payroll/queries";
import { approvePayrollRun, deletePayrollRun, markPayrollRunPaid } from "@/features/payroll/actions";
import { PayslipAdjustmentForm } from "@/features/payroll/components/payslip-adjustment-form";

export default async function PayrollRunPage({ params }: PageProps<"/payroll/[payrollRunId]">) {
  await requirePermission("payroll:manage");
  const { payrollRunId } = await params;

  const payrollRun = await getPayrollRunWithPayslips(payrollRunId);
  if (!payrollRun) notFound();

  const isDraft = payrollRun.status === "DRAFT";
  const monthTitle = `${MONTH_NAMES[payrollRun.month - 1]} ${payrollRun.year}`;

  return (
    <>
      <PageHeader
        title={`Payroll · ${monthTitle}`}
        description={isDraft ? "Review the numbers, add bonuses or deductions, then approve." : "This month is locked."}
        actions={
          <>
            <StatusBadge status={payrollRun.status} />
            {payrollRun.status !== "DRAFT" && (
              <a href={`/api/payroll/${payrollRun.id}/bank-file`} className={buttonVariants({ variant: "outline" })}>
                <DownloadIcon /> Bank file
              </a>
            )}
            {isDraft && (
              <>
                <ActionForm action={deletePayrollRun} confirmMessage="Delete this draft payroll?">
                  <input type="hidden" name="payrollRunId" value={payrollRun.id} />
                  <SubmitButton variant="destructive"><Trash2Icon /> Delete</SubmitButton>
                </ActionForm>
                <ActionForm action={approvePayrollRun} confirmMessage="Approve and lock this month? Payslips cannot be changed after this.">
                  <input type="hidden" name="payrollRunId" value={payrollRun.id} />
                  <SubmitButton><CheckIcon /> Approve</SubmitButton>
                </ActionForm>
              </>
            )}
            {payrollRun.status === "APPROVED" && (
              <ActionForm action={markPayrollRunPaid} confirmMessage="Mark this payroll as paid?">
                <input type="hidden" name="payrollRunId" value={payrollRun.id} />
                <SubmitButton><BanknoteIcon /> Mark as paid</SubmitButton>
              </ActionForm>
            )}
          </>
        }
      />

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Base</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Unpaid days</TableHead>
                <TableHead>Deduction</TableHead>
                <TableHead>{isDraft ? "Bonus / Other deductions" : "Bonus"}</TableHead>
                <TableHead>Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollRun.payslips.map((payslip) => (
                <TableRow key={payslip.id}>
                  <TableCell>
                    <Link href={`/payslips/${payslip.id}`} className="font-medium hover:underline">
                      {getFullName(payslip.employee)}
                    </Link>
                    <p className="text-muted-foreground text-xs">{payslip.employee.department.name}</p>
                  </TableCell>
                  <TableCell>{formatMoney(payslip.baseSalary, payslip.currency)}</TableCell>
                  <TableCell>{formatMoney(payslip.allowances, payslip.currency)}</TableCell>
                  <TableCell>{payslip.absentDays + payslip.unpaidLeaveDays}</TableCell>
                  <TableCell className="text-destructive">
                    {formatMoney(payslip.absenceDeduction.plus(payslip.otherDeductions), payslip.currency)}
                  </TableCell>
                  <TableCell>
                    {isDraft ? <PayslipAdjustmentForm payslip={payslip} /> : formatMoney(payslip.bonus, payslip.currency)}
                  </TableCell>
                  <TableCell className="font-semibold">{formatMoney(payslip.netSalary, payslip.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
