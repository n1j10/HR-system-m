import { formatDate, formatMoney, getFullName, MONTH_NAMES } from "@/lib/format";
import type { getPayslipWithDetails } from "@/features/payroll/queries";

type PayslipWithDetails = NonNullable<Awaited<ReturnType<typeof getPayslipWithDetails>>>;

function PayslipLine({ label, amount, currency, isDeduction = false }: { label: string; amount: Parameters<typeof formatMoney>[0]; currency: string; isDeduction?: boolean }) {
  return (
    <div className="flex justify-between border-b py-2 text-sm">
      <span>{label}</span>
      <span className={isDeduction ? "text-destructive" : ""}>
        {isDeduction && "− "}
        {formatMoney(amount, currency)}
      </span>
    </div>
  );
}

/** The printable payslip. Use the browser's "Print → Save as PDF" to get a PDF. */
export function PayslipDocument({ payslip }: { payslip: PayslipWithDetails }) {
  const { employee, payrollRun, currency } = payslip;

  return (
    <div className="bg-card mx-auto max-w-2xl rounded-xl border p-8 print:border-0">
      <div className="mb-6 flex justify-between">
        <div>
          <h2 className="text-xl font-semibold">Payslip</h2>
          <p className="text-muted-foreground text-sm">
            {MONTH_NAMES[payrollRun.month - 1]} {payrollRun.year}
          </p>
        </div>
        <div className="text-end text-sm">
          <p className="font-medium">{getFullName(employee)}</p>
          <p className="text-muted-foreground">{employee.employeeNumber}</p>
          <p className="text-muted-foreground">
            {employee.position.title} · {employee.department.name}
          </p>
        </div>
      </div>

      <h3 className="mb-1 text-sm font-medium">Earnings</h3>
      <PayslipLine label="Base salary" amount={payslip.baseSalary} currency={currency} />
      <PayslipLine label="Allowances" amount={payslip.allowances} currency={currency} />
      <PayslipLine label="Bonus" amount={payslip.bonus} currency={currency} />

      <h3 className="mt-6 mb-1 text-sm font-medium">Deductions</h3>
      <PayslipLine
        label={`Absence & unpaid leave (${payslip.absentDays + payslip.unpaidLeaveDays} days)`}
        amount={payslip.absenceDeduction}
        currency={currency}
        isDeduction
      />
      <PayslipLine label="Other deductions" amount={payslip.otherDeductions} currency={currency} isDeduction />

      <div className="mt-6 flex justify-between rounded-lg bg-muted p-4 text-lg font-semibold">
        <span>Net salary</span>
        <span>{formatMoney(payslip.netSalary, currency)}</span>
      </div>

      <p className="text-muted-foreground mt-6 text-xs">
        Bank: {employee.bankName ?? "—"} · Account: {employee.bankAccount ?? "—"} · Generated {formatDate(payslip.createdAt)}
      </p>
    </div>
  );
}
