import Link from "next/link";
import { SearchXIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <SearchXIcon className="text-muted-foreground size-10" />
      <h2 className="text-lg font-semibold">Not found</h2>
      <p className="text-muted-foreground text-sm">This record does not exist or was archived.</p>
      <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>Back to dashboard</Link>
    </div>
  );
}
