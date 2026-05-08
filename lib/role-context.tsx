"use client";

import * as React from "react";
import type { Employee, Role } from "./mock/types";
import { employees } from "./mock/employees";

type RoleContextValue = {
  user: Employee;
  setUserId: (id: string) => void;
  isTablet: boolean;
  setTablet: (v: boolean) => void;
  role: Role;
};

const RoleContext = React.createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = React.useState<string>("u-ben");
  const [isTablet, setTablet] = React.useState(false);
  const user = employees.find((e) => e.id === userId) ?? employees[0];
  const role: Role = isTablet ? "tablet" : user.role;

  return (
    <RoleContext.Provider value={{ user, setUserId, isTablet, setTablet, role }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = React.useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}

export function canAccess(role: Role, module: string): boolean {
  if (role === "tablet") {
    return ["jobs", "safety"].includes(module);
  }
  if (role === "employee") {
    return !["payroll", "admin"].includes(module);
  }
  if (role === "supervisor") {
    return module !== "admin";
  }
  return true;
}
