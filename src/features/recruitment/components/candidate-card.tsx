import type { Candidate } from "@prisma/client";
import { CandidateStage } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ActionForm } from "@/components/shared/action-form";
import { EnumSelect } from "@/components/shared/enum-select";
import { SubmitButton } from "@/components/shared/submit-button";
import { formatDate } from "@/lib/format";
import { moveCandidateToStage } from "@/features/recruitment/actions";

export function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <Card size="sm">
      <CardContent className="grid gap-2 text-sm">
        <div>
          <p className="font-medium">{candidate.fullName}</p>
          <p className="text-muted-foreground text-xs">{candidate.email}</p>
          {candidate.phone && <p className="text-muted-foreground text-xs">{candidate.phone}</p>}
          <p className="text-muted-foreground text-xs">Applied {formatDate(candidate.createdAt)}</p>
        </div>
        {candidate.resumeUrl && (
          <a href={candidate.resumeUrl} target="_blank" rel="noreferrer" className="text-xs underline">
            Open resume
          </a>
        )}
        {candidate.coverLetter && <p className="bg-muted rounded p-2 text-xs">{candidate.coverLetter}</p>}

        <ActionForm action={moveCandidateToStage} className="grid gap-1.5">
          <input type="hidden" name="candidateId" value={candidate.id} />
          <Input name="notes" defaultValue={candidate.notes ?? ""} placeholder="Notes" className="h-7 text-xs" />
          <div className="flex gap-1">
            <EnumSelect id={`stage-${candidate.id}`} name="stage" values={Object.values(CandidateStage)} defaultValue={candidate.stage} className="flex-1" />
            <SubmitButton size="sm" variant="outline">Move</SubmitButton>
          </div>
        </ActionForm>
      </CardContent>
    </Card>
  );
}
