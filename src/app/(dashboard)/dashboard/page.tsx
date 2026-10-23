import Link from "next/link";
import { CalendarCheckIcon, CalendarOffIcon, FileWarningIcon, UserCheckIcon, UserPlusIcon, UsersIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";
import { canSeeAllEmployees, hasPermission } from "@/lib/permissions";
import { getToday } from "@/lib/dates";
import { formatDate, formatTime, getFullName } from "@/lib/format";
import { getCompanyStats, getHeadcountByDepartment, getProbationsEndingSoon } from "@/features/dashboard/queries";
import { countPendingLeaveRequestsToApprove, getLeaveBalanceSummary } from "@/features/leaves/queries";
import { countDocumentsExpiringSoon } from "@/features/documents/queries";
import { getAttendanceOfDay } from "@/features/attendance/queries";
import { getLatestAnnouncements } from "@/features/announcements/queries";
import { AnnouncementList } from "@/features/announcements/components/announcement-list";

/** Today's check-in and leave balance of the signed-in employee. */
async function MyDaySection({ employeeId }: { employeeId: string }) {
  const [todayAttendance, leaveBalances] = await Promise.all([
    getAttendanceOfDay(employeeId, getToday()),
    getLeaveBalanceSummary(employeeId, new Date().getFullYear()),
  ]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Today</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between text-sm">
          {todayAttendance ? (
            <>
              <span>Checked in at {formatTime(todayAttendance.checkInAt)}</span>
              <StatusBadge status={todayAttendance.status} />
            </>
          ) : (
            <Link href="/attendance" className="underline">You have not checked in yet → Check in</Link>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Leave balance</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {leaveBalances.slice(0, 3).map((balance) => (
            <span key={balance.leaveType.id}>
              {balance.leaveType.name}: <strong>{balance.remainingDays}</strong> days
            </span>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/** Company-wide numbers, only for people who can see everyone. */
async function CompanyOverviewSection({ user }: { user: CurrentUser }) {
  const canManageDocuments = hasPermission(user.role, "document:manage");

  const [stats, headcountByDepartment, probationsEndingSoon, expiringDocumentCount] = await Promise.all([
    getCompanyStats(),
    getHeadcountByDepartment(),
    getProbationsEndingSoon(),
    canManageDocuments ? countDocumentsExpiringSoon() : Promise.resolve(0),
  ]);

  const biggestDepartmentSize = Math.max(1, ...headcountByDepartment.map((department) => department.employeeCount));

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active employees" value={stats.totalEmployees} icon={UsersIcon} />
        <StatCard label="Present today" value={stats.presentToday} icon={UserCheckIcon} />
        <StatCard label="On leave today" value={stats.onLeaveToday} icon={CalendarOffIcon} />
        <StatCard label="New hires this month" value={stats.newHiresThisMonth} icon={UserPlusIcon} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Employees per department</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {headcountByDepartment.length === 0 && <EmptyState message="No departments yet." />}
            {headcountByDepartment.map((department) => (
              <div key={department.id} className="grid gap-1 text-sm">
                <div className="flex justify-between">
                  <span>{department.name}</span>
                  <span className="text-muted-foreground">{department.employeeCount}</span>
                </div>
                <div className="bg-muted h-2 overflow-hidden rounded-full">
                  <div className="bg-primary h-full" style={{ width: `${(department.employeeCount / biggestDepartmentSize) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {canManageDocuments && expiringDocumentCount > 0 && (
              <Link href="/documents" className="flex items-center gap-2 underline">
                <FileWarningIcon className="text-destructive size-4" />
                {expiringDocumentCount} document(s) expired or expiring soon
              </Link>
            )}
            {probationsEndingSoon.map((employee) => (
              <Link key={employee.id} href={`/employees/${employee.id}`} className="hover:underline">
                Probation of <strong>{getFullName(employee)}</strong> ends {formatDate(employee.probationEndDate)}
              </Link>
            ))}
            {expiringDocumentCount === 0 && probationsEndingSoon.length === 0 && (
              <p className="text-muted-foreground">Nothing needs your attention right now.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  const canApproveLeaves = hasPermission(currentUser.role, "leave:approve");

  const [announcements, pendingApprovalCount] = await Promise.all([
    getLatestAnnouncements(3),
    canApproveLeaves ? countPendingLeaveRequestsToApprove(currentUser) : Promise.resolve(0),
  ]);

  const firstName = currentUser.employee?.firstName ?? currentUser.name ?? "there";

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {firstName} 👋</h1>
        <p className="text-muted-foreground text-sm">Here is what is happening today.</p>
      </div>

      {!currentUser.employee && (
        <Card>
          <CardContent className="text-sm">
            Your account is not linked to an employee record yet, so personal pages (attendance, leaves, payslips) are not available.
          </CardContent>
        </Card>
      )}

      {pendingApprovalCount > 0 && (
        <Link href="/leaves/approvals">
          <Card className="border-primary hover:bg-muted/50 transition-colors">
            <CardContent className="flex items-center gap-3 text-sm">
              <CalendarCheckIcon className="size-5" />
              You have <strong>{pendingApprovalCount}</strong> leave request(s) waiting for your approval.
            </CardContent>
          </Card>
        </Link>
      )}

      {currentUser.employee && <MyDaySection employeeId={currentUser.employee.id} />}
      {canSeeAllEmployees(currentUser.role) && <CompanyOverviewSection user={currentUser} />}

      <Card>
        <CardHeader>
          <CardTitle>
            <Link href="/announcements" className="hover:underline">Latest announcements</Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnnouncementList announcements={announcements} />
        </CardContent>
      </Card>
    </div>
  );
}
