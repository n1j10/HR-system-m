# HR System

A human resources system built with **Next.js 16**, **Clerk** (sign-in), **Prisma + PostgreSQL**, **shadcn/ui** and **Tailwind CSS**.

The code is written to be easy to read for junior developers: small files, clear names, one way of doing things everywhere.

## Features

| Module | What it does |
| --- | --- |
| Auth & roles | Sign in with Clerk. 7 roles (Super Admin, HR Admin, HR Staff, Manager, Employee, Recruiter, Finance). The first person to sign in becomes Super Admin. |
| Employees | List with search, filters and pages. Create / edit / archive (soft delete). Profile with tabs. CSV export. Salary hidden from roles without permission. |
| Organization | Departments and positions. |
| Attendance | Check in / check out. Late and overtime minutes. HR daily sheet, manual fixes (with reason), "mark missing as absent", monthly report. |
| Leaves | Leave types, yearly balances, requests, overlap check, weekends + holidays not counted, manager / HR approval, "who is off" list. |
| Holidays | Official holiday calendar. |
| Payroll | Monthly run: base + allowances + bonus − absences − unpaid leave − deductions. Draft → Approved (locked) → Paid. Printable payslips, bank transfer CSV. |
| Recruitment | Job postings, public careers page with apply form, Kanban pipeline. |
| Documents | Employee documents with expiry warnings. |
| Assets | Company equipment, assign and return. |
| Performance | Goals with progress, reviews with 1–5 rating. |
| Announcements | Company news on the dashboard. |
| Audit log | Every important change is saved: who, what, when. |
| Dashboard | Different content per role. |

## Getting started

### 1. Install

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in:

- `DATABASE_URL`: a PostgreSQL database. Free options: [Neon](https://neon.tech), [Supabase](https://supabase.com), or a local Postgres.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`: from [dashboard.clerk.com](https://dashboard.clerk.com) → API Keys.
  In development you can leave them empty; Clerk then runs in "keyless" mode.
- `ADMIN_EMAIL`: **the email you will sign in with.** The seed creates an employee with this email, so your account is linked automatically.

### 3. Start a database

No Postgres installed? Use the built-in local one (keep this terminal open):

```bash
npm run db:local
```

The `.env` file already points to it. For production, use a real PostgreSQL URL (Neon / Supabase)
and remove `&pgbouncer=true` from it.

### 4. Create the tables and sample data (in a second terminal)

```bash
npm run db:deploy    # creates the tables
npm run db:seed      # departments, positions, leave types, holidays, 8 sample employees
```

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000 and sign in. The first account becomes **Super Admin**.
Go to **Users & roles** to give other people their roles.

> **How accounts are linked to employees:** when someone signs in, the app looks for an employee with the same email and links them. You can also link them by hand on the **Users & roles** page.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run typecheck` | Check TypeScript types |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests (payroll math, leave days, attendance rules) |
| `npm run db:migrate` | Create / update database tables after changing `schema.prisma` |
| `npm run db:seed` | Add sample data |
| `npm run db:studio` | Open Prisma Studio to see the data |

## Project structure

```
prisma/
  schema.prisma          # all database tables
  seed.ts                # sample data
src/
  app/
    (auth)/              # Clerk sign-in / sign-up pages
    (dashboard)/         # every page behind sign-in (sidebar layout)
    careers/             # public job pages (no sign-in)
    api/                 # CSV downloads
  features/              # one folder per module
    employees/
      actions.ts         # server actions: create, update, delete ("use server")
      queries.ts         # functions that read from the database
      schemas.ts         # Zod rules for form input
      components/        # UI used only by this module
    leaves/ payroll/ attendance/ ...
  components/
    ui/                  # shadcn components
    shared/              # our reusable components (ActionForm, PageHeader, ...)
    layout/              # sidebar and navigation
  lib/
    auth.ts              # getCurrentUser, requirePermission
    permissions.ts       # which role can do what
    audit.ts             # createAuditLog
    dates.ts             # weekend days, working hours, date helpers
    format.ts            # money, dates, names
    validation.ts        # small Zod helpers for forms
  proxy.ts               # Clerk: protects every page except public ones
tests/                   # Vitest unit tests
```

## How things work (read this before you code)

### 1. Permissions

All rules live in [`src/lib/permissions.ts`](src/lib/permissions.ts):

```ts
"leave:approve": ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"],
```

Every page and every server action starts by checking the permission **on the server**:

```ts
const currentUser = await requirePermission("leave:approve");
```

Hiding a button is not enough. The check on the server is what protects the data.

**Scope:** HR sees everyone. A manager only sees the employees whose `managerId` is them
(see `getVisibleEmployeesFilter` in `features/employees/queries.ts`).

### 2. Forms

Every form follows the same pattern:

```tsx
// page.tsx (server component)
<ActionForm action={createDepartment} resetOnSuccess>
  <Input name="name" />
  <SubmitButton>Save</SubmitButton>
</ActionForm>
```

```ts
// actions.ts
export async function createDepartment(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("organization:manage");             // 1. permission

  const parsed = departmentSchema.safeParse(formDataToObject(formData));           // 2. validate
  if (!parsed.success) return validationErrorResult(parsed.error);

  const department = await prisma.department.create({ data: parsed.data });       // 3. save

  await createAuditLog({ userId: currentUser.id, action: "CREATE", entity: "Department", entityId: department.id }); // 4. audit
  revalidatePath("/departments");                                                 // 5. refresh the page
  return successResult("Department created");                                     // 6. message (shown as a toast)
}
```

`ActionForm` shows the returned message as a green or red toast.

### 3. Money

Never use normal JavaScript numbers for money (`0.1 + 0.2 !== 0.3`).
The database stores money as `Decimal`, and payroll math uses `Prisma.Decimal`
(see [`features/payroll/calculate-payslip.ts`](src/features/payroll/calculate-payslip.ts)).

### 4. Dates

Dates without a time (hire date, leave days, attendance day) are stored as **midnight UTC**.
Use the helpers in [`src/lib/dates.ts`](src/lib/dates.ts) (`getToday`, `toDateOnly`, ...) so nothing ends up one day off.

Company settings (weekend = Friday + Saturday, work hours 08:00–16:00, 15 minutes grace) are constants at the top of that file.

### 5. Soft delete

Employees are never deleted. "Archive" sets `deletedAt`, and every query filters `deletedAt: null`.

## Business rules

- **Leave days** = working days between start and end. Weekends and official holidays are not counted.
- **Leave balance** is created the first time it is needed in a year (from the leave type's "days per year"), so it renews automatically every year. Pending requests are reserved from the balance.
- **Approving a leave** uses the balance and marks those days as `LEAVE` in attendance.
- **Late** = checking in more than 15 minutes after 08:00 (the full minutes after 08:00 are counted).
- **Payroll deduction** = `base salary ÷ 30 × (absent days + unpaid leave days)`. Net salary can never go below 0.
- **Approved payroll is locked.** Employees only see payslips of approved months.

> Labour law (leave days, social security, taxes, end-of-service) differs by country.
> Check the numbers in `prisma/seed.ts` and the payroll formula with an accountant before going live.

## Ideas for next steps

- File uploads (UploadThing / S3) instead of links for documents and CVs
- Arabic translation + RTL with `next-intl`
- Email notifications with Resend (leave approved, payslip ready)
- Social security and tax rules in payroll
- Onboarding / offboarding checklists
- Cron job to remind about expiring documents and probation ends
