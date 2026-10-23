import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  /** The current search params, so filters stay when changing page. */
  searchParams: Record<string, string | undefined>;
  basePath: string;
};

export function Pagination({ currentPage, totalPages, searchParams, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildPageUrl(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <div className="flex items-center justify-end gap-2 pt-4 text-sm">
      <span className="text-muted-foreground me-2">
        Page {currentPage} of {totalPages}
      </span>
      <Link
        href={buildPageUrl(currentPage - 1)}
        aria-disabled={!hasPreviousPage}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), !hasPreviousPage && "pointer-events-none opacity-50")}
      >
        <ChevronLeftIcon /> Previous
      </Link>
      <Link
        href={buildPageUrl(currentPage + 1)}
        aria-disabled={!hasNextPage}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), !hasNextPage && "pointer-events-none opacity-50")}
      >
        Next <ChevronRightIcon />
      </Link>
    </div>
  );
}
