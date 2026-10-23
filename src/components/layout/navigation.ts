import {
  BadgeCheckIcon,
  BriefcaseIcon,
  Building2Icon,
  CalendarCheckIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  HistoryIcon,
  LaptopIcon,
  LayoutDashboardIcon,
  MegaphoneIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  TargetIcon,
  UserIcon,
  UsersIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";

import type { Permission } from "@/lib/permissions";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Leave empty for links every signed-in user can see. */
  permission?: Permission;
};

export type NavigationSection = {
  title: string;
  items: NavigationItem[];
};

export const NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    title: "Me",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
      { label: "My profile", href: "/me", icon: UserIcon },
      { label: "Attendance", href: "/attendance", icon: ClockIcon },
      { label: "My leaves", href: "/leaves", icon: CalendarIcon },
      { label: "My payslips", href: "/payslips", icon: ReceiptIcon },
      { label: "Goals & reviews", href: "/performance", icon: TargetIcon },
      { label: "Announcements", href: "/announcements", icon: MegaphoneIcon },
      { label: "Holidays", href: "/holidays", icon: CalendarDaysIcon },
    ],
  },
  {
    title: "Team",
    items: [
      { label: "Employees", href: "/employees", icon: UsersIcon, permission: "employee:read" },
      { label: "Leave approvals", href: "/leaves/approvals", icon: CalendarCheckIcon, permission: "leave:approve" },
    ],
  },
  {
    title: "HR",
    items: [
      { label: "Departments", href: "/departments", icon: Building2Icon, permission: "organization:manage" },
      { label: "Positions", href: "/positions", icon: BadgeCheckIcon, permission: "organization:manage" },
      { label: "Leave types", href: "/leaves/types", icon: CalendarIcon, permission: "leave:manage" },
      { label: "Payroll", href: "/payroll", icon: WalletIcon, permission: "payroll:manage" },
      { label: "Recruitment", href: "/recruitment", icon: BriefcaseIcon, permission: "recruitment:manage" },
      { label: "Documents", href: "/documents", icon: FileTextIcon, permission: "document:manage" },
      { label: "Assets", href: "/assets", icon: LaptopIcon, permission: "asset:manage" },
    ],
  },
  {
    title: "Admin",
    items: [
      { label: "Users & roles", href: "/settings/users", icon: ShieldCheckIcon, permission: "user:manage" },
      { label: "Audit log", href: "/audit-log", icon: HistoryIcon, permission: "audit:read" },
    ],
  },
];
