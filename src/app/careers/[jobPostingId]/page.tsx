import { notFound } from "next/navigation";
import { MapPinIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActionForm } from "@/components/shared/action-form";
import { FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { getOpenJobPosting } from "@/features/recruitment/queries";
import { applyForJob } from "@/features/recruitment/actions";

export default async function JobDetailsPage({ params }: PageProps<"/careers/[jobPostingId]">) {
  const { jobPostingId } = await params;
  const job = await getOpenJobPosting(jobPostingId);
  if (!job) notFound();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{job.title}</h1>
        {job.location && (
          <p className="text-muted-foreground mt-1 flex items-center gap-1">
            <MapPinIcon className="size-4" /> {job.location}
          </p>
        )}
      </div>
      <p className="whitespace-pre-line">{job.description}</p>

      <Card>
        <CardHeader>
          <CardTitle>Apply now</CardTitle>
        </CardHeader>
        <CardContent>
          <ActionForm action={applyForJob} resetOnSuccess className="grid gap-4">
            <input type="hidden" name="jobPostingId" value={job.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Full name" htmlFor="fullName">
                <Input id="fullName" name="fullName" required />
              </FormField>
              <FormField label="Email" htmlFor="email">
                <Input id="email" name="email" type="email" required />
              </FormField>
              <FormField label="Phone" htmlFor="phone">
                <Input id="phone" name="phone" />
              </FormField>
              <FormField label="Resume link" htmlFor="resumeUrl" hint="Google Drive, Dropbox or LinkedIn link">
                <Input id="resumeUrl" name="resumeUrl" type="url" placeholder="https://..." required />
              </FormField>
            </div>
            <FormField label="Why do you want this job?" htmlFor="coverLetter">
              <Textarea id="coverLetter" name="coverLetter" rows={4} />
            </FormField>
            <SubmitButton>Send application</SubmitButton>
          </ActionForm>
        </CardContent>
      </Card>
    </div>
  );
}
