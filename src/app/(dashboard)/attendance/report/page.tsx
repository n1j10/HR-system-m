import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { MonthPicker } from "@/components/shared/month-picker";
import { requirePermission } from "@/lib/auth";
import { MONTH_NAMES, getFullName } from "@/lib/format";
import { getMonthAndYear } from "@/lib/search-params";
import { getMonthlyAttendanceReport } from "@/features/attendance/queries";

export default async function AttendanceReportPage({ searchParams }: PageProps<"/attendance/report">) {
  await requirePermission("attendance:manage");
  const params = await searchParams;
  const { month, year } = getMonthAndYear(params.month, params.year);

  const reportRows = await getMonthlyAttendanceReport(month, year);

  return (
    <>
      <PageHeader title="Monthly attendance report" description={`${MONTH_NAMES[month - 1]} ${year}`} />
      <Card>
        <CardContent>
          <MonthPicker month={month} year={year} />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Late</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Leave</TableHead>
                <TableHead>Late (min)</TableHead>
                <TableHead>Overtime (min)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{getFullName(row)}</TableCell>
                  <TableCell>{row.department.name}</TableCell>
                  <TableCell>{row.presentDays}</TableCell>
                  <TableCell>{row.lateDays}</TableCell>
                  <TableCell className={row.absentDays > 0 ? "text-destructive font-medium" : ""}>{row.absentDays}</TableCell>
                  <TableCell>{row.leaveDays}</TableCell>
                  <TableCell>{row.totalLateMinutes}</TableCell>
                  <TableCell>{row.totalOvertimeMinutes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
