import type { PerformanceReview } from "@prisma/client";
import { StarIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, getFullName } from "@/lib/format";

type ReviewWithNames = PerformanceReview & {
  employee?: { firstName: string; lastName: string };
  reviewer?: { name: string | null; email: string };
};

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="flex" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((starNumber) => (
        <StarIcon key={starNumber} className={starNumber <= rating ? "size-4 fill-amber-400 text-amber-400" : "text-muted-foreground size-4"} />
      ))}
    </span>
  );
}

export function ReviewList({ reviews }: { reviews: ReviewWithNames[] }) {
  if (reviews.length === 0) return <EmptyState message="No reviews yet." />;

  return (
    <ul className="grid gap-3">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-lg border p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">
              {review.employee ? `${getFullName(review.employee)} · ` : ""}
              {review.period}
            </p>
            <RatingStars rating={review.rating} />
          </div>
          {review.comments && <p className="mt-1 text-sm">{review.comments}</p>}
          <p className="text-muted-foreground mt-1 text-xs">
            {review.reviewer && `By ${review.reviewer.name ?? review.reviewer.email} · `}
            {formatDate(review.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
