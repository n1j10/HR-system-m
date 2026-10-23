import { CheckIcon, XIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ActionForm } from "@/components/shared/action-form";
import { SubmitButton } from "@/components/shared/submit-button";
import { approveLeaveRequest, rejectLeaveRequest } from "@/features/leaves/actions";

export function LeaveDecisionButtons({ leaveRequestId }: { leaveRequestId: string }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <ActionForm action={approveLeaveRequest}>
        <input type="hidden" name="leaveRequestId" value={leaveRequestId} />
        <SubmitButton size="sm"><CheckIcon /> Approve</SubmitButton>
      </ActionForm>
      <ActionForm action={rejectLeaveRequest} className="flex gap-1">
        <input type="hidden" name="leaveRequestId" value={leaveRequestId} />
        <Input name="decisionNote" placeholder="Reason (optional)" className="h-7 w-40" />
        <SubmitButton size="sm" variant="destructive"><XIcon /> Reject</SubmitButton>
      </ActionForm>
    </div>
  );
}
