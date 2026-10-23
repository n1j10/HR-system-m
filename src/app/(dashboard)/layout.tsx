import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { UsersIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { NAVIGATION_SECTIONS } from "@/components/layout/navigation";
import { SidebarLinks } from "@/components/layout/sidebar-links";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { formatEnum } from "@/lib/format";

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  // Decide on the server which links this user can see.
  const allowedHrefs = NAVIGATION_SECTIONS.flatMap((section) => section.items)
    .filter((item) => !item.permission || hasPermission(user.role, item.permission))
    .map((item) => item.href);

  return (
    <div className="flex min-h-screen">
      <aside className="bg-sidebar sticky top-0 hidden h-screen w-60 shrink-0 overflow-y-auto border-e p-4 md:block">
        <Link href="/dashboard" className="mb-6 flex items-center gap-2 px-3 font-semibold">
          <UsersIcon className="size-5" /> HR System
        </Link>
        <SidebarLinks allowedHrefs={allowedHrefs} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/80 sticky top-0 z-10 flex h-14 items-center gap-3 border-b px-4 backdrop-blur">
          <MobileSidebar allowedHrefs={allowedHrefs} />
          <div className="flex-1" />
          <Badge variant="outline">{formatEnum(user.role)}</Badge>
          <span className="text-muted-foreground hidden text-sm sm:inline">{user.name ?? user.email}</span>
          <UserButton />
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
