import { createClient } from '@/lib/server';
import SettingsManager from '@/app/ui/components/settings/management';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();

  // 1. Get Current User
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  // 2. Get User Profile (for full_name)
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser?.id)
    .single();

  // 3. Get Store Settings (Singleton)
  const { data: storeSettings } = await supabase
    .from('store_settings')
    .select('*')
    .limit(1)
    .single();

  return (
    <main style={{ padding: '2rem', background: '#f8f9fa', minHeight: '100vh' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1a1a1a', margin: '0 0 0.5rem 0' }}>
          Settings
        </h1>
        <p style={{ color: '#64748b' }}>
          Configure global store preferences and personal profile.
        </p>
      </header>
      
      <SettingsManager 
        user={userProfile || {}} 
        storeSettings={storeSettings || {}} 
      />
    </main>
  );
}