import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionForm } from "@/components/shared/action-form";
import { FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { requirePermission } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getJobPostingsWithCandidateCount } from "@/features/recruitment/queries";
import { createJobPosting } from "@/features/recruitment/actions";

export default async function RecruitmentPage() {
  await requirePermission("recruitment:manage");
  const jobPostings = await getJobPostingsWithCandidateCount();

  return (
    <>
      <PageHeader
        title="Recruitment"
        description="Post jobs and follow candidates through the hiring steps."
        actions={
          <Link href="/careers" target="_blank" className={buttonVariants({ variant: "outline" })}>
            <ExternalLinkIcon /> Public careers page
          </Link>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent>
            {jobPostings.length === 0 ? (
              <EmptyState message="No jobs posted yet." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Candidates</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobPostings.map((jobPosting) => (
                    <TableRow key={jobPosting.id}>
                      <TableCell>
                        <Link href={`/recruitment/${jobPosting.id}`} className="font-medium hover:underline">
                          {jobPosting.title}
                        </Link>
                      </TableCell>
                      <TableCell>{jobPosting.location ?? "—"}</TableCell>
                      <TableCell>{jobPosting._count.candidates}</TableCell>
                      <TableCell>{formatDate(jobPosting.createdAt)}</TableCell>
                      <TableCell><StatusBadge status={jobPosting.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Post a job</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm action={createJobPosting} className="grid gap-4">
              <FormField label="Title" htmlFor="title">
                <Input id="title" name="title" required />
              </FormField>
              <FormField label="Location" htmlFor="location">
                <Input id="location" name="location" placeholder="e.g. Baghdad / Remote" />
              </FormField>
              <FormField label="Description & requirements" htmlFor="description">
                <Textarea id="description" name="description" rows={6} required />
              </FormField>
              <SubmitButton>Post job</SubmitButton>
            </ActionForm>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
