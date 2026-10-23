import type { Role } from "@prisma/client";

// Every permission lists the roles that are allowed to use it.
// To give a role a new ability, add the role to the list here.
export const PERMISSIONS = {
  "employee:read": ["SUPER_ADMIN", "HR_ADMIN", "HR_STAFF", "MANAGER", "FINANCE"],
  "employee:manage": ["SUPER_ADMIN", "HR_ADMIN", "HR_STAFF"],
  "employee:view-salary": ["SUPER_ADMIN", "HR_ADMIN", "FINANCE"],
  "organization:manage": ["SUPER_ADMIN", "HR_ADMIN"],
  "attendance:manage": ["SUPER_ADMIN", "HR_ADMIN", "HR_STAFF"],
  "leave:approve": ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"],
  "leave:manage": ["SUPER_ADMIN", "HR_ADMIN"],
  "holiday:manage": ["SUPER_ADMIN", "HR_ADMIN"],
  "payroll:manage": ["SUPER_ADMIN", "HR_ADMIN", "FINANCE"],
  "recruitment:manage": ["SUPER_ADMIN", "HR_ADMIN", "RECRUITER"],
  "document:manage": ["SUPER_ADMIN", "HR_ADMIN", "HR_STAFF"],
  "asset:manage": ["SUPER_ADMIN", "HR_ADMIN", "HR_STAFF"],
  "performance:manage": ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"],
  "announcement:manage": ["SUPER_ADMIN", "HR_ADMIN"],
  "user:manage": ["SUPER_ADMIN"],
  "audit:read": ["SUPER_ADMIN", "HR_ADMIN"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: Role, permission: Permission): boolean {
  const allowedRoles: readonly Role[] = PERMISSIONS[permission];
  return allowedRoles.includes(role);
}

/** Roles that see every employee. Managers only see their own team. */
export function canSeeAllEmployees(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR_ADMIN" || role === "HR_STAFF" || role === "FINANCE";
}
