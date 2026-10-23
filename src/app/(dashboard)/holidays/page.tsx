import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ActionForm } from "@/components/shared/action-form";
import { FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { DeleteButton } from "@/components/shared/delete-button";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { formatDate } from "@/lib/format";
import { WEEKEND_DAYS } from "@/lib/dates";
import { getHolidaysOfYear } from "@/features/holidays/queries";
import { createHoliday, deleteHoliday } from "@/features/holidays/actions";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function HolidaysPage() {
  const currentUser = await getCurrentUser();
  const currentYear = new Date().getFullYear();
  const holidays = await getHolidaysOfYear(currentYear);
  const canManageHolidays = hasPermission(currentUser.role, "holiday:manage");

  const weekendNames = WEEKEND_DAYS.map((dayNumber) => DAY_NAMES[dayNumber]).join(" & ");

  return (
    <>
      <PageHeader title={`Official holidays ${currentYear}`} description={`Weekly days off: ${weekendNames}. Holidays are not counted as leave days.`} />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent>
            {holidays.length === 0 ? (
              <EmptyState message="No holidays added for this year." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Holiday</TableHead>
                    {canManageHolidays && <TableHead className="w-12" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell>{formatDate(holiday.date)}</TableCell>
                      <TableCell>{DAY_NAMES[holiday.date.getUTCDay()]}</TableCell>
                      <TableCell className="font-medium">{holiday.name}</TableCell>
                      {canManageHolidays && (
                        <TableCell>
                          <DeleteButton action={deleteHoliday} idFieldName="holidayId" idValue={holiday.id} />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {canManageHolidays && (
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Add holiday</CardTitle>
            </CardHeader>
            <CardContent>
              <ActionForm action={createHoliday} resetOnSuccess className="grid gap-4">
                <FormField label="Name" htmlFor="name">
                  <Input id="name" name="name" required />
                </FormField>
                <FormField label="Date" htmlFor="date" hint="Religious holidays depend on the moon, so add them when announced.">
                  <Input id="date" name="date" type="date" required />
                </FormField>
                <SubmitButton>Add holiday</SubmitButton>
              </ActionForm>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
