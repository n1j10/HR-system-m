import { cache } from "react";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { hasPermission, type Permission } from "@/lib/permissions";

/**
 * Returns the signed-in user from our database (with their employee record).
 *
 * Clerk handles the sign-in itself. The first time someone signs in we create
 * a matching row in our `User` table. The very first user becomes SUPER_ADMIN
 * so there is always someone who can manage roles.
 *
 * `cache` makes sure we only hit the database once per request.
 */
export const getCurrentUser = cache(async () => {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const existingUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    include: { employee: true },
  });

  const user = existingUser ?? (await createUserFromClerk(clerkUserId));

  if (!user.isActive) redirect("/unauthorized");

  return user;
});

export type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>>;

async function createUserFromClerk(clerkUserId: string) {
  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (!email) redirect("/sign-in");

  const numberOfUsers = await prisma.user.count();
  const isFirstUser = numberOfUsers === 0;

  // If HR already added an employee with this email, link them together.
  const matchingEmployee = await prisma.employee.findUnique({ where: { email } });
  const employeeIsFree = matchingEmployee && !matchingEmployee.userId;

  return prisma.user.create({
    data: {
      clerkId: clerkUserId,
      email,
      name: clerkUser?.fullName ?? null,
      role: isFirstUser ? "SUPER_ADMIN" : "EMPLOYEE",
      employee: employeeIsFree ? { connect: { id: matchingEmployee.id } } : undefined,
    },
    include: { employee: true },
  });
}

/**
 * Use this at the top of every page and server action that needs a permission.
 * It sends the user to /unauthorized when their role is not allowed.
 */
export async function requirePermission(permission: Permission) {
  const user = await getCurrentUser();
  if (!hasPermission(user.role, permission)) redirect("/unauthorized");
  return user;
}

/** For pages that every employee can open (their own leaves, payslips, ...). */
export async function requireEmployeeProfile() {
  const user = await getCurrentUser();
  if (!user.employee) redirect("/no-employee-profile");
  return { user, employee: user.employee };
}
