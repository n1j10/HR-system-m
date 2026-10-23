import { PrismaClient, type AttendanceStatus, type Prisma, type ContractType, type EmployeeStatus, type Gender } from "@prisma/client";

const prisma = new PrismaClient();
const currentYear = new Date().getFullYear();

function dateOnly(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day));
}

async function seedDepartments() {
  const departments = [
    { code: "HR", name: "Human Resources", description: "People and culture" },
    { code: "IT", name: "Information Technology", description: "Software and infrastructure" },
    { code: "FIN", name: "Finance", description: "Accounting and payroll" },
    { code: "SALES", name: "Sales", description: "Customers and growth" },
    { code: "OPS", name: "Operations", description: "Day-to-day operations" },
  ];
  for (const department of departments) {
    await prisma.department.upsert({ where: { code: department.code }, update: {}, create: department });
  }
}

async function seedPositions() {
  const positions = [
    { title: "General Manager", level: 10 },
    { title: "HR Manager", level: 8 },
    { title: "HR Specialist", level: 4 },
    { title: "Software Engineer", level: 5 },
    { title: "Engineering Manager", level: 8 },
    { title: "Accountant", level: 4 },
    { title: "Sales Representative", level: 3 },
  ];
  for (const position of positions) {
    await prisma.position.upsert({ where: { title: position.title }, update: {}, create: position });
  }
}

async function seedLeaveTypes() {
  // Check these numbers against your local labour law before going live.
  const leaveTypes = [
    { name: "Annual leave", daysPerYear: 21, isPaid: true, requiresAttachment: false },
    { name: "Sick leave", daysPerYear: 15, isPaid: true, requiresAttachment: true },
    { name: "Unpaid leave", daysPerYear: 30, isPaid: false, requiresAttachment: false },
    { name: "Marriage leave", daysPerYear: 5, isPaid: true, requiresAttachment: true },
    { name: "Bereavement leave", daysPerYear: 3, isPaid: true, requiresAttachment: false },
    { name: "Maternity leave", daysPerYear: 98, isPaid: true, requiresAttachment: true },
  ];
  for (const leaveType of leaveTypes) {
    await prisma.leaveType.upsert({ where: { name: leaveType.name }, update: {}, create: leaveType });
  }
}

async function seedHolidays() {
  // Fixed-date Iraqi holidays. Religious holidays depend on the moon, so HR adds them each year.
  const holidays = [
    { name: "New Year's Day", date: dateOnly(currentYear, 1, 1) },
    { name: "Army Day", date: dateOnly(currentYear, 1, 6) },
    { name: "Nowruz", date: dateOnly(currentYear, 3, 21) },
    { name: "Labour Day", date: dateOnly(currentYear, 5, 1) },
    { name: "Republic Day", date: dateOnly(currentYear, 7, 14) },
    { name: "National Day", date: dateOnly(currentYear, 10, 3) },
    { name: "Victory Day", date: dateOnly(currentYear, 12, 10) },
    { name: "Christmas Day", date: dateOnly(currentYear, 12, 25) },
  ];
  for (const holiday of holidays) {
    await prisma.holiday.upsert({ where: { date: holiday.date }, update: {}, create: holiday });
  }
}

type SampleEmployee = {
  firstName: string;
  lastName: string;
  email: string;
  gender: Gender;
  departmentCode: string;
  positionTitle: string;
  managerEmail?: string;
  baseSalary: number;
  allowances: number;
  status?: EmployeeStatus;
  contractType?: ContractType;
  hireDate: Date;
  probationEndDate?: Date;
};

