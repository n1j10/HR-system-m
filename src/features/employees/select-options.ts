import type { SelectOption } from "@/components/shared/option-select";
import { getFullName } from "@/lib/format";
import { getDepartmentOptions } from "@/features/departments/queries";
import { getPositionOptions } from "@/features/positions/queries";
import { getEmployeeOptions, getVisibleEmployeesFilter } from "@/features/employees/queries";
import { prisma } from "@/lib/prisma";
import type { CurrentUser } from "@/lib/auth";

/** Turns employees into dropdown options like "Sara Ali (EMP-0003)". */
export async function getEmployeeSelectOptions(): Promise<SelectOption[]> {
  const employees = await getEmployeeOptions();
  return employees.map((employee) => ({
    value: employee.id,
    label: `${getFullName(employee)} (${employee.employeeNumber})`,
  }));
}

export async function getDepartmentSelectOptions(): Promise<SelectOption[]> {
  const departments = await getDepartmentOptions();
  return departments.map((department) => ({ value: department.id, label: department.name }));
}

/** Everything the employee form needs for its dropdowns. */
export async function getEmployeeFormOptions() {
  const [departmentOptions, positions, managerOptions] = await Promise.all([
    getDepartmentSelectOptions(),
    getPositionOptions(),
    getEmployeeSelectOptions(),
  ]);

  const positionOptions = positions.map((position) => ({ value: position.id, label: position.title }));
  return { departmentOptions, positionOptions, managerOptions };
}

/** Only the employees this user is allowed to see (a manager gets their team). */
export async function getVisibleEmployeeSelectOptions(user: CurrentUser): Promise<SelectOption[]> {
  const employees = await prisma.employee.findMany({
    where: getVisibleEmployeesFilter(user),
    orderBy: { firstName: "asc" },
    select: { id: true, firstName: true, lastName: true, employeeNumber: true },
  });
  return employees.map((employee) => ({
    value: employee.id,
    label: `${getFullName(employee)} (${employee.employeeNumber})`,
  }));
}
