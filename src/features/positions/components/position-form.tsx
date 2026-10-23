import type { Position } from "@prisma/client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActionForm } from "@/components/shared/action-form";
import { FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { createPosition, updatePosition } from "@/features/positions/actions";

/** Pass a position to edit it, or nothing to create a new one. */
export function PositionForm({ position }: { position?: Position }) {
  const isEditing = Boolean(position);

  return (
    <ActionForm action={isEditing ? updatePosition : createPosition} resetOnSuccess className="grid gap-4">
      {position && <input type="hidden" name="positionId" value={position.id} />}
      <FormField label="Title" htmlFor="title">
        <Input id="title" name="title" defaultValue={position?.title} required />
      </FormField>
      <FormField label="Level" htmlFor="level" hint="Optional grade from 1 (junior) to 20 (top)">
        <Input id="level" name="level" type="number" min={1} max={20} defaultValue={position?.level ?? ""} />
      </FormField>
      <FormField label="Description" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={position?.description ?? ""} />
      </FormField>
      <SubmitButton>{isEditing ? "Save changes" : "Add position"}</SubmitButton>
    </ActionForm>
  );
}
