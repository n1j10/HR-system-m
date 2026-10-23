"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { NAVIGATION_SECTIONS } from "@/components/layout/navigation";

type SidebarLinksProps = {
  /** hrefs the current user is allowed to see (filtered on the server). */
  allowedHrefs: string[];
  onLinkClick?: () => void;
};

export function SidebarLinks({ allowedHrefs, onLinkClick }: SidebarLinksProps) {
  const pathname = usePathname();

  // The most specific matching link is the active one,
  // so "/leaves/approvals" does not also highlight "/leaves".
  const activeHref = allowedHrefs
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((first, second) => second.length - first.length)[0];

  return (
    <nav className="flex flex-col gap-5">
      {NAVIGATION_SECTIONS.map((section) => {
        const visibleItems = section.items.filter((item) => allowedHrefs.includes(item.href));
        if (visibleItems.length === 0) return null;

        return (
          <div key={section.title}>
            <p className="text-muted-foreground mb-1 px-3 text-xs font-medium uppercase">{section.title}</p>
            <ul className="flex flex-col gap-0.5">
              {visibleItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onLinkClick}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                      item.href === activeHref
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/80 hover:bg-muted"
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
