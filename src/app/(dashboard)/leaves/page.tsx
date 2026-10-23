import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionForm } from "@/components/shared/action-form";
import { SubmitButton } from "@/components/shared/submit-button";
import { requireEmployeeProfile } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getLeaveBalanceSummary, getLeaveTypes, getMyLeaveRequests } from "@/features/leaves/queries";
import { cancelLeaveRequest } from "@/features/leaves/actions";
import { LeaveBalanceCards } from "@/features/leaves/components/leave-balance-cards";
import { LeaveRequestForm } from "@/features/leaves/components/leave-request-form";

export default async function MyLeavesPage() {
  const { employee } = await requireEmployeeProfile();
  const currentYear = new Date().getFullYear();

  const [balances, leaveTypes, myLeaveRequests] = await Promise.all([
    getLeaveBalanceSummary(employee.id, currentYear),
    getLeaveTypes(),
    getMyLeaveRequests(employee.id),
  ]);

  return (
    <>
      <PageHeader title="My leaves" description={`Your leave balance for ${currentYear}. Weekends and holidays are not counted.`} />
      <div className="grid gap-6">
        <LeaveBalanceCards balances={balances} />

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader>
              <CardTitle>My requests</CardTitle>
            </CardHeader>
            <CardContent>
              {myLeaveRequests.length === 0 ? (
                <EmptyState message="You have not requested any leave yet." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myLeaveRequests.map((leaveRequest) => (
                      <TableRow key={leaveRequest.id}>
                        <TableCell>{leaveRequest.leaveType.name}</TableCell>
                        <TableCell>{formatDate(leaveRequest.startDate)}</TableCell>
                        <TableCell>{formatDate(leaveRequest.endDate)}</TableCell>
                        <TableCell>{leaveRequest.days}</TableCell>
                        <TableCell>
                          <StatusBadge status={leaveRequest.status} />
                          {leaveRequest.decisionNote && (
                            <p className="text-muted-foreground mt-1 text-xs">{leaveRequest.decisionNote}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-end">
                          {leaveRequest.status === "PENDING" && (
                            <ActionForm action={cancelLeaveRequest} confirmMessage="Cancel this leave request?">
                              <input type="hidden" name="leaveRequestId" value={leaveRequest.id} />
                              <SubmitButton size="sm" variant="ghost">Cancel</SubmitButton>
                            </ActionForm>
                          )}
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
              <CardTitle>Request leave</CardTitle>
            </CardHeader>
            <CardContent>
              <LeaveRequestForm leaveTypes={leaveTypes} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
