import Link from "next/link";
import { PencilIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteButton } from "@/components/shared/delete-button";
import { requirePermission } from "@/lib/auth";
import { getPositionsWithEmployeeCount } from "@/features/positions/queries";
import { deletePosition } from "@/features/positions/actions";
import { PositionForm } from "@/features/positions/components/position-form";

export default async function PositionsPage() {
  await requirePermission("organization:manage");
  const positions = await getPositionsWithEmployeeCount();

  return (
    <>
      <PageHeader title="Positions" description="Job titles used across the company." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent>
            {positions.length === 0 ? (
              <EmptyState message="No positions yet." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((position) => (
                    <TableRow key={position.id}>
                      <TableCell>
                        <p className="font-medium">{position.title}</p>
                        <p className="text-muted-foreground text-xs">{position.description}</p>
                      </TableCell>
                      <TableCell>{position.level ?? "—"}</TableCell>
                      <TableCell>{position._count.employees}</TableCell>
                      <TableCell className="flex justify-end gap-1">
                        <Link href={`/positions/${position.id}`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })} aria-label="Edit">
                          <PencilIcon />
                        </Link>
                        <DeleteButton action={deletePosition} idFieldName="positionId" idValue={position.id} />
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
            <CardTitle>New position</CardTitle>
          </CardHeader>
          <CardContent>
            <PositionForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
