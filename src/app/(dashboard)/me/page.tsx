import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { requireEmployeeProfile } from "@/lib/auth";
import { getEmployeeProfile } from "@/features/employees/queries";
import { EmployeeProfileView } from "@/features/employees/components/employee-profile-view";

export default async function MyProfilePage() {
  const { employee } = await requireEmployeeProfile();

  const myProfile = await getEmployeeProfile(employee.id);
  if (!myProfile) notFound();

  return (
    <>
      <PageHeader title="My profile" description="Something wrong? Ask HR to update your details." />
      {/* Everyone can see their own salary. */}
      <EmployeeProfileView employee={myProfile} showSalary />
    </>
  );
}