async function seedEmployees() {
  // Put your own email in ADMIN_EMAIL so your first sign-in links to an employee record.
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@example.com").toLowerCase();

  const sampleEmployees: SampleEmployee[] = [
    { firstName: "Admin", lastName: "User", email: adminEmail, gender: "MALE", departmentCode: "HR", positionTitle: "General Manager", baseSalary: 3_000_000, allowances: 500_000, hireDate: dateOnly(2020, 1, 5) },
    { firstName: "Sara", lastName: "Ali", email: "sara.ali@example.com", gender: "FEMALE", departmentCode: "HR", positionTitle: "HR Manager", managerEmail: adminEmail, baseSalary: 2_000_000, allowances: 300_000, hireDate: dateOnly(2021, 3, 1) },
    { firstName: "Omar", lastName: "Hassan", email: "omar.hassan@example.com", gender: "MALE", departmentCode: "IT", positionTitle: "Engineering Manager", managerEmail: adminEmail, baseSalary: 2_500_000, allowances: 350_000, hireDate: dateOnly(2021, 6, 15) },
    { firstName: "Zainab", lastName: "Kareem", email: "zainab.kareem@example.com", gender: "FEMALE", departmentCode: "IT", positionTitle: "Software Engineer", managerEmail: "omar.hassan@example.com", baseSalary: 1_600_000, allowances: 200_000, hireDate: dateOnly(2023, 2, 1) },
    { firstName: "Mustafa", lastName: "Jaber", email: "mustafa.jaber@example.com", gender: "MALE", departmentCode: "IT", positionTitle: "Software Engineer", managerEmail: "omar.hassan@example.com", baseSalary: 1_400_000, allowances: 200_000, status: "PROBATION", hireDate: dateOnly(currentYear, 9, 1), probationEndDate: dateOnly(currentYear, 12, 1) },
    { firstName: "Noor", lastName: "Saleh", email: "noor.saleh@example.com", gender: "FEMALE", departmentCode: "FIN", positionTitle: "Accountant", managerEmail: adminEmail, baseSalary: 1_300_000, allowances: 150_000, hireDate: dateOnly(2022, 9, 10) },
    { firstName: "Ali", lastName: "Abbas", email: "ali.abbas@example.com", gender: "MALE", departmentCode: "SALES", positionTitle: "Sales Representative", managerEmail: adminEmail, baseSalary: 1_000_000, allowances: 250_000, hireDate: dateOnly(2024, 1, 20) },
    { firstName: "Huda", lastName: "Mahmoud", email: "huda.mahmoud@example.com", gender: "FEMALE", departmentCode: "HR", positionTitle: "HR Specialist", managerEmail: "sara.ali@example.com", baseSalary: 1_100_000, allowances: 150_000, contractType: "PART_TIME", hireDate: dateOnly(2024, 5, 5) },
  ];

  // Managers must exist before their reports, so the list above is in that order.
  let employeeCount = await prisma.employee.count();
  for (const sample of sampleEmployees) {
    const existingEmployee = await prisma.employee.findUnique({ where: { email: sample.email } });
    if (existingEmployee) continue;

    const department = await prisma.department.findUniqueOrThrow({ where: { code: sample.departmentCode } });
    const position = await prisma.position.findUniqueOrThrow({ where: { title: sample.positionTitle } });
    const manager = sample.managerEmail ? await prisma.employee.findUnique({ where: { email: sample.managerEmail } }) : null;

    employeeCount += 1;
    await prisma.employee.create({
      data: {
        employeeNumber: `EMP-${String(employeeCount).padStart(4, "0")}`,
        firstName: sample.firstName,
        lastName: sample.lastName,
        email: sample.email,
        gender: sample.gender,
        nationality: "Iraqi",
        departmentId: department.id,
        positionId: position.id,
        managerId: manager?.id,
        hireDate: sample.hireDate,
        probationEndDate: sample.probationEndDate,
        status: sample.status ?? "ACTIVE",
        contractType: sample.contractType ?? "FULL_TIME",
        baseSalary: sample.baseSalary,
        allowances: sample.allowances,
        bankName: "Rafidain Bank",
      },
    });
  }
}

// ───────────────────────────── Demo activity ─────────────────────────────
// Extra dummy data so every page has something to show.

const FIRST_NAMES = ["Ahmed", "Fatima", "Hussein", "Maryam", "Karrar", "Rusul", "Haider", "Shahad", "Yousif", "Aya", "Mohammed", "Hawraa", "Abdullah", "Ruqaya", "Hassan", "Dalia", "Ammar", "Tiba", "Saif", "Zahraa"];
const LAST_NAMES = ["Al-Obaidi", "Al-Saadi", "Al-Jubouri", "Al-Rubaie", "Al-Tamimi", "Al-Khafaji", "Al-Azzawi", "Al-Dulaimi", "Al-Hashimi", "Al-Shammari"];

/** Same "random" numbers every run, so the seed is repeatable. */
function createRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}
const random = createRandom(42);
const pickOne = <T,>(items: T[]): T => items[Math.floor(random() * items.length)];

function addDaysUtc(date: Date, numberOfDays: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + numberOfDays);
  return result;
}

