import { Loader2Icon } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex justify-center py-20">
      <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
    </div>
  );
}
