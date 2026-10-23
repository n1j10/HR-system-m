import type { Employee } from "@prisma/client";
import { ContractType, EmployeeStatus, Gender } from "@prisma/client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionForm } from "@/components/shared/action-form";
import { EnumSelect } from "@/components/shared/enum-select";
import { FormField } from "@/components/shared/form-field";
import { OptionSelect, type SelectOption } from "@/components/shared/option-select";
import { SubmitButton } from "@/components/shared/submit-button";
import { toDateInputValue } from "@/lib/dates";
import { createEmployee, updateEmployee } from "@/features/employees/actions";

type EmployeeFormProps = {
  /** Pass an employee to edit it, or nothing to create a new one. */
  employee?: Employee;
  departmentOptions: SelectOption[];
  positionOptions: SelectOption[];
  managerOptions: SelectOption[];
};

export function EmployeeForm({ employee, departmentOptions, positionOptions, managerOptions }: EmployeeFormProps) {
  const isEditing = Boolean(employee);

  return (
    <ActionForm action={isEditing ? updateEmployee : createEmployee} className="grid gap-6">
      {employee && <input type="hidden" name="employeeId" value={employee.id} />}

      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="First name" htmlFor="firstName">
            <Input id="firstName" name="firstName" defaultValue={employee?.firstName} required />
          </FormField>
          <FormField label="Last name" htmlFor="lastName">
            <Input id="lastName" name="lastName" defaultValue={employee?.lastName} required />
          </FormField>
          <FormField label="Work email" htmlFor="email" hint="The employee signs in with this email.">
            <Input id="email" name="email" type="email" defaultValue={employee?.email} required />
          </FormField>
          <FormField label="Phone" htmlFor="phone">
            <Input id="phone" name="phone" defaultValue={employee?.phone ?? ""} />
          </FormField>
          <FormField label="Gender" htmlFor="gender">
            <EnumSelect id="gender" name="gender" values={Object.values(Gender)} defaultValue={employee?.gender ?? ""} placeholder="Not set" />
          </FormField>
          <FormField label="Birth date" htmlFor="birthDate">
            <Input id="birthDate" name="birthDate" type="date" defaultValue={toDateInputValue(employee?.birthDate)} />
          </FormField>
          <FormField label="Nationality" htmlFor="nationality">
            <Input id="nationality" name="nationality" defaultValue={employee?.nationality ?? ""} />
          </FormField>
          <FormField label="Address" htmlFor="address">
            <Input id="address" name="address" defaultValue={employee?.address ?? ""} />
          </FormField>
          <FormField label="Emergency contact name" htmlFor="emergencyContactName">
            <Input id="emergencyContactName" name="emergencyContactName" defaultValue={employee?.emergencyContactName ?? ""} />
          </FormField>
          <FormField label="Emergency contact phone" htmlFor="emergencyContactPhone">
            <Input id="emergencyContactPhone" name="emergencyContactPhone" defaultValue={employee?.emergencyContactPhone ?? ""} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Department" htmlFor="departmentId">
            <OptionSelect id="departmentId" name="departmentId" options={departmentOptions} defaultValue={employee?.departmentId} placeholder="Select a department" required />
          </FormField>
          <FormField label="Position" htmlFor="positionId">
            <OptionSelect id="positionId" name="positionId" options={positionOptions} defaultValue={employee?.positionId} placeholder="Select a position" required />
          </FormField>
          <FormField label="Direct manager" htmlFor="managerId">
            <OptionSelect id="managerId" name="managerId" options={managerOptions} defaultValue={employee?.managerId ?? ""} placeholder="No manager" />
          </FormField>
          <FormField label="Contract type" htmlFor="contractType">
            <EnumSelect id="contractType" name="contractType" values={Object.values(ContractType)} defaultValue={employee?.contractType} required />
          </FormField>
          <FormField label="Hire date" htmlFor="hireDate">
            <Input id="hireDate" name="hireDate" type="date" defaultValue={toDateInputValue(employee?.hireDate)} required />
          </FormField>
          <FormField label="Probation ends" htmlFor="probationEndDate">
            <Input id="probationEndDate" name="probationEndDate" type="date" defaultValue={toDateInputValue(employee?.probationEndDate)} />
          </FormField>
          <FormField label="Status" htmlFor="status">
            <EnumSelect id="status" name="status" values={Object.values(EmployeeStatus)} defaultValue={employee?.status ?? "PROBATION"} required />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Salary & bank</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Base salary (monthly)" htmlFor="baseSalary">
            <Input id="baseSalary" name="baseSalary" type="number" min={0} step="0.01" defaultValue={employee?.baseSalary.toString()} required />
          </FormField>
          <FormField label="Allowances (monthly)" htmlFor="allowances" hint="Housing, transport, food ... added together.">
            <Input id="allowances" name="allowances" type="number" min={0} step="0.01" defaultValue={employee?.allowances.toString() ?? "0"} required />
          </FormField>
          <FormField label="Currency" htmlFor="currency">
            <EnumSelect id="currency" name="currency" values={["IQD", "USD"]} defaultValue={employee?.currency ?? "IQD"} required />
          </FormField>
          <FormField label="Bank name" htmlFor="bankName">
            <Input id="bankName" name="bankName" defaultValue={employee?.bankName ?? ""} />
          </FormField>
          <FormField label="Bank account / IBAN" htmlFor="bankAccount">
            <Textarea id="bankAccount" name="bankAccount" rows={1} defaultValue={employee?.bankAccount ?? ""} />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <SubmitButton size="lg">{isEditing ? "Save changes" : "Create employee"}</SubmitButton>
      </div>
    </ActionForm>
  );
}