function todayUtc() {
  const now = new Date();
  return dateOnly(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

const isWeekendDay = (date: Date) => date.getUTCDay() === 5 || date.getUTCDay() === 6;

async function seedMoreEmployees() {
  const departments = await prisma.department.findMany();
  const positions = await prisma.position.findMany({ where: { level: { lt: 8 } } });
  const managers = await prisma.employee.findMany({ where: { position: { level: { gte: 8 } } } });

  let employeeCount = await prisma.employee.count();
  for (let index = 0; index < 20; index++) {
    const firstName = FIRST_NAMES[index];
    const lastName = pickOne(LAST_NAMES);
    const email = `${firstName.toLowerCase()}.${index}@example.com`;
    if (await prisma.employee.findUnique({ where: { email } })) continue;

    employeeCount += 1;
    const baseSalary = Math.round((800_000 + random() * 1_200_000) / 10_000) * 10_000;
    await prisma.employee.create({
      data: {
        employeeNumber: `EMP-${String(employeeCount).padStart(4, "0")}`,
        firstName,
        lastName,
        email,
        phone: `0770${String(1_000_000 + index * 37_421).slice(0, 7)}`,
        gender: index % 2 === 0 ? "MALE" : "FEMALE",
        nationality: "Iraqi",
        address: pickOne(["Baghdad", "Basra", "Erbil", "Najaf", "Karbala", "Mosul"]),
        departmentId: pickOne(departments).id,
        positionId: pickOne(positions).id,
        managerId: pickOne(managers).id,
        hireDate: dateOnly(2022 + Math.floor(random() * 4), 1 + Math.floor(random() * 12), 1 + Math.floor(random() * 27)),
        status: index === 3 ? "ON_LEAVE" : index === 7 ? "PROBATION" : "ACTIVE",
        contractType: index % 6 === 0 ? "CONTRACT" : "FULL_TIME",
        baseSalary,
        allowances: Math.round(baseSalary * 0.15),
        bankName: pickOne(["Rafidain Bank", "Rasheed Bank", "TBI"]),
        bankAccount: `IQ${Math.floor(random() * 1e12)}`,
      },
    });
  }
}

/** A user that "owns" demo announcements and reviews. It cannot sign in. */
async function getSeedUser() {
  return prisma.user.upsert({
    where: { email: "hr.bot@example.com" },
    update: {},
    create: { clerkId: "seed-user", email: "hr.bot@example.com", name: "HR Team", role: "HR_ADMIN", isActive: false },
  });
}

async function seedAttendance() {
  const employees = await prisma.employee.findMany({ where: { deletedAt: null } });
  const holidays = await prisma.holiday.findMany();
  const isHoliday = (date: Date) => holidays.some((holiday) => holiday.date.getTime() === date.getTime());

  const records: Prisma.AttendanceCreateManyInput[] = [];
  for (let daysAgo = 45; daysAgo >= 1; daysAgo--) {
    const date = addDaysUtc(todayUtc(), -daysAgo);
    if (isWeekendDay(date) || isHoliday(date)) continue;

    for (const employee of employees) {
      if (employee.hireDate > date) continue;
      const roll = random();
      const status: AttendanceStatus = roll < 0.04 ? "ABSENT" : roll < 0.16 ? "LATE" : roll < 0.22 ? "REMOTE" : "PRESENT";
      if (status === "ABSENT") {
        records.push({ employeeId: employee.id, date, status: "ABSENT" as const });
        continue;
      }
      const lateMinutes = status === "LATE" ? 20 + Math.floor(random() * 60) : 0;
      const checkInAt = new Date(date);
      checkInAt.setUTCHours(5, status === "LATE" ? lateMinutes : Math.floor(random() * 15)); // 08:xx Baghdad time (UTC+3)
      const overtimeMinutes = random() < 0.2 ? Math.floor(random() * 120) : 0;
      const checkOutAt = new Date(date);
      checkOutAt.setUTCHours(13, overtimeMinutes); // 16:xx Baghdad time
      records.push({ employeeId: employee.id, date, status, checkInAt, checkOutAt, lateMinutes, overtimeMinutes });
    }
  }
  await prisma.attendance.createMany({ data: records, skipDuplicates: true });
}

async function seedLeaves(reviewerUserId: string) {
  const employees = await prisma.employee.findMany({ where: { deletedAt: null }, take: 12, orderBy: { employeeNumber: "asc" } });
  const annual = await prisma.leaveType.findUniqueOrThrow({ where: { name: "Annual leave" } });
  const sick = await prisma.leaveType.findUniqueOrThrow({ where: { name: "Sick leave" } });
  const today = todayUtc();

  const plans = [
    { offset: -20, length: 3, status: "APPROVED" as const, type: annual },
    { offset: -10, length: 1, status: "APPROVED" as const, type: sick },
    { offset: -5, length: 2, status: "REJECTED" as const, type: annual },
    { offset: 0, length: 3, status: "APPROVED" as const, type: annual },
    { offset: 7, length: 5, status: "PENDING" as const, type: annual },
    { offset: 12, length: 2, status: "PENDING" as const, type: annual },
    { offset: 20, length: 4, status: "APPROVED" as const, type: annual },
    { offset: 3, length: 1, status: "PENDING" as const, type: sick },
  ];

  for (const [index, plan] of plans.entries()) {
    const employee = employees[index + 1];
    const startDate = addDaysUtc(today, plan.offset);
    const endDate = addDaysUtc(startDate, plan.length - 1);
    let days = 0;
    for (let date = startDate; date <= endDate; date = addDaysUtc(date, 1)) if (!isWeekendDay(date)) days++;
    if (days === 0) continue;

    await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        leaveTypeId: plan.type.id,
        startDate,
        endDate,
        days,
        reason: plan.type === sick ? "Flu" : pickOne(["Family trip", "Personal matters", "Wedding in the family"]),
        attachmentUrl: plan.type === sick ? "https://example.com/medical-report.pdf" : null,
        status: plan.status,
        decidedById: plan.status === "PENDING" ? null : reviewerUserId,
        decidedAt: plan.status === "PENDING" ? null : new Date(),
        decisionNote: plan.status === "REJECTED" ? "Busy period, please pick other dates" : null,
      },
    });

    if (plan.status === "APPROVED") {
      const year = startDate.getUTCFullYear();
      await prisma.leaveBalance.upsert({
        where: { employeeId_leaveTypeId_year: { employeeId: employee.id, leaveTypeId: plan.type.id, year } },
        create: { employeeId: employee.id, leaveTypeId: plan.type.id, year, totalDays: plan.type.daysPerYear, usedDays: days },
        update: { usedDays: { increment: days } },
      });
    }
  }
}

