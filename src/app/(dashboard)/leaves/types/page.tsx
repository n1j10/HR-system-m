import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { ActionForm } from "@/components/shared/action-form";
import { FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { DeleteButton } from "@/components/shared/delete-button";
import { requirePermission } from "@/lib/auth";
import { getLeaveTypes } from "@/features/leaves/queries";
import { createLeaveType, deleteLeaveType, updateLeaveTypeDays } from "@/features/leaves/actions";

export default async function LeaveTypesPage() {
  await requirePermission("leave:manage");
  const leaveTypes = await getLeaveTypes();

  return (
    <>
      <PageHeader title="Leave types" description="Set how many days each employee gets per year." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Attachment</TableHead>
                  <TableHead>Days per year</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveTypes.map((leaveType) => (
                  <TableRow key={leaveType.id}>
                    <TableCell className="font-medium">{leaveType.name}</TableCell>
                    <TableCell>{leaveType.isPaid ? "Yes" : "No"}</TableCell>
                    <TableCell>{leaveType.requiresAttachment ? "Required" : "—"}</TableCell>
                    <TableCell>
                      <ActionForm action={updateLeaveTypeDays} className="flex gap-1">
                        <input type="hidden" name="leaveTypeId" value={leaveType.id} />
                        <Input name="daysPerYear" type="number" min={0} max={365} defaultValue={leaveType.daysPerYear} className="h-7 w-20" />
                        <SubmitButton size="sm" variant="outline">Save</SubmitButton>
                      </ActionForm>
                    </TableCell>
                    <TableCell>
                      <DeleteButton action={deleteLeaveType} idFieldName="leaveTypeId" idValue={leaveType.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>New leave type</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm action={createLeaveType} resetOnSuccess className="grid gap-4">
              <FormField label="Name" htmlFor="name">
                <Input id="name" name="name" placeholder="e.g. Marriage leave" required />
              </FormField>
              <FormField label="Days per year" htmlFor="daysPerYear">
                <Input id="daysPerYear" name="daysPerYear" type="number" min={0} max={365} required />
              </FormField>
              <Label className="font-normal">
                <input type="checkbox" name="isPaid" defaultChecked /> Paid leave
              </Label>
              <Label className="font-normal">
                <input type="checkbox" name="requiresAttachment" /> Needs an attachment
              </Label>
              <SubmitButton>Add leave type</SubmitButton>
            </ActionForm>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
