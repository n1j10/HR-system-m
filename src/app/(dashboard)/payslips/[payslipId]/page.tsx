import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { PrintButton } from "@/components/shared/print-button";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getPayslipWithDetails } from "@/features/payroll/queries";
import { PayslipDocument } from "@/features/payroll/components/payslip-document";

export default async function PayslipPage({ params }: PageProps<"/payslips/[payslipId]">) {
  const currentUser = await getCurrentUser();
  const { payslipId } = await params;

  const payslip = await getPayslipWithDetails(payslipId);
  if (!payslip) notFound();

  // Payroll staff can open any payslip. Employees only their own approved ones.
  const isPayrollStaff = hasPermission(currentUser.role, "payroll:manage");
  const isOwnApprovedPayslip = payslip.employeeId === currentUser.employee?.id && payslip.payrollRun.status !== "DRAFT";
  if (!isPayrollStaff && !isOwnApprovedPayslip) redirect("/unauthorized");

  return (
    <>
      <div className="print:hidden">
        <PageHeader title="Payslip" actions={<PrintButton />} />
      </div>
      <PayslipDocument payslip={payslip} />
    </>
  );
}