async function seedAnnouncements(createdById: string) {
  const announcements = [
    { title: "Welcome to the new HR system 🎉", body: "From today, please request leaves and check your payslips here instead of email." },
    { title: "Office closed on National Day", body: "The office will be closed on October 3rd. Enjoy the holiday!" },
    { title: "Health insurance renewal", body: "Please send your updated family details to HR before the end of the month." },
  ];
  for (const announcement of announcements) {
    await prisma.announcement.create({ data: { ...announcement, createdById } });
  }
}

async function seedRecruitment() {
  const jobs = [
    { title: "Senior Backend Developer", location: "Baghdad / Hybrid", description: "Node.js, PostgreSQL, 4+ years of experience.\nYou will build our internal platforms." },
    { title: "HR Coordinator", location: "Erbil", description: "Help us hire and onboard great people.\nArabic and English required." },
    { title: "Sales Executive", location: "Basra", description: "Grow our customer base in the south.", status: "CLOSED" as const },
  ];
  const stages = ["NEW", "NEW", "SCREENING", "INTERVIEW", "INTERVIEW", "OFFER", "HIRED", "REJECTED"] as const;

  for (const job of jobs) {
    const jobPosting = await prisma.jobPosting.create({ data: job });
    for (let index = 0; index < 6; index++) {
      const fullName = `${pickOne(FIRST_NAMES)} ${pickOne(LAST_NAMES)}`;
      await prisma.candidate.create({
        data: {
          jobPostingId: jobPosting.id,
          fullName,
          email: `${fullName.split(" ")[0].toLowerCase()}.candidate${index}@example.com`,
          phone: "07801234567",
          resumeUrl: "https://example.com/resume.pdf",
          coverLetter: "I am excited about this role and believe my experience is a great fit.",
          stage: pickOne([...stages]),
        },
      });
    }
  }
}

