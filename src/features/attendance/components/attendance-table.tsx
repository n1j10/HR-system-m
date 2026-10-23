import type { Attendance } from "@prisma/client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatTime } from "@/lib/format";

export function AttendanceTable({ attendances }: { attendances: Attendance[] }) {
  if (attendances.length === 0) return <EmptyState message="No attendance records yet." />;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Check in</TableHead>
          <TableHead>Check out</TableHead>
          <TableHead>Late (min)</TableHead>
          <TableHead>Overtime (min)</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attendances.map((attendance) => (
          <TableRow key={attendance.id}>
            <TableCell>{formatDate(attendance.date)}</TableCell>
            <TableCell>{formatTime(attendance.checkInAt)}</TableCell>
            <TableCell>{formatTime(attendance.checkOutAt)}</TableCell>
            <TableCell>{attendance.lateMinutes}</TableCell>
            <TableCell>{attendance.overtimeMinutes}</TableCell>
            <TableCell><StatusBadge status={attendance.status} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
