import { createClient } from '@/lib/server';
import ActivityManager from '@/app/ui/components/activity/management';
import styles from '@/app/ui/styles/activity.module.css';

export const dynamic = 'force-dynamic';

export default async function ActivityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Fetch Notifications (For the current user)
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(50);

  // 2. Fetch Audit Logs (Global system events)
  const { data: logs } = await supabase
    .from('activity_feed')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <main style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#0f172a' }}>
          Activity Center
        </h1>
        <p style={{ color: '#64748b' }}>
          Manage your personal alerts and review system-wide events.
        </p>
      </header>

      <ActivityManager
        initialNotifications={notifications || []}
        initialLogs={logs || []}
      />
    </main>
  );
}