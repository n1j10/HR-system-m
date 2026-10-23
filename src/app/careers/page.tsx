import Link from "next/link";
import { MapPinIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { getOpenJobPostings } from "@/features/recruitment/queries";

// Always load fresh jobs from the database instead of building this page once.
export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const openJobs = await getOpenJobPostings();

  return (
    <>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">Join our team</h1>
      <p className="text-muted-foreground mb-8">Open positions you can apply for today.</p>

      {openJobs.length === 0 ? (
        <EmptyState message="There are no open positions right now. Check again soon!" />
      ) : (
        <div className="grid gap-4">
          {openJobs.map((job) => (
            <Link key={job.id} href={`/careers/${job.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                  {job.location && (
                    <CardDescription className="flex items-center gap-1">
                      <MapPinIcon className="size-3.5" /> {job.location}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2 text-sm">{job.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
