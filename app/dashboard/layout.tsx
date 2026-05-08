import { Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { AppBottomNav } from "@/components/app-bottom-nav";
import { TabletFlagReader } from "@/components/tablet-flag-reader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider style={{ "--sidebar-width-icon": "4rem" } as React.CSSProperties}>
      <Suspense fallback={null}>
        <TabletFlagReader />
      </Suspense>
      <AppSidebar />
      <SidebarInset>
        <AppTopbar />
        <main className="flex-1 px-3 pb-24 pt-4 md:px-6 md:pb-6">{children}</main>
        <AppBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
