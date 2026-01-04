"use client";

import { useEffect, useState } from "react";
import styles from "@/app/ui/styles/orders.module.css";
import { Loader2, ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/client";

// Define strict types matching DB
interface OrderItem {
  id: string;
  product_name_snapshot: string;
  quantity: number;
  price_snapshot: number;
}

interface Order {
  id: string; // UUID
  total: number;
  status: string;
  created_at: string;
  // Supabase returns nested data on this key if we select it
  order_items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]); // UUIDs are strings

  useEffect(() => {
    async function fetchOrders() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // FETCH DIRECTLY FROM SUPABASE
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total,
          status,
          created_at,
          order_items (
            id,
            product_name_snapshot,
            quantity,
            price_snapshot
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) console.error(error);
      else setOrders(data as unknown as Order[]);

      setLoading(false);
    }

    fetchOrders();
  }, []);

  const toggleOrder = (orderId: string) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  if (loading) return <div className={styles.loader}><Loader2 className="animate-spin" /></div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your Orders</h1>

      {orders.length === 0 ? (
        <div className={styles.empty}>
          <h2>No orders found</h2>
        </div>
      ) : (
        <ul className={styles.orderList}>
          {orders.map((order) => (
            <li key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader} onClick={() => toggleOrder(order.id)}>
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} />
                  <span>#{order.id.slice(0, 8)}...</span>
                </div>
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
                <span className={styles.statusBadge}>{order.status}</span>
                {expandedOrders.includes(order.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              <div className="flex justify-between px-4 py-2 font-bold">
                <span>Total</span>
                <span>${order.total}</span>
              </div>

              {expandedOrders.includes(order.id) && (
                <ul className={styles.orderItems}>
                  {order.order_items.map((item) => (
                    <li key={item.id} className={styles.item}>
                      <span>{item.product_name_snapshot}</span>
                      <span>x{item.quantity}</span>
                      <span>${item.price_snapshot}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}