import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/auth";
import { getFullName } from "@/lib/format";
import { getEmployeeForEdit } from "@/features/employees/queries";
import { getEmployeeFormOptions } from "@/features/employees/select-options";
import { EmployeeForm } from "@/features/employees/components/employee-form";

export default async function EditEmployeePage({ params }: PageProps<"/employees/[employeeId]/edit">) {
  await requirePermission("employee:manage");
  const { employeeId } = await params;

  const [employee, formOptions] = await Promise.all([getEmployeeForEdit(employeeId), getEmployeeFormOptions()]);
  if (!employee) notFound();

  // An employee cannot be their own manager, so remove them from that list.
  const managerOptions = formOptions.managerOptions.filter((option) => option.value !== employee.id);

  return (
    <>
      <PageHeader title={`Edit ${getFullName(employee)}`} description={employee.employeeNumber} />
      <EmployeeForm employee={employee} {...formOptions} managerOptions={managerOptions} />
    </>
  );
}
