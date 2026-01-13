// lib/actions/logger.ts
'use server';

import { createClient } from '@/lib/server';

// Define allowed entity types to keep logs consistent
type EntityType = 'Order' | 'Product' | 'Customer' | 'System';

/**
 * Records an activity to the audit log.
 * Safe to use in any server action; fails silently if DB is busy to prevent blocking the user.
 * * @param userId - The UUID of the user performing the action
 * @param action - A descriptive string (e.g., 'order_status_updated')
 * @param entity - The type of object being affected (e.g., 'Order')
 * @param entityId - The UUID of the specific object
 */
export async function logActivity(
  userId: string,
  action: string,
  entity: EntityType,
  entityId: string
) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from('activity_logs').insert({
      user_id: userId,
      action: action, 
      entity: entity, 
      entity_id: entityId,
      // created_at is handled automatically by the database default
    });

    if (error) {
      console.error('Audit Log Error:', error.message);
    }
  } catch (err) {
    // Fail silently so we don't block the main user flow
    console.error('Audit Log Exception:', err);
  }
}