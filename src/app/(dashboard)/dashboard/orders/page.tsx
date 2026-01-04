import { createClient } from '@/lib/server'; // Use the server client (same as dashboard)
import OrdersManager from '@/app/ui/components/orders/order-management';
import styles from '@/app/ui/styles/orders.module.css';
import { Order, OrderItem as DBOrderItem } from '@/app/types/order';



export const dynamic = 'force-dynamic';

async function getOrders(params: {
  query?: string;
  status?: string;
  page?: string;
}) {
  const supabase = await createClient();
  const page = Number(params.page) || 1;
  const status = params.status?.toLowerCase() || 'all'; // Normalize status to lowercase
  const perPage = 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // Build the query exactly like the working dashboard query, but with filters
  let queryBuilder = supabase
    .from('orders')
    .select(`
      id,
      created_at,
      status,
      total,
      user:users(id, email, full_name),
      order_items(
        id,
        quantity,
        price_snapshot,
        product_name_snapshot,
        variant_snapshot,
        product_variant:product_variants(
          id,
          sku,
          product:products(id, name)
        )
      )
    `, { count: 'exact' });

  // 1. Status Filter (Matches lowercase values like 'paid', 'pending')
  if (status !== 'all') {
    queryBuilder = queryBuilder.eq('status', status);
  }

  // 2. Search Filter (UUID casting for PostgreSQL)
  if (params.query) {
    queryBuilder = queryBuilder.or(`id.cast.text.ilike.%${params.query}%`);
  }

  const { data, error, count } = await queryBuilder
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching orders:', error);
    return { orders: [], totalPages: 0 };
  }

  // 3. Data Transformation (Mapping DB fields to UI fields)
  const formattedOrders: Order[] = (data as unknown as Order[] || []).map((order: Order) => ({
    id: order.id,
    status: order.status,
    created_at: order.created_at,
    total_amount: Number(order.total) || 0,
    user: order.user ? {
      email: order.user.email,
      full_name: order.user.full_name
    } : undefined,
    order_items: (order.order_items || []).map((item: DBOrderItem) => ({
      id: item.id,
      quantity: item.quantity,
      price_at_purchase: Number(item.price_snapshot) || 0,
      // FIX: Provide fallbacks to prevent 'undefined' passing into a 'string' type
      name: item.product_name_snapshot ?? "Unknown Product",
      variant: item.variant_snapshot ?? "Default",
      product_variant: item.product_variant ? {
        sku: item.product_variant.sku,
        product: { name: item.product_variant.product.name }
      } : null
    }))
  }));
  return {
    orders: formattedOrders,
    totalPages: Math.ceil((count || 0) / perPage),
  };
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const { orders, totalPages } = await getOrders(resolvedSearchParams);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Orders</h1>
          <p className={styles.description}>
            Manage and track all customer transactions from your database.
          </p>
        </div>
      </header>

      <section>
        <OrdersManager initialOrders={orders} totalPages={totalPages} />
      </section>
    </main>
  );
}

