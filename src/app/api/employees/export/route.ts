import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { createCsvResponse } from "@/lib/csv";

export async function GET() {
  await requirePermission("employee:manage");

  const employees = await prisma.employee.findMany({
    where: { deletedAt: null },
    orderBy: { employeeNumber: "asc" },
    include: { department: true, position: true },
  });

  const headerRow = ["Number", "First name", "Last name", "Email", "Phone", "Department", "Position", "Status", "Hire date"];
  const dataRows = employees.map((employee) => [
    employee.employeeNumber,
    employee.firstName,
    employee.lastName,
    employee.email,
    employee.phone,
    employee.department.name,
    employee.position.title,
    employee.status,
    formatDate(employee.hireDate),
  ]);

  return createCsvResponse("employees.csv", headerRow, dataRows);
}
