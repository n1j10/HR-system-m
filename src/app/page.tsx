import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { BriefcaseIcon, UsersIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="bg-primary text-primary-foreground rounded-xl p-3">
        <UsersIcon className="size-8" />
      </div>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">HR System</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          Employees, attendance, leaves, payroll and recruitment in one place.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/sign-in" className={buttonVariants({ size: "lg" })}>
          Sign in
        </Link>
        <Link href="/careers" className={buttonVariants({ size: "lg", variant: "outline" })}>
          <BriefcaseIcon /> Open jobs
        </Link>
      </div>
    </main>
  );
}
