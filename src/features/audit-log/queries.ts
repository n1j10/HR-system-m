import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const AUDIT_LOGS_PER_PAGE = 25;

type AuditLogFilters = { entity?: string; action?: string; page: number };

export async function getAuditLogs(filters: AuditLogFilters) {
  const where: Prisma.AuditLogWhereInput = {
    entity: filters.entity,
    action: filters.action,
  };

  const [auditLogs, totalLogs] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * AUDIT_LOGS_PER_PAGE,
      take: AUDIT_LOGS_PER_PAGE,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { auditLogs, totalPages: Math.ceil(totalLogs / AUDIT_LOGS_PER_PAGE) };
}

/** The distinct entity and action names, used to fill the filter dropdowns. */
export async function getAuditLogFilterOptions() {
  const [entities, actions] = await Promise.all([
    prisma.auditLog.findMany({ distinct: ["entity"], select: { entity: true }, orderBy: { entity: "asc" } }),
    prisma.auditLog.findMany({ distinct: ["action"], select: { action: true }, orderBy: { action: "asc" } }),
  ]);
  return { entities: entities.map((row) => row.entity), actions: actions.map((row) => row.action) };
}
