import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ActionForm } from "@/components/shared/action-form";
import { FormField } from "@/components/shared/form-field";
import { OptionSelect, toSelectOptions } from "@/components/shared/option-select";
import { SubmitButton } from "@/components/shared/submit-button";
import { DeleteButton } from "@/components/shared/delete-button";
import { requirePermission } from "@/lib/auth";
import { addDays, getToday } from "@/lib/dates";
import { formatDate, getFullName } from "@/lib/format";
import { DOCUMENT_CATEGORIES } from "@/features/documents/schemas";
import { EXPIRY_WARNING_DAYS, getAllDocuments } from "@/features/documents/queries";
import { createDocument, deleteDocument } from "@/features/documents/actions";
import { getEmployeeSelectOptions } from "@/features/employees/select-options";

function ExpiryBadge({ expiresAt }: { expiresAt: Date | null }) {
  if (!expiresAt) return null;

  const today = getToday();
  if (expiresAt < today) return <Badge variant="destructive">Expired</Badge>;
  if (expiresAt <= addDays(today, EXPIRY_WARNING_DAYS)) return <Badge variant="secondary">Expires soon</Badge>;
  return null;
}

export default async function DocumentsPage() {
  await requirePermission("document:manage");
  const [documents, employeeOptions] = await Promise.all([getAllDocuments(), getEmployeeSelectOptions()]);

  return (
    <>
      <PageHeader title="Documents" description={`Employee documents. Ones expiring in the next ${EXPIRY_WARNING_DAYS} days are flagged.`} />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent>
            {documents.length === 0 ? (
              <EmptyState message="No documents yet." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <a href={document.fileUrl} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                          {document.title}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Link href={`/employees/${document.employee.id}`} className="hover:underline">
                          {getFullName(document.employee)}
                        </Link>
                      </TableCell>
                      <TableCell>{document.category}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        {formatDate(document.expiresAt)} <ExpiryBadge expiresAt={document.expiresAt} />
                      </TableCell>
                      <TableCell>
                        <DeleteButton action={deleteDocument} idFieldName="documentId" idValue={document.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Add document</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm action={createDocument} resetOnSuccess className="grid gap-4">
              <FormField label="Employee" htmlFor="employeeId">
                <OptionSelect id="employeeId" name="employeeId" options={employeeOptions} placeholder="Select an employee" required />
              </FormField>
              <FormField label="Title" htmlFor="title">
                <Input id="title" name="title" placeholder="e.g. Passport copy" required />
              </FormField>
              <FormField label="Category" htmlFor="category">
                <OptionSelect id="category" name="category" options={toSelectOptions(DOCUMENT_CATEGORIES)} required />
              </FormField>
              <FormField label="File link" htmlFor="fileUrl" hint="Upload the file to your company drive and paste the link.">
                <Input id="fileUrl" name="fileUrl" type="url" placeholder="https://..." required />
              </FormField>
              <FormField label="Expiry date" htmlFor="expiresAt">
                <Input id="expiresAt" name="expiresAt" type="date" />
              </FormField>
              <SubmitButton>Add document</SubmitButton>
            </ActionForm>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
