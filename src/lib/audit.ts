import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type AuditLogInput = {
  userId: string;
  action: string; // e.g. CREATE, UPDATE, DELETE, APPROVE
  entity: string; // e.g. Employee, LeaveRequest
  entityId?: string;
  details?: Prisma.InputJsonValue;
};

/** Saves who did what. Call it after every important change. */
export async function createAuditLog(input: AuditLogInput) {
  await prisma.auditLog.create({ data: input });
}
