import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import DashHeader from "@/app/ui/components/shared/dash_header";
import DashSidebar from "@/app/ui/components/shared/sidebar";
import DashFooter from "@/app/ui/components/shared/dash_footer";
import { DashboardThemeProvider } from "@/app/ui/components/shared/themeProvider";
import styles from "@/app/ui/styles/layout.module.css";

export const metadata = {
  title: "Admin Dashboard | ZYNK",
  description: "Manage orders, products, and customers.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Get the user session (This contains the app_metadata/roles)
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/?auth=login');
  }

  // 2. Direct Authorization Check
  // We check 'role' inside 'app_metadata' which we just set in your user data
  const isAdmin = user.app_metadata?.role === 'admin';
  const isSuperAdmin = user.app_metadata?.is_super_admin === true;

  if (!isAdmin && !isSuperAdmin) {
    console.error("Access Denied: User metadata does not show admin role");
    redirect('/');
  }

  return (
    <DashboardThemeProvider>
      <div className={styles.container}>
        {/* Sidebar Container */}
        <aside className={styles.sidebarWrapper}>
          <DashSidebar />
        </aside>

        <div className={styles.mainWrapper}>
          {/* Header Container */}
          <header className={styles.headerWrapper}>
            <DashHeader />
          </header>

          {/* Page Content */}
          <main className={styles.content}>
            {children}
          </main>

          {/* Optional Footer */}
          <footer className={styles.footerWrapper}><DashFooter /></footer>
        </div>
      </div>
    </DashboardThemeProvider>
  );
}