import { prisma } from "@/lib/prisma";

export async function getJobPostingsWithCandidateCount() {
  return prisma.jobPosting.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { candidates: true } } },
  });
}

export async function getJobPostingWithCandidates(jobPostingId: string) {
  return prisma.jobPosting.findUnique({
    where: { id: jobPostingId },
    include: { candidates: { orderBy: { createdAt: "desc" } } },
  });
}

export async function getOpenJobPostings() {
  return prisma.jobPosting.findMany({ where: { status: "OPEN" }, orderBy: { createdAt: "desc" } });
}

export async function getOpenJobPosting(jobPostingId: string) {
  return prisma.jobPosting.findFirst({ where: { id: jobPostingId, status: "OPEN" } });
}
