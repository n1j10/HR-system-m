import type { LeaveType } from "@prisma/client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActionForm } from "@/components/shared/action-form";
import { FormField } from "@/components/shared/form-field";
import { OptionSelect } from "@/components/shared/option-select";
import { SubmitButton } from "@/components/shared/submit-button";
import { requestLeave } from "@/features/leaves/actions";

export function LeaveRequestForm({ leaveTypes }: { leaveTypes: LeaveType[] }) {
  const leaveTypeOptions = leaveTypes.map((leaveType) => ({
    value: leaveType.id,
    label: leaveType.requiresAttachment ? `${leaveType.name} (needs attachment)` : leaveType.name,
  }));

  return (
    <ActionForm action={requestLeave} resetOnSuccess className="grid gap-4">
      <FormField label="Leave type" htmlFor="leaveTypeId">
        <OptionSelect id="leaveTypeId" name="leaveTypeId" options={leaveTypeOptions} placeholder="Select a type" required />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="From" htmlFor="startDate">
          <Input id="startDate" name="startDate" type="date" required />
        </FormField>
        <FormField label="To" htmlFor="endDate">
          <Input id="endDate" name="endDate" type="date" required />
        </FormField>
      </div>
      <FormField label="Reason" htmlFor="reason">
        <Textarea id="reason" name="reason" />
      </FormField>
      <FormField label="Attachment link" htmlFor="attachmentUrl" hint="A link to a medical report or other document, if needed.">
        <Input id="attachmentUrl" name="attachmentUrl" type="url" placeholder="https://..." />
      </FormField>
      <SubmitButton>Send request</SubmitButton>
    </ActionForm>
  );
}
