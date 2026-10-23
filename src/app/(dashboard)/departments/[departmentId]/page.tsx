import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/auth";
import { getDepartmentById } from "@/features/departments/queries";
import { DepartmentForm } from "@/features/departments/components/department-form";

export default async function EditDepartmentPage({ params }: PageProps<"/departments/[departmentId]">) {
  await requirePermission("organization:manage");
  const { departmentId } = await params;

  const department = await getDepartmentById(departmentId);
  if (!department) notFound();

  return (
    <>
      <PageHeader title={`Edit ${department.name}`} />
      <Card className="max-w-lg">
        <CardContent>
          <DepartmentForm department={department} />
        </CardContent>
      </Card>
    </>
  );
}
