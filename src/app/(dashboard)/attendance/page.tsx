import Link from "next/link";
import { BarChart3Icon, ClipboardListIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { requireEmployeeProfile } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getToday } from "@/lib/dates";
import { getAttendanceOfDay, getRecentAttendance } from "@/features/attendance/queries";
import { CheckInCard } from "@/features/attendance/components/check-in-card";
import { AttendanceTable } from "@/features/attendance/components/attendance-table";

export default async function MyAttendancePage() {
  const { user, employee } = await requireEmployeeProfile();

  const [todayAttendance, recentAttendance] = await Promise.all([
    getAttendanceOfDay(employee.id, getToday()),
    getRecentAttendance(employee.id),
  ]);

  const canManageAttendance = hasPermission(user.role, "attendance:manage");

  return (
    <>
      <PageHeader
        title="Attendance"
        description="Check in when you arrive and check out when you leave."
        actions={
          canManageAttendance && (
            <>
              <Link href="/attendance/manage" className={buttonVariants({ variant: "outline" })}>
                <ClipboardListIcon /> Daily sheet
              </Link>
              <Link href="/attendance/report" className={buttonVariants({ variant: "outline" })}>
                <BarChart3Icon /> Monthly report
              </Link>
            </>
          )
        }
      />
      <div className="grid gap-6">
        <CheckInCard todayAttendance={todayAttendance} />
        <Card>
          <CardHeader>
            <CardTitle>My last 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceTable attendances={recentAttendance} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
