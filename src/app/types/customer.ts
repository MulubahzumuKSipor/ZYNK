export interface Customer {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string | null;
}