import { createClient } from '@/lib/server';
import RolesManager from '@/app/ui/components/roles/management';

export const dynamic = 'force-dynamic';

export default async function RolesPage() {
  const supabase = await createClient();

  // Fetch only active staff members (excluding customers if you prefer)
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, email, role')
    .eq('is_active', true)
    .neq('role', 'customer') // We usually don't manage customers in the Admin Roles page
    .order('full_name');

  return (
    <main style={{ padding: '2rem', background: '#f8f9fa', minHeight: '100vh' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1a1a1a', margin: '0 0 0.5rem 0' }}>
          Roles & Permissions
        </h1>
        <p style={{ color: '#64748b' }}>
          Configure access levels and manage team permissions.
        </p>
      </header>

      <RolesManager users={users || []} />
    </main>
  );
}