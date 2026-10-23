import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { OptionSelect, toSelectOptions } from "@/components/shared/option-select";
import { requirePermission } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { getPageNumber, getSearchParam } from "@/lib/search-params";
import { getAuditLogFilterOptions, getAuditLogs } from "@/features/audit-log/queries";

export default async function AuditLogPage({ searchParams }: PageProps<"/audit-log">) {
  await requirePermission("audit:read");
  const params = await searchParams;

  const filters = { entity: getSearchParam(params.entity), action: getSearchParam(params.action) };
  const currentPage = getPageNumber(params.page);

  const [{ auditLogs, totalPages }, filterOptions] = await Promise.all([
    getAuditLogs({ ...filters, page: currentPage }),
    getAuditLogFilterOptions(),
  ]);

  return (
    <>
      <PageHeader title="Audit log" description="Every important change: who did it and when. This log cannot be edited." />
      <Card>
        <CardContent>
          <form method="GET" className="mb-4 flex flex-wrap gap-2">
            <OptionSelect id="entity" name="entity" options={toSelectOptions(filterOptions.entities)} defaultValue={filters.entity ?? ""} placeholder="All entities" className="w-44" />
            <OptionSelect id="action" name="action" options={toSelectOptions(filterOptions.actions)} defaultValue={filters.action ?? ""} placeholder="All actions" className="w-44" />
            <Button type="submit" variant="secondary"><SearchIcon /> Filter</Button>
          </form>

          {auditLogs.length === 0 ? (
            <EmptyState message="No activity found." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Who</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((auditLog) => (
                  <TableRow key={auditLog.id}>
                    <TableCell className="whitespace-nowrap">{formatDateTime(auditLog.createdAt)}</TableCell>
                    <TableCell>{auditLog.user?.name ?? auditLog.user?.email ?? "System"}</TableCell>
                    <TableCell className="font-mono text-xs">{auditLog.action}</TableCell>
                    <TableCell>
                      {auditLog.entity}
                      {auditLog.entityId && <p className="text-muted-foreground font-mono text-xs">{auditLog.entityId}</p>}
                    </TableCell>
                    <TableCell>
                      {auditLog.details && (
                        <pre className="bg-muted max-w-md overflow-x-auto rounded p-2 text-xs">{JSON.stringify(auditLog.details, null, 2)}</pre>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Pagination currentPage={currentPage} totalPages={totalPages} searchParams={filters} basePath="/audit-log" />
        </CardContent>
      </Card>
    </>
  );
}
