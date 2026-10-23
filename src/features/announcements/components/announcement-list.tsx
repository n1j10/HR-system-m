import { EmptyState } from "@/components/shared/empty-state";
import { DeleteButton } from "@/components/shared/delete-button";
import { formatDateTime } from "@/lib/format";
import type { getLatestAnnouncements } from "@/features/announcements/queries";
import { deleteAnnouncement } from "@/features/announcements/actions";

type Announcements = Awaited<ReturnType<typeof getLatestAnnouncements>>;

export function AnnouncementList({ announcements, canDelete = false }: { announcements: Announcements; canDelete?: boolean }) {
  if (announcements.length === 0) return <EmptyState message="No announcements yet." />;

  return (
    <ul className="grid gap-4">
      {announcements.map((announcement) => (
        <li key={announcement.id} className="border-b pb-4 last:border-0 last:pb-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium">{announcement.title}</p>
            {canDelete && <DeleteButton action={deleteAnnouncement} idFieldName="announcementId" idValue={announcement.id} />}
          </div>
          <p className="mt-1 text-sm whitespace-pre-line">{announcement.body}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {announcement.createdBy.name ?? announcement.createdBy.email} · {formatDateTime(announcement.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
