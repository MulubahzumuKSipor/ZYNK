'use server';

import { createClient } from '@/lib/server'; // Standard client for auth checks
import { createClient as createAdminClient } from '@supabase/supabase-js'; // Admin client for privileged ops
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/actions/logger';

// Helper: Get Admin Client (Bypasses RLS)
function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

/**
 * Updates a user's role in the database.
 */
export async function updateUserRole(targetUserId: string, newRole: string) {
  const supabase = await createClient();
  
  // 1. Security Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // 2. Update Role
  const { error } = await supabase
    .from('users')
    .update({
      role: newRole,
      updated_at: new Date().toISOString()
    })
    .eq('id', targetUserId);

  if (error) throw error;

  // 3. Log Activity
  await logActivity(user.id, `role_change_to_${newRole}`, 'System', targetUserId);

  revalidatePath('/dashboard/roles');
  return { success: true };
}

/**
 * Soft-deletes a user (sets is_active to false).
 */
export async function removeUser(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('users')
    .update({ is_active: false })
    .eq('id', targetUserId);

  if (error) throw error;

  await logActivity(user.id, 'user_deactivated', 'System', targetUserId);

  revalidatePath('/dashboard/roles');
  return { success: true };
}

/**
 * Invites a new user via Email and creates a public profile.
 */
export async function inviteUser(formData: FormData) {
  const email = formData.get('email') as string;
  const role = formData.get('role') as string;

  const supabase = await createClient();
  const { data: { user: requester } } = await supabase.auth.getUser();

  if (!requester) throw new Error('Unauthorized');

  const supabaseAdmin = getAdminSupabase();

  // 1. Send Supabase Auth Invite
  const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { role: role } // Store initial role in metadata
  });

  if (inviteError) {
    throw new Error(inviteError.message);
  }

  // 2. Create Public Profile immediately (so they show up in the table as "Pending")
  // Note: Your 'users' table might rely on triggers, but manual insert is safer for invites
  if (data.user) {
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: data.user.id,
        email: email,
        role: role,
        full_name: '', // Will be updated by user on signup
        is_active: true
      });

    if (dbError) {
      console.error('Failed to create public user profile:', dbError);
      // We don't throw here because the Auth invite was successful
    }
  }

  // 3. Log Activity
  await logActivity(requester.id, 'user_invited', 'System', 'New User');

  revalidatePath('/dashboard/roles');
  return { success: true };
}