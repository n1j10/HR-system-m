import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/auth";
import { getPositionById } from "@/features/positions/queries";
import { PositionForm } from "@/features/positions/components/position-form";

export default async function EditPositionPage({ params }: PageProps<"/positions/[positionId]">) {
  await requirePermission("organization:manage");
  const { positionId } = await params;

  const position = await getPositionById(positionId);
  if (!position) notFound();

  return (
    <>
      <PageHeader title={`Edit ${position.title}`} />
      <Card className="max-w-lg">
        <CardContent>
          <PositionForm position={position} />
        </CardContent>
      </Card>
    </>
  );
}
