import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { requirePermission } from "@/lib/auth";
import { formatDate, getFullName } from "@/lib/format";
import { getPendingLeaveRequestsToApprove, getUpcomingTeamLeaves } from "@/features/leaves/queries";
import { LeaveDecisionButtons } from "@/features/leaves/components/leave-decision-buttons";

export default async function LeaveApprovalsPage() {
  const currentUser = await requirePermission("leave:approve");

  const [pendingRequests, upcomingLeaves] = await Promise.all([
    getPendingLeaveRequestsToApprove(currentUser),
    getUpcomingTeamLeaves(currentUser),
  ]);

  return (
    <>
      <PageHeader title="Leave approvals" description="Approve or reject leave requests from your team." />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Waiting for you ({pendingRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <EmptyState message="Nothing to approve. You are all caught up!" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((leaveRequest) => (
                    <TableRow key={leaveRequest.id}>
                      <TableCell className="font-medium">{getFullName(leaveRequest.employee)}</TableCell>
                      <TableCell>{leaveRequest.leaveType.name}</TableCell>
                      <TableCell>
                        {formatDate(leaveRequest.startDate)} → {formatDate(leaveRequest.endDate)}
                      </TableCell>
                      <TableCell>{leaveRequest.days}</TableCell>
                      <TableCell className="max-w-48 text-xs">
                        {leaveRequest.reason}
                        {leaveRequest.attachmentUrl && (
                          <a href={leaveRequest.attachmentUrl} target="_blank" rel="noreferrer" className="block underline">
                            View attachment
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        <LeaveDecisionButtons leaveRequestId={leaveRequest.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Who is off in the next 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingLeaves.length === 0 ? (
              <EmptyState message="Nobody has an approved leave coming up." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingLeaves.map((leaveRequest) => (
                    <TableRow key={leaveRequest.id}>
                      <TableCell className="font-medium">{getFullName(leaveRequest.employee)}</TableCell>
                      <TableCell>{leaveRequest.leaveType.name}</TableCell>
                      <TableCell>{formatDate(leaveRequest.startDate)}</TableCell>
                      <TableCell>{formatDate(leaveRequest.endDate)}</TableCell>
                      <TableCell>{leaveRequest.days}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