async function seedAssetsAndDocuments() {
  const employees = await prisma.employee.findMany({ where: { deletedAt: null }, take: 10, orderBy: { employeeNumber: "asc" } });
  const today = todayUtc();

  const assets = [
    { name: "MacBook Pro 14\"", category: "Laptop" },
    { name: "Dell Latitude 5440", category: "Laptop" },
    { name: "Dell Latitude 5440", category: "Laptop" },
    { name: "iPhone 15", category: "Phone" },
    { name: "Samsung Galaxy A55", category: "Phone" },
    { name: "LG 27\" Monitor", category: "Monitor" },
    { name: "Toyota Hilux", category: "Car" },
    { name: "Access card #12", category: "Access card" },
  ];
  for (const [index, asset] of assets.entries()) {
    const holder = index < 5 ? employees[index] : null;
    await prisma.asset.create({
      data: {
        ...asset,
        serialNumber: `SN-${1000 + index}`,
        condition: index === 6 ? "MAINTENANCE" : "GOOD",
        assignedEmployeeId: holder?.id,
        assignedAt: holder ? addDaysUtc(today, -100 + index * 7) : null,
      },
    });
  }

  for (const [index, employee] of employees.entries()) {
    await prisma.document.create({
      data: { employeeId: employee.id, title: "Employment contract", category: "Contract", fileUrl: "https://example.com/contract.pdf" },
    });
    await prisma.document.create({
      data: {
        employeeId: employee.id,
        title: "National ID copy",
        category: "National ID",
        fileUrl: "https://example.com/id.pdf",
        // A few expire soon or already expired, to show the warnings.
        expiresAt: addDaysUtc(today, index < 2 ? -5 : index < 4 ? 15 : 400 + index * 30),
      },
    });
  }
}

async function seedPerformance(reviewerId: string) {
  const employees = await prisma.employee.findMany({ where: { deletedAt: null }, take: 8, orderBy: { employeeNumber: "asc" } });
  const goalTitles = ["Finish onboarding training", "Close 10 new deals", "Reduce bug count by 30%", "Improve customer response time", "Learn PostgreSQL performance tuning"];

  for (const employee of employees) {
    for (let index = 0; index < 2; index++) {
      const progress = pickOne([0, 25, 50, 75, 100]);
      await prisma.goal.create({
        data: {
          employeeId: employee.id,
          title: pickOne(goalTitles),
          dueDate: dateOnly(currentYear, 12, 31),
          progress,
          status: progress === 0 ? "NOT_STARTED" : progress === 100 ? "COMPLETED" : "IN_PROGRESS",
        },
      });
    }
    await prisma.performanceReview.create({
      data: {
        employeeId: employee.id,
        reviewerId,
        period: `${currentYear} H1`,
        rating: 2 + Math.floor(random() * 4),
        comments: "Good team player. Keep improving communication with other departments.",
      },
    });
  }
}

/** An approved payroll for last month, calculated like the app does. */
async function seedLastMonthPayroll() {
  const today = new Date();
  const lastMonth = today.getMonth() === 0 ? 12 : today.getMonth();
  const year = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
  const firstDay = dateOnly(year, lastMonth, 1);
  const lastDay = new Date(Date.UTC(year, lastMonth, 0));

  const employees = await prisma.employee.findMany({
    where: { deletedAt: null, hireDate: { lte: lastDay } },
    include: { attendances: { where: { status: "ABSENT", date: { gte: firstDay, lte: lastDay } } } },
  });

  await prisma.payrollRun.create({
    data: {
      month: lastMonth,
      year,
      status: "PAID",
      payslips: {
        create: employees.map((employee) => {
          const absentDays = employee.attendances.length;
          const absenceDeduction = employee.baseSalary.dividedBy(30).times(absentDays).toDecimalPlaces(2);
          return {
            employeeId: employee.id,
            baseSalary: employee.baseSalary,
            allowances: employee.allowances,
            absentDays,
            absenceDeduction,
            netSalary: employee.baseSalary.plus(employee.allowances).minus(absenceDeduction),
            currency: employee.currency,
          };
        }),
      },
    },
  });
}

async function seedDemoActivity() {
  // Run only once: if announcements exist, the demo data is already there.
  if ((await prisma.announcement.count()) > 0) {
    console.log("ℹ️  Demo activity already exists, skipping");
    return;
  }
  const seedUser = await getSeedUser();
  await seedMoreEmployees();
  await seedAttendance();
  await seedLeaves(seedUser.id);
  await seedAnnouncements(seedUser.id);
  await seedRecruitment();
  await seedAssetsAndDocuments();
  await seedPerformance(seedUser.id);
  await seedLastMonthPayroll();
}

async function main() {
  await seedDepartments();
  await seedPositions();
  await seedLeaveTypes();
  await seedHolidays();
  await seedEmployees();
  await seedDemoActivity();
  console.log("✅ Seed data created");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
