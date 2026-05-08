"use client";

import { Bell, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRole } from "@/lib/role-context";
import { employees } from "@/lib/mock/employees";

const roleLabel: Record<string, string> = {
  admin: "Admin",
  supervisor: "Supervisor",
  employee: "Employee",
  tablet: "Tablet",
};

export function AppTopbar() {
  const { user, role, isTablet, setTablet, setUserId } = useRole();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-[var(--topbar-border)] bg-card px-3 md:px-4">
      <SidebarTrigger className="hidden md:inline-flex" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium md:hidden text-foreground">Sledge</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="border border-[var(--bell-border)] text-[var(--bell-fg)]"
        >
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="h-10 gap-2 px-2" />}>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">{user.initials}</AvatarFallback>
            </Avatar>
            <div className="hidden flex-col items-start leading-tight sm:flex">
              <span className="text-sm font-medium text-foreground">{user.name}</span>
              <span className="sledge-role-badge inline-flex h-4 items-center rounded px-1 text-[10px] font-medium uppercase tracking-[0.04em]">
                {roleLabel[role]}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Switch user (mock)</DropdownMenuLabel>
            {employees.map((e) => (
              <DropdownMenuItem key={e.id} onSelect={() => setUserId(e.id)}>
                {e.name} <span className="ml-auto text-xs text-muted-foreground">{e.role}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setTablet(!isTablet)}>
              <Tablet className="mr-2 h-4 w-4" />
              {isTablet ? "Exit tablet mode" : "Enter tablet mode"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
