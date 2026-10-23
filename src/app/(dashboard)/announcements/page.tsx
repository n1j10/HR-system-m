import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { ActionForm } from "@/components/shared/action-form";
import { FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getLatestAnnouncements } from "@/features/announcements/queries";
import { createAnnouncement } from "@/features/announcements/actions";
import { AnnouncementList } from "@/features/announcements/components/announcement-list";

export default async function AnnouncementsPage() {
  const currentUser = await getCurrentUser();
  const announcements = await getLatestAnnouncements();
  const canManageAnnouncements = hasPermission(currentUser.role, "announcement:manage");

  return (
    <>
      <PageHeader title="Announcements" description="News from the company." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent>
            <AnnouncementList announcements={announcements} canDelete={canManageAnnouncements} />
          </CardContent>
        </Card>

        {canManageAnnouncements && (
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>New announcement</CardTitle>
            </CardHeader>
            <CardContent>
              <ActionForm action={createAnnouncement} resetOnSuccess className="grid gap-4">
                <FormField label="Title" htmlFor="title">
                  <Input id="title" name="title" required />
                </FormField>
                <FormField label="Message" htmlFor="body">
                  <Textarea id="body" name="body" rows={5} required />
                </FormField>
                <SubmitButton>Publish</SubmitButton>
              </ActionForm>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
