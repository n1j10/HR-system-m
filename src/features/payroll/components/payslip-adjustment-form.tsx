import type { Payslip } from "@prisma/client";

import { Input } from "@/components/ui/input";
import { ActionForm } from "@/components/shared/action-form";
import { SubmitButton } from "@/components/shared/submit-button";
import { adjustPayslip } from "@/features/payroll/actions";

/** Small inline form in the payroll table to add a bonus or a deduction. */
export function PayslipAdjustmentForm({ payslip }: { payslip: Payslip }) {
  return (
    <ActionForm action={adjustPayslip} className="flex items-center gap-1">
      <input type="hidden" name="payslipId" value={payslip.id} />
      <Input name="bonus" type="number" min={0} step="0.01" defaultValue={payslip.bonus.toString()} className="h-7 w-24" aria-label="Bonus" title="Bonus" />
      <Input name="otherDeductions" type="number" min={0} step="0.01" defaultValue={payslip.otherDeductions.toString()} className="h-7 w-24" aria-label="Other deductions" title="Other deductions" />
      <SubmitButton size="sm" variant="outline">Save</SubmitButton>
    </ActionForm>
  );
}
