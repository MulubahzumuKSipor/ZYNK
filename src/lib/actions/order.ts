// lib/actions/orders.ts
'use server';

import { createClient } from '@/lib/server';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('orders')
    .update({ 
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);

  if (error) throw error;

  // Log the status change
  await supabase.from('order_history').insert({
    order_id: orderId,
    action: 'status_updated',
    old_value: null,
    new_value: newStatus,
    created_at: new Date().toISOString()
  });

  revalidatePath('/dashboard/orders');
  return { success: true };
}

export async function addInternalNote(orderId: string, noteText: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('order_notes')
    .insert({
      order_id: orderId,
      note_text: noteText,
      is_internal: true,
      created_at: new Date().toISOString()
    });

  if (error) throw error;

  revalidatePath('/dashboard/orders');
  return { success: true };
}

export async function exportOrdersToCSV(orderIds: string[] | null) {
  const supabase = await createClient();
  
  let query = supabase
    .from('orders')
    .select(`
      *,
      user:users(email, full_name),
      order_items(quantity, price_at_purchase, product_variant:product_variants(sku))
    `);

  if (orderIds) {
    query = query.in('id', orderIds);
  }

  const { data } = await query;

  // Convert to CSV format
  const csv = [
    ['Order ID', 'Customer', 'Email', 'Status', 'Total', 'Date'].join(','),
    ...(data || []).map(order =>
      [
        order.id,
        order.user?.full_name || '',
        order.user?.email || '',
        order.status,
        order.total_amount,
        new Date(order.created_at).toLocaleDateString()
      ].join(',')
    )
  ].join('\n');

  // Download on client side (this needs to be called from client component)
  return { success: true, csv };
}