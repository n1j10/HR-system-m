import { Role } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { ActionForm } from "@/components/shared/action-form";
import { EnumSelect } from "@/components/shared/enum-select";
import { OptionSelect } from "@/components/shared/option-select";
import { SubmitButton } from "@/components/shared/submit-button";
import { requirePermission } from "@/lib/auth";
import { formatDate, getFullName } from "@/lib/format";
import { getAllUsers, getEmployeesWithoutAccount } from "@/features/users/queries";
import { updateUserAccess } from "@/features/users/actions";

export default async function UsersPage() {
  await requirePermission("user:manage");
  const [users, freeEmployees] = await Promise.all([getAllUsers(), getEmployeesWithoutAccount()]);

  const freeEmployeeOptions = freeEmployees.map((employee) => ({
    value: employee.id,
    label: `${getFullName(employee)} (${employee.employeeNumber})`,
  }));

  return (
    <>
      <PageHeader
        title="Users & roles"
        description="Everyone who signed in with Clerk. Pick a role and link each account to an employee record."
      />
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Role · Employee · Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                // The user's current employee must also appear in their own dropdown.
                const employeeOptions = user.employee
                  ? [{ value: user.employee.id, label: `${getFullName(user.employee)} (${user.employee.employeeNumber})` }, ...freeEmployeeOptions]
                  : freeEmployeeOptions;

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium">{user.name ?? "—"}</p>
                      <p className="text-muted-foreground text-xs">{user.email}</p>
                      <p className="text-muted-foreground text-xs">Joined {formatDate(user.createdAt)}</p>
                    </TableCell>
                    <TableCell>
                      <ActionForm action={updateUserAccess} className="flex flex-wrap items-center gap-2">
                        <input type="hidden" name="userId" value={user.id} />
                        <EnumSelect id={`role-${user.id}`} name="role" values={Object.values(Role)} defaultValue={user.role} className="w-36" />
                        <OptionSelect id={`employee-${user.id}`} name="employeeId" options={employeeOptions} defaultValue={user.employee?.id ?? ""} placeholder="No employee" className="w-56" />
                        <Label className="font-normal">
                          <input type="checkbox" name="isActive" defaultChecked={user.isActive} /> Active
                        </Label>
                        <SubmitButton size="sm" variant="outline">Save</SubmitButton>
                      </ActionForm>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
