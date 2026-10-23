import Link from "next/link";
import { PencilIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteButton } from "@/components/shared/delete-button";
import { requirePermission } from "@/lib/auth";
import { getDepartmentsWithEmployeeCount } from "@/features/departments/queries";
import { deleteDepartment } from "@/features/departments/actions";
import { DepartmentForm } from "@/features/departments/components/department-form";

export default async function DepartmentsPage() {
  await requirePermission("organization:manage");
  const departments = await getDepartmentsWithEmployeeCount();

  return (
    <>
      <PageHeader title="Departments" description="Groups of employees inside the company." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent>
            {departments.length === 0 ? (
              <EmptyState message="No departments yet." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((department) => (
                    <TableRow key={department.id}>
                      <TableCell className="font-mono">{department.code}</TableCell>
                      <TableCell>
                        <p className="font-medium">{department.name}</p>
                        <p className="text-muted-foreground text-xs">{department.description}</p>
                      </TableCell>
                      <TableCell>{department._count.employees}</TableCell>
                      <TableCell className="flex justify-end gap-1">
                        <Link href={`/departments/${department.id}`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })} aria-label="Edit">
                          <PencilIcon />
                        </Link>
                        <DeleteButton action={deleteDepartment} idFieldName="departmentId" idValue={department.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>New department</CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
