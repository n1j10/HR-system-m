import Link from "next/link";
import { EmployeeStatus } from "@prisma/client";
import { DownloadIcon, PlusIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { requirePermission } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { formatDate, getFullName } from "@/lib/format";
import { getPageNumber, getSearchParam } from "@/lib/search-params";
import { getEmployeeList } from "@/features/employees/queries";
import { getDepartmentSelectOptions } from "@/features/employees/select-options";
import { EmployeeFilters } from "@/features/employees/components/employee-filters";

function parseEmployeeStatus(value: string | undefined): EmployeeStatus | undefined {
  return Object.values(EmployeeStatus).find((status) => status === value);
}

export default async function EmployeesPage({ searchParams }: PageProps<"/employees">) {
  const currentUser = await requirePermission("employee:read");
  const params = await searchParams;

  const filters = {
    search: getSearchParam(params.search),
    departmentId: getSearchParam(params.departmentId),
    status: parseEmployeeStatus(getSearchParam(params.status)),
  };
  const currentPage = getPageNumber(params.page);

  const [{ employees, totalPages }, departmentOptions] = await Promise.all([
    getEmployeeList(currentUser, { ...filters, page: currentPage }),
    getDepartmentSelectOptions(),
  ]);

  const canManageEmployees = hasPermission(currentUser.role, "employee:manage");

  return (
    <>
      <PageHeader
        title="Employees"
        description={canManageEmployees ? "Everyone working in the company." : "The people in your team."}
        actions={
          canManageEmployees && (
            <>
              <a href="/api/employees/export" className={buttonVariants({ variant: "outline" })}>
                <DownloadIcon /> Export CSV
              </a>
              <Link href="/employees/new" className={buttonVariants()}>
                <PlusIcon /> Add employee
              </Link>
            </>
          )
        }
      />

      <Card>
        <CardContent>
          <EmployeeFilters departmentOptions={departmentOptions} currentFilters={filters} />

          {employees.length === 0 ? (
            <EmptyState message="No employees found." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Hire date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-mono text-xs">{employee.employeeNumber}</TableCell>
                    <TableCell>
                      <Link href={`/employees/${employee.id}`} className="font-medium hover:underline">
                        {getFullName(employee)}
                      </Link>
                      <p className="text-muted-foreground text-xs">{employee.email}</p>
                    </TableCell>
                    <TableCell>{employee.department.name}</TableCell>
                    <TableCell>{employee.position.title}</TableCell>
                    <TableCell>{formatDate(employee.hireDate)}</TableCell>
                    <TableCell><StatusBadge status={employee.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Pagination currentPage={currentPage} totalPages={totalPages} searchParams={filters} basePath="/employees" />
        </CardContent>
      </Card>
    </>
  );
}
