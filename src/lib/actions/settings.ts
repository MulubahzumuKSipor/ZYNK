'use server';

import { createClient } from '@/lib/server';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/actions/logger';

export async function updateStoreSettings(formData: FormData) {
  const supabase = await createClient();
  const settingsId = formData.get('id') as string;
  
  const updates = {
    store_name: formData.get('store_name'),
    support_email: formData.get('support_email'),
    currency: formData.get('currency'),
    timezone: formData.get('timezone'),
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('store_settings')
    .update(updates)
    .eq('id', settingsId);

  if (error) throw error;

  // Log it
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await logActivity(user.id, 'store_settings_updated', 'System', settingsId);
  }

  revalidatePath('/dashboard/settings');
  return { success: true };
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const userId = formData.get('userId') as string;
  
  const updates = {
    full_name: formData.get('full_name'),
    email: formData.get('email'), // Note: Changing email in Auth usually requires re-confirmation logic
    updated_at: new Date().toISOString()
  };

  // 1. Update Public Profile
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;

  revalidatePath('/dashboard/settings');
  return { success: true };
}