import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950">
      <Sidebar className="w-64" />
      <main className="lg:pl-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}