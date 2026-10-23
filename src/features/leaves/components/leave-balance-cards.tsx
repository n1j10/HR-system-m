import { Card, CardContent } from "@/components/ui/card";
import type { getLeaveBalanceSummary } from "@/features/leaves/queries";

type LeaveBalanceSummary = Awaited<ReturnType<typeof getLeaveBalanceSummary>>;

export function LeaveBalanceCards({ balances }: { balances: LeaveBalanceSummary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {balances.map((balance) => (
        <Card key={balance.leaveType.id}>
          <CardContent>
            <p className="text-muted-foreground text-sm">{balance.leaveType.name}</p>
            <p className="mt-1 text-2xl font-semibold">
              {balance.remainingDays}
              <span className="text-muted-foreground text-sm font-normal"> / {balance.totalDays} days left</span>
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Used {balance.usedDays} · Pending {balance.pendingDays}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
