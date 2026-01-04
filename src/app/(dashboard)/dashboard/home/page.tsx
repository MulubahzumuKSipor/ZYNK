import { createClient } from '@/lib/server';
import styles from '@/app/ui/styles/dashboard.module.css';
import Link from 'next/link';

// 1. Force Dynamic Rendering
export const dynamic = 'force-dynamic';

// --- TYPES ---
interface SalesViewRow {
  date: string;
  total_orders: number | null;
  total_revenue: number | null;
  pending_orders: number | null;
}

interface UserProfile {
  full_name: string | null;
  email: string | null;
}

interface OrderRow {
  id: string;
  created_at: string;
  total: number;
  status: string;
  user: UserProfile | null;
}

// 2. INTERNAL KPI CARD COMPONENT
// Defining this here fixes the "Property 'alert' does not exist" error
interface LocalKPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  isCurrency?: boolean;
  alert?: boolean;
}

function LocalKPICard({ title, value, subtitle, isCurrency, alert }: LocalKPICardProps) {
  return (
    <div className={`${styles.kpiCard} ${alert ? styles.alertCard : ''}`}
         style={{
           padding: '1.5rem',
           borderRadius: '8px',
           border: alert ? '1px solid #ef4444' : '1px solid var(--border-color, #e5e7eb)',
           backgroundColor: alert ? 'rgba(239, 68, 68, 0.05)' : 'var(--card-bg, #ffffff)'
         }}>
      <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>{title}</h3>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        {isCurrency ? `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : value}
      </div>
      {subtitle && (
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: alert ? '#ef4444' : '#6b7280' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// --- MAIN COMPONENT ---
export default async function DashboardOverview() {
  const supabase = await createClient();

  // 3. Parallel Data Fetching
  const [salesRes, customersRes, ordersRes] = await Promise.all([
    supabase.from('view_admin_dashboard_daily_sales').select('*').limit(30),
    supabase.from('view_admin_customer_stats').select('*', { count: 'exact', head: true }),
    supabase.from('orders')
      .select('id, created_at, total, status, user:users(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  const salesData = (salesRes.data as SalesViewRow[]) || [];
  const customerCount = customersRes.count || 0;
  const recentOrders = (ordersRes.data as unknown as OrderRow[]) || [];

  // 4. Calculate Aggregates
  const totalRevenue = salesData.reduce((acc, row) => acc + (row.total_revenue || 0), 0);
  const totalOrders = salesData.reduce((acc, row) => acc + (row.total_orders || 0), 0);
  const totalPending = salesData.reduce((acc, row) => acc + (row.pending_orders || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Dashboard Overview</h1>
          <span className={styles.liveBadge}>● Live Data</span>
        </div>
      </header>

      {/* KPI Section - Using LocalKPICard to avoid TS errors */}
      <section className={styles.kpiGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <LocalKPICard title="Total Revenue (30d)" value={totalRevenue} isCurrency />
        <LocalKPICard title="Total Orders" value={totalOrders} />
        <LocalKPICard title="Active Customers" value={customerCount} />
        <LocalKPICard
          title="Pending Orders"
          value={totalPending}
          subtitle="Needs Action"
          alert={totalPending > 0}
        />
      </section>

      {/* Recent Orders Section */}
      <section className={styles.recentActivity}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Orders</h2>
          <Link href="/dashboard/orders" className={styles.viewAllLink}>
            View All Orders →
          </Link>
        </div>

        <div className={styles.tableCard}>
          <table className={styles.activityTable}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No recent orders found.</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'monospace' }}>#{order.id.slice(0, 8)}...</td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500 }}>{order.user?.full_name || 'Guest User'}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{order.user?.email}</div>
                      </div>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600 }}>${order.total.toFixed(2)}</td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          fontWeight: 'bold',
                          backgroundColor: `${getStatusColor(order.status)}20`,
                          color: getStatusColor(order.status)
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}