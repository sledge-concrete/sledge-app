"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Hammer } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { navItems } from "@/lib/nav";
import { useRole, canAccess } from "@/lib/role-context";

const roleLabel: Record<string, string> = {
  admin: "Administrator",
  supervisor: "Supervisor",
  employee: "Employee",
  tablet: "Tablet",
};

export function AppSidebar() {
  const pathname = usePathname();
  const { role, user } = useRole();

  const visible = navItems.filter((n) => canAccess(role, n.key));
  const moduleItems = visible.filter((n) => n.key !== "admin");
  const systemItems = visible.filter((n) => n.key === "admin");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Hammer className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-base font-medium text-white">Sledge Concrete</span>
            <span className="text-xs text-white/40">Field Ops</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {moduleItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton render={<Link href={item.href} />} isActive={active} tooltip={item.label}>
                      <item.icon className="size-5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {systemItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {systemItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton render={<Link href={item.href} />} isActive={active} tooltip={item.label}>
                        <item.icon className="size-5" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 border-t border-white/[0.08] px-2 py-3 group-data-[collapsible=icon]:hidden">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-medium text-white">{user.name}</span>
            <span className="truncate text-xs text-white/40">{roleLabel[role]}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-white/40" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
