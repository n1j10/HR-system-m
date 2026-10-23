import type { Department } from "@prisma/client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActionForm } from "@/components/shared/action-form";
import { FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { createDepartment, updateDepartment } from "@/features/departments/actions";

/** Pass a department to edit it, or nothing to create a new one. */
export function DepartmentForm({ department }: { department?: Department }) {
  const isEditing = Boolean(department);

  return (
    <ActionForm action={isEditing ? updateDepartment : createDepartment} resetOnSuccess className="grid gap-4">
      {department && <input type="hidden" name="departmentId" value={department.id} />}
      <FormField label="Name" htmlFor="name">
        <Input id="name" name="name" defaultValue={department?.name} required />
      </FormField>
      <FormField label="Code" htmlFor="code" hint="Short unique code, e.g. HR, IT, FIN">
        <Input id="code" name="code" defaultValue={department?.code} required />
      </FormField>
      <FormField label="Description" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={department?.description ?? ""} />
      </FormField>
      <SubmitButton>{isEditing ? "Save changes" : "Add department"}</SubmitButton>
    </ActionForm>
  );
}
