import { z } from "zod";

import { ContractType, EmployeeStatus, Gender } from "@prisma/client";
import { moneyAmount, optionalDate, optionalId, optionalText, requiredDate, requiredText } from "@/lib/validation";

export const employeeSchema = z.object({
  // Personal
  firstName: requiredText,
  lastName: requiredText,
  email: z.email("Enter a valid email").transform((email) => email.toLowerCase()),
  phone: optionalText,
  gender: z.enum(Gender).optional().or(z.literal("").transform(() => undefined)),
  birthDate: optionalDate,
  nationality: optionalText,
  address: optionalText,
  emergencyContactName: optionalText,
  emergencyContactPhone: optionalText,

  // Job
  departmentId: requiredText,
  positionId: requiredText,
  managerId: optionalId,
  hireDate: requiredDate,
  probationEndDate: optionalDate,
  contractType: z.enum(ContractType),
  status: z.enum(EmployeeStatus),

  // Salary
  baseSalary: moneyAmount,
  allowances: moneyAmount,
  currency: z.enum(["IQD", "USD"]),
  bankName: optionalText,
  bankAccount: optionalText,
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
