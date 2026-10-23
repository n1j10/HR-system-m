import type { Attendance } from "@prisma/client";
import { LogInIcon, LogOutIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionForm } from "@/components/shared/action-form";
import { SubmitButton } from "@/components/shared/submit-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatTime } from "@/lib/format";
import { checkIn, checkOut } from "@/features/attendance/actions";

export function CheckInCard({ todayAttendance }: { todayAttendance: Attendance | null }) {
  const hasCheckedIn = Boolean(todayAttendance?.checkInAt);
  const hasCheckedOut = Boolean(todayAttendance?.checkOutAt);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today</CardTitle>
        <CardDescription>
          {new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-6">
        <div className="text-sm">
          <p className="text-muted-foreground">Check in</p>
          <p className="text-lg font-semibold">{formatTime(todayAttendance?.checkInAt)}</p>
        </div>
        <div className="text-sm">
          <p className="text-muted-foreground">Check out</p>
          <p className="text-lg font-semibold">{formatTime(todayAttendance?.checkOutAt)}</p>
        </div>
        {todayAttendance && <StatusBadge status={todayAttendance.status} />}

        <div className="ms-auto">
          {!hasCheckedIn && (
            <ActionForm action={checkIn}>
              <SubmitButton size="lg"><LogInIcon /> Check in</SubmitButton>
            </ActionForm>
          )}
          {hasCheckedIn && !hasCheckedOut && (
            <ActionForm action={checkOut}>
              <SubmitButton size="lg" variant="secondary"><LogOutIcon /> Check out</SubmitButton>
            </ActionForm>
          )}
          {hasCheckedOut && <p className="text-muted-foreground text-sm">You are done for today.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
