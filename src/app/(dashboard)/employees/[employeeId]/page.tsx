import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PencilIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { ActionForm } from "@/components/shared/action-form";
import { SubmitButton } from "@/components/shared/submit-button";
import { requirePermission } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { canViewEmployee, getEmployeeProfile } from "@/features/employees/queries";
import { archiveEmployee } from "@/features/employees/actions";
import { EmployeeProfileView } from "@/features/employees/components/employee-profile-view";

export default async function EmployeeProfilePage({ params }: PageProps<"/employees/[employeeId]">) {
  const currentUser = await requirePermission("employee:read");
  const { employeeId } = await params;

  const employee = await getEmployeeProfile(employeeId);
  if (!employee) notFound();
  if (!canViewEmployee(currentUser, employee)) redirect("/unauthorized");

  const canManageEmployees = hasPermission(currentUser.role, "employee:manage");
  const canViewSalary = hasPermission(currentUser.role, "employee:view-salary");

  return (
    <>
      <PageHeader
        title="Employee profile"
        actions={
          canManageEmployees && (
            <>
              <Link href={`/employees/${employee.id}/edit`} className={buttonVariants({ variant: "outline" })}>
                <PencilIcon /> Edit
              </Link>
              <ActionForm action={archiveEmployee} confirmMessage="Archive this employee? They will be hidden from all lists.">
                <input type="hidden" name="employeeId" value={employee.id} />
                <SubmitButton variant="destructive">Archive</SubmitButton>
              </ActionForm>
            </>
          )
        }
      />
      <EmployeeProfileView employee={employee} showSalary={canViewSalary} />
    </>
  );
}
