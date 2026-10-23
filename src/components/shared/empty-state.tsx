import { InboxIcon } from "lucide-react";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-muted-foreground flex flex-col items-center gap-2 py-10 text-sm">
      <InboxIcon className="size-8 opacity-50" />
      {message}
    </div>
  );
}
