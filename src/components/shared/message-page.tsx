import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

type MessagePageProps = {
  icon: LucideIcon;
  title: string;
  message: string;
};

/** A centered full-page message, used for "no access" style pages. */
export function MessagePage({ icon: Icon, title, message }: MessagePageProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <Icon className="text-muted-foreground size-10" />
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-muted-foreground max-w-md text-sm">{message}</p>
      <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
        Back to dashboard
      </Link>
    </main>
  );
}
