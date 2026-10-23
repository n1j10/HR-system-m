import Link from "next/link";
import { AssetCondition } from "@prisma/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ActionForm } from "@/components/shared/action-form";
import { EnumSelect } from "@/components/shared/enum-select";
import { FormField } from "@/components/shared/form-field";
import { OptionSelect, toSelectOptions } from "@/components/shared/option-select";
import { SubmitButton } from "@/components/shared/submit-button";
import { requirePermission } from "@/lib/auth";
import { formatDate, getFullName } from "@/lib/format";
import { ASSET_CATEGORIES } from "@/features/assets/schemas";
import { getAllAssets } from "@/features/assets/queries";
import { assignAsset, changeAssetCondition, createAsset, returnAsset } from "@/features/assets/actions";
import { getEmployeeSelectOptions } from "@/features/employees/select-options";

export default async function AssetsPage() {
  await requirePermission("asset:manage");
  const [assets, employeeOptions] = await Promise.all([getAllAssets(), getEmployeeSelectOptions()]);

  return (
    <>
      <PageHeader title="Assets" description="Company equipment and who is holding it." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent>
            {assets.length === 0 ? (
              <EmptyState message="No assets yet." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Holder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {asset.category} {asset.serialNumber && `· ${asset.serialNumber}`}
                        </p>
                      </TableCell>
                      <TableCell>
                        <ActionForm action={changeAssetCondition} className="flex gap-1">
                          <input type="hidden" name="assetId" value={asset.id} />
                          <EnumSelect id={`condition-${asset.id}`} name="condition" values={Object.values(AssetCondition)} defaultValue={asset.condition} className="w-36" />
                          <SubmitButton size="sm" variant="outline">Save</SubmitButton>
                        </ActionForm>
                      </TableCell>
                      <TableCell>
                        {asset.assignedEmployee ? (
                          <div className="flex items-center gap-2">
                            <div>
                              <Link href={`/employees/${asset.assignedEmployee.id}`} className="hover:underline">
                                {getFullName(asset.assignedEmployee)}
                              </Link>
                              <p className="text-muted-foreground text-xs">since {formatDate(asset.assignedAt)}</p>
                            </div>
                            <ActionForm action={returnAsset} confirmMessage="Mark this asset as returned?">
                              <input type="hidden" name="assetId" value={asset.id} />
                              <SubmitButton size="sm" variant="ghost">Return</SubmitButton>
                            </ActionForm>
                          </div>
                        ) : (
                          <ActionForm action={assignAsset} className="flex gap-1">
                            <input type="hidden" name="assetId" value={asset.id} />
                            <OptionSelect id={`employee-${asset.id}`} name="employeeId" options={employeeOptions} placeholder="Give to..." className="w-44" required />
                            <SubmitButton size="sm" variant="outline">Assign</SubmitButton>
                          </ActionForm>
                        )}
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
            <CardTitle>Add asset</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm action={createAsset} resetOnSuccess className="grid gap-4">
              <FormField label="Name" htmlFor="name">
                <Input id="name" name="name" placeholder='e.g. MacBook Pro 14"' required />
              </FormField>
              <FormField label="Category" htmlFor="category">
                <OptionSelect id="category" name="category" options={toSelectOptions(ASSET_CATEGORIES)} required />
              </FormField>
              <FormField label="Serial number" htmlFor="serialNumber">
                <Input id="serialNumber" name="serialNumber" />
              </FormField>
              <FormField label="Condition" htmlFor="condition">
                <EnumSelect id="condition" name="condition" values={Object.values(AssetCondition)} defaultValue="GOOD" required />
              </FormField>
              <SubmitButton>Add asset</SubmitButton>
            </ActionForm>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
