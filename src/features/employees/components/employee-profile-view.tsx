import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatEnum, formatMoney, formatTime, getFullName, getInitials } from "@/lib/format";
import type { EmployeeProfile } from "@/features/employees/queries";

type EmployeeProfileViewProps = {
  employee: EmployeeProfile;
  /** Salary is hidden unless the viewer has the "employee:view-salary" permission (or it is their own profile). */
  showSalary: boolean;
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

export function EmployeeProfileView({ employee, showSalary }: EmployeeProfileViewProps) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="text-lg">{getInitials(employee)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{getFullName(employee)}</h2>
            <p className="text-muted-foreground text-sm">
              {employee.position.title} · {employee.department.name} · {employee.employeeNumber}
            </p>
          </div>
          <StatusBadge status={employee.status} />
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {showSalary && <TabsTrigger value="salary">Salary</TabsTrigger>}
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoRow label="Email" value={employee.email} />
                <InfoRow label="Phone" value={employee.phone} />
                <InfoRow label="Gender" value={employee.gender && formatEnum(employee.gender)} />
                <InfoRow label="Birth date" value={formatDate(employee.birthDate)} />
                <InfoRow label="Nationality" value={employee.nationality} />
                <InfoRow label="Address" value={employee.address} />
                <InfoRow label="Department" value={employee.department.name} />
                <InfoRow label="Position" value={employee.position.title} />
                <InfoRow
                  label="Manager"
                  value={employee.manager && <Link href={`/employees/${employee.manager.id}`} className="underline">{getFullName(employee.manager)}</Link>}
                />
                <InfoRow label="Contract" value={formatEnum(employee.contractType)} />
                <InfoRow label="Hire date" value={formatDate(employee.hireDate)} />
                <InfoRow label="Probation ends" value={formatDate(employee.probationEndDate)} />
                <InfoRow label="Emergency contact" value={employee.emergencyContactName} />
                <InfoRow label="Emergency phone" value={employee.emergencyContactPhone} />
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {showSalary && (
          <TabsContent value="salary">
            <Card>
              <CardContent>
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoRow label="Base salary" value={formatMoney(employee.baseSalary, employee.currency)} />
                  <InfoRow label="Allowances" value={formatMoney(employee.allowances, employee.currency)} />
                  <InfoRow label="Total monthly" value={formatMoney(employee.baseSalary.plus(employee.allowances), employee.currency)} />
                  <InfoRow label="Bank" value={employee.bankName} />
                  <InfoRow label="Account" value={employee.bankAccount} />
                </dl>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="attendance">
          <Card>
            <CardContent>
              {employee.attendances.length === 0 ? (
                <EmptyState message="No attendance records." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Check in</TableHead>
                      <TableHead>Check out</TableHead>
                      <TableHead>Late (min)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employee.attendances.map((attendance) => (
                      <TableRow key={attendance.id}>
                        <TableCell>{formatDate(attendance.date)}</TableCell>
                        <TableCell>{formatTime(attendance.checkInAt)}</TableCell>
                        <TableCell>{formatTime(attendance.checkOutAt)}</TableCell>
                        <TableCell>{attendance.lateMinutes}</TableCell>
                        <TableCell><StatusBadge status={attendance.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves">
          <Card>
            <CardContent>
              {employee.leaveRequests.length === 0 ? (
                <EmptyState message="No leave requests." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employee.leaveRequests.map((leaveRequest) => (
                      <TableRow key={leaveRequest.id}>
                        <TableCell>{leaveRequest.leaveType.name}</TableCell>
                        <TableCell>{formatDate(leaveRequest.startDate)}</TableCell>
                        <TableCell>{formatDate(leaveRequest.endDate)}</TableCell>
                        <TableCell>{leaveRequest.days}</TableCell>
                        <TableCell><StatusBadge status={leaveRequest.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardContent>
              {employee.documents.length === 0 ? (
                <EmptyState message="No documents." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employee.documents.map((document) => (
                      <TableRow key={document.id}>
                        <TableCell>
                          <a href={document.fileUrl} target="_blank" rel="noreferrer" className="underline">{document.title}</a>
                        </TableCell>
                        <TableCell>{document.category}</TableCell>
                        <TableCell>{formatDate(document.expiresAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardContent>
              {employee.assets.length === 0 ? (
                <EmptyState message="No assets assigned." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Serial number</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Condition</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employee.assets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell>{asset.name}</TableCell>
                        <TableCell className="font-mono">{asset.serialNumber ?? "—"}</TableCell>
                        <TableCell>{formatDate(asset.assignedAt)}</TableCell>
                        <TableCell><StatusBadge status={asset.condition} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
