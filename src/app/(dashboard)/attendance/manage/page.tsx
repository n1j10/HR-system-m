import { SearchIcon, UserXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { ActionForm } from "@/components/shared/action-form";
import { SubmitButton } from "@/components/shared/submit-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { requirePermission } from "@/lib/auth";
import { formatTime, getFullName } from "@/lib/format";
import { getToday, toDateInputValue } from "@/lib/dates";
import { getDateParam } from "@/lib/search-params";
import { getDailyAttendanceSheet } from "@/features/attendance/queries";
import { markMissingAsAbsent } from "@/features/attendance/actions";
import { getEmployeeSelectOptions } from "@/features/employees/select-options";
import { ManualAttendanceForm } from "@/features/attendance/components/manual-attendance-form";

export default async function ManageAttendancePage({ searchParams }: PageProps<"/attendance/manage">) {
  await requirePermission("attendance:manage");
  const params = await searchParams;

  const selectedDate = getDateParam(params.date) ?? getToday();
  const selectedDateText = toDateInputValue(selectedDate);

  const [dailySheet, employeeOptions] = await Promise.all([
    getDailyAttendanceSheet(selectedDate),
    getEmployeeSelectOptions(),
  ]);

  return (
    <>
      <PageHeader title="Daily attendance" description="See who came in, fix records by hand and mark absences." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <form method="GET" className="flex gap-2">
                <Input name="date" type="date" defaultValue={selectedDateText} className="w-44" />
                <Button type="submit" variant="secondary"><SearchIcon /> Show</Button>
              </form>
              <ActionForm action={markMissingAsAbsent} confirmMessage="Mark everyone without a record on this day as absent?" className="ms-auto">
                <input type="hidden" name="date" value={selectedDateText} />
                <SubmitButton variant="outline"><UserXIcon /> Mark missing as absent</SubmitButton>
              </ActionForm>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Check in</TableHead>
                  <TableHead>Check out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailySheet.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <p className="font-medium">{getFullName(row)}</p>
                      <p className="text-muted-foreground font-mono text-xs">{row.employeeNumber}</p>
                    </TableCell>
                    <TableCell>{formatTime(row.attendance?.checkInAt)}</TableCell>
                    <TableCell>{formatTime(row.attendance?.checkOutAt)}</TableCell>
                    <TableCell>
                      {row.attendance ? <StatusBadge status={row.attendance.status} /> : <span className="text-muted-foreground text-xs">No record</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-48 truncate text-xs">{row.attendance?.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Add or fix a record</CardTitle>
            <CardDescription>Saving replaces the employee&apos;s record for that day.</CardDescription>
          </CardHeader>
          <CardContent>
            <ManualAttendanceForm employeeOptions={employeeOptions} selectedDate={selectedDateText} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
