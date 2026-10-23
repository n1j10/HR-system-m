"use client";

import { useState } from "react";
import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarLinks } from "@/components/layout/sidebar-links";

export function MobileSidebar({ allowedHrefs }: { allowedHrefs: string[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />}>
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 overflow-y-auto p-4">
        <SheetHeader className="p-0 pb-4">
          <SheetTitle>HR System</SheetTitle>
        </SheetHeader>
        <SidebarLinks allowedHrefs={allowedHrefs} onLinkClick={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
