import { createClient } from '@/lib/server';
import { redirect } from 'next/navigation';

export default async function DebugAuthPage() {
  const supabase = await createClient();
  
  // 1. Get User Session
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // 2. Attempt to fetch from the users table (to test RLS)
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user?.id || '')
    .single();

  return (
    <div style={{ padding: '6rem 2rem', fontFamily: 'monospace', lineHeight: '1.5' }}>
      <h1>🔐 Admin Access Debugger</h1>
      <hr />

      <section>
        <h2>1. Authentication Status</h2>
        <p>Logged In: {user ? '✅ Yes' : '❌ No'}</p>
        <p>Email: {user?.email}</p>
        {authError && <p style={{ color: 'red' }}>Error: {authError.message}</p>}
      </section>

      <section style={{ background: '#f0f0f0', padding: '1rem', marginTop: '1rem' }}>
        <h2>2. JWT Metadata (The &quot;Key&quot; to the Dashboard)</h2>
        <p>This must contain <strong>&quot;role&quot;: &quot;admin&quot;</strong> for your layout to work.</p>
        <pre>{JSON.stringify(user?.app_metadata, null, 2)}</pre>
      </section>

      <section style={{ marginTop: '1rem' }}>
        <h2>3. Database Profile (RLS Test)</h2>
        <p>If this is empty but the JWT above is correct, your <strong>RLS Policies</strong> are blocking the database read.</p>
        {profileError ? (
          <p style={{ color: 'red' }}>RLS Blocked/Error: {profileError.message}</p>
        ) : (
          <pre>{JSON.stringify(profile, null, 2)}</pre>
        )}
      </section>

      <div style={{ marginTop: '2rem' }}>
        <a href="/dashboard/home" style={{ color: 'blue', textDecoration: 'underline' }}>
          Try going to Dashboard →
        </a>
      </div>
    </div>
  );
}