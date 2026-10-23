"use client";

import { Trash2Icon } from "lucide-react";

import type { ActionResult } from "@/lib/action-result";
import { ActionForm } from "@/components/shared/action-form";
import { SubmitButton } from "@/components/shared/submit-button";

type DeleteButtonProps = {
  action: (previousResult: ActionResult, formData: FormData) => Promise<ActionResult>;
  /** Hidden input name and value, e.g. name="departmentId" value="abc". */
  idFieldName: string;
  idValue: string;
  confirmMessage?: string;
};

export function DeleteButton({ action, idFieldName, idValue, confirmMessage = "Are you sure? This cannot be undone." }: DeleteButtonProps) {
  return (
    <ActionForm action={action} confirmMessage={confirmMessage}>
      <input type="hidden" name={idFieldName} value={idValue} />
      <SubmitButton variant="ghost" size="icon-sm" aria-label="Delete">
        <Trash2Icon className="text-destructive" />
      </SubmitButton>
    </ActionForm>
  );
}
