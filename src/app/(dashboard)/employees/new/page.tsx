import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/auth";
import { getEmployeeFormOptions } from "@/features/employees/select-options";
import { EmployeeForm } from "@/features/employees/components/employee-form";

export default async function NewEmployeePage() {
  await requirePermission("employee:manage");
  const formOptions = await getEmployeeFormOptions();

  return (
    <>
      <PageHeader title="Add employee" description="An employee number is created automatically." />
      <EmployeeForm {...formOptions} />
    </>
  );
}
