import { notFound } from "next/navigation";
import { CandidateStage } from "@prisma/client";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionForm } from "@/components/shared/action-form";
import { SubmitButton } from "@/components/shared/submit-button";
import { requirePermission } from "@/lib/auth";
import { formatEnum } from "@/lib/format";
import { getJobPostingWithCandidates } from "@/features/recruitment/queries";
import { changeJobStatus } from "@/features/recruitment/actions";
import { CandidateCard } from "@/features/recruitment/components/candidate-card";

export default async function JobPipelinePage({ params }: PageProps<"/recruitment/[jobPostingId]">) {
  await requirePermission("recruitment:manage");
  const { jobPostingId } = await params;

  const jobPosting = await getJobPostingWithCandidates(jobPostingId);
  if (!jobPosting) notFound();

  const isOpen = jobPosting.status === "OPEN";

  return (
    <>
      <PageHeader
        title={jobPosting.title}
        description={jobPosting.location ?? undefined}
        actions={
          <>
            <StatusBadge status={jobPosting.status} />
            <ActionForm action={changeJobStatus}>
              <input type="hidden" name="jobPostingId" value={jobPosting.id} />
              <input type="hidden" name="status" value={isOpen ? "CLOSED" : "OPEN"} />
              <SubmitButton variant="outline">{isOpen ? "Close job" : "Reopen job"}</SubmitButton>
            </ActionForm>
          </>
        }
      />

      {/* One column per hiring stage (a simple Kanban board). */}
      <div className="grid gap-4 overflow-x-auto pb-4 md:grid-cols-3 xl:grid-cols-6">
        {Object.values(CandidateStage).map((stage) => {
          const candidatesInStage = jobPosting.candidates.filter((candidate) => candidate.stage === stage);
          return (
            <div key={stage} className="bg-muted/50 min-w-56 rounded-xl p-3">
              <p className="mb-3 text-sm font-medium">
                {formatEnum(stage)} <span className="text-muted-foreground">({candidatesInStage.length})</span>
              </p>
              <div className="grid gap-3">
                {candidatesInStage.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
