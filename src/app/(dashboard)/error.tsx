"use client";

import { TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <TriangleAlertIcon className="text-destructive size-10" />
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md text-sm">
        {process.env.NODE_ENV === "development" ? error.message : "Please try again. If it keeps happening, contact your administrator."}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
