import {
  Clock,
  Briefcase,
  FileBarChart,
  ClipboardList,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  mobile: boolean;
};

export const navItems: NavItem[] = [
  { key: "time", label: "Time", href: "/dashboard/time", icon: Clock, mobile: true },
  { key: "jobs", label: "Jobs", href: "/dashboard/jobs", icon: Briefcase, mobile: true },
  { key: "payroll", label: "Payroll", href: "/dashboard/payroll", icon: FileBarChart, mobile: false },
  { key: "reports", label: "Daily Report", href: "/dashboard/reports", icon: ClipboardList, mobile: true },
  { key: "schedule", label: "Schedule", href: "/dashboard/schedule", icon: Calendar, mobile: false },
  { key: "messages", label: "Messages", href: "/dashboard/messages", icon: MessageSquare, mobile: true },
  { key: "safety", label: "Safety", href: "/dashboard/safety", icon: ShieldCheck, mobile: false },
  { key: "admin", label: "Admin", href: "/dashboard/admin", icon: Users, mobile: false },
];
