import type { Goal } from "@prisma/client";

import { Input } from "@/components/ui/input";
import { ActionForm } from "@/components/shared/action-form";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { SubmitButton } from "@/components/shared/submit-button";
import { formatDate, getFullName } from "@/lib/format";
import { updateGoalProgress } from "@/features/performance/actions";

type GoalWithOptionalEmployee = Goal & { employee?: { firstName: string; lastName: string } };

export function GoalList({ goals }: { goals: GoalWithOptionalEmployee[] }) {
  if (goals.length === 0) return <EmptyState message="No goals yet." />;

  return (
    <ul className="grid gap-3">
      {goals.map((goal) => (
        <li key={goal.id} className="rounded-lg border p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium">{goal.title}</p>
              <p className="text-muted-foreground text-xs">
                {goal.employee && `${getFullName(goal.employee)} · `}Due {formatDate(goal.dueDate)}
              </p>
              {goal.description && <p className="mt-1 text-sm">{goal.description}</p>}
            </div>
            <StatusBadge status={goal.status} />
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
              <div className="bg-primary h-full" style={{ width: `${goal.progress}%` }} />
            </div>
            <ActionForm action={updateGoalProgress} className="flex items-center gap-1">
              <input type="hidden" name="goalId" value={goal.id} />
              <Input name="progress" type="number" min={0} max={100} defaultValue={goal.progress} className="h-7 w-16" aria-label="Progress %" />
              <span className="text-muted-foreground text-xs">%</span>
              <SubmitButton size="sm" variant="outline">Save</SubmitButton>
            </ActionForm>
          </div>
        </li>
      ))}
    </ul>
  );
}
