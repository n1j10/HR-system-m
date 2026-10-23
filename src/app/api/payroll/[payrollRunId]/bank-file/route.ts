import { requirePermission } from "@/lib/auth";
import { getFullName } from "@/lib/format";
import { createCsvResponse } from "@/lib/csv";
import { getPayrollRunWithPayslips } from "@/features/payroll/queries";

/** A CSV the finance team can upload to the bank to pay everyone. */
export async function GET(_request: Request, { params }: RouteContext<"/api/payroll/[payrollRunId]/bank-file">) {
  await requirePermission("payroll:manage");
  const { payrollRunId } = await params;

  const payrollRun = await getPayrollRunWithPayslips(payrollRunId);
  if (!payrollRun) return new Response("Payroll not found", { status: 404 });
  if (payrollRun.status === "DRAFT") return new Response("Approve the payroll first", { status: 400 });

  const headerRow = ["Employee number", "Name", "Bank", "Account", "Amount", "Currency"];
  const dataRows = payrollRun.payslips.map((payslip) => [
    payslip.employee.employeeNumber,
    getFullName(payslip.employee),
    payslip.employee.bankName ?? "",
    payslip.employee.bankAccount ?? "",
    payslip.netSalary.toFixed(2),
    payslip.currency,
  ]);

  const fileName = `bank-transfer-${payrollRun.year}-${String(payrollRun.month).padStart(2, "0")}.csv`;
  return createCsvResponse(fileName, headerRow, dataRows);
}
