import { Badge } from "@/components/ui/badge";
import { formatEnum } from "@/lib/format";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

// Pick a color for each status value. Anything not listed is "outline".
const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  ACTIVE: "default",
  APPROVED: "default",
  PRESENT: "default",
  PAID: "default",
  OPEN: "default",
  HIRED: "default",
  GOOD: "default",
  COMPLETED: "default",
  PENDING: "secondary",
  PROBATION: "secondary",
  ON_LEAVE: "secondary",
  LEAVE: "secondary",
  DRAFT: "secondary",
  REMOTE: "secondary",
  IN_PROGRESS: "secondary",
  MAINTENANCE: "secondary",
  LATE: "destructive",
  ABSENT: "destructive",
  REJECTED: "destructive",
  TERMINATED: "destructive",
  SUSPENDED: "destructive",
  DAMAGED: "destructive",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={STATUS_VARIANTS[status] ?? "outline"}>{formatEnum(status)}</Badge>;
}
