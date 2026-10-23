import { AttendanceStatus } from "@prisma/client";

import { Input } from "@/components/ui/input";
import { ActionForm } from "@/components/shared/action-form";
import { EnumSelect } from "@/components/shared/enum-select";
import { FormField } from "@/components/shared/form-field";
import { OptionSelect, type SelectOption } from "@/components/shared/option-select";
import { SubmitButton } from "@/components/shared/submit-button";
import { saveManualAttendance } from "@/features/attendance/actions";

type ManualAttendanceFormProps = {
  employeeOptions: SelectOption[];
  /** "YYYY-MM-DD" of the day being viewed. */
  selectedDate: string;
};

export function ManualAttendanceForm({ employeeOptions, selectedDate }: ManualAttendanceFormProps) {
  return (
    <ActionForm action={saveManualAttendance} resetOnSuccess className="grid gap-4">
      <FormField label="Employee" htmlFor="employeeId">
        <OptionSelect id="employeeId" name="employeeId" options={employeeOptions} placeholder="Select an employee" required />
      </FormField>
      <FormField label="Date" htmlFor="date">
        <Input id="date" name="date" type="date" defaultValue={selectedDate} required />
      </FormField>
      <FormField label="Status" htmlFor="status">
        <EnumSelect id="status" name="status" values={Object.values(AttendanceStatus)} defaultValue="PRESENT" required />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Check in" htmlFor="checkInTime">
          <Input id="checkInTime" name="checkInTime" type="time" />
        </FormField>
        <FormField label="Check out" htmlFor="checkOutTime">
          <Input id="checkOutTime" name="checkOutTime" type="time" />
        </FormField>
      </div>
      <FormField label="Reason" htmlFor="note" hint="Required. Saved in the audit log.">
        <Input id="note" name="note" placeholder="e.g. Fingerprint device was down" required />
      </FormField>
      <SubmitButton>Save attendance</SubmitButton>
    </ActionForm>
  );
}
