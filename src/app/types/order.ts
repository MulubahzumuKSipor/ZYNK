// 1. DATABASE TYPES (Matching your SQL exactly)
interface DBOrderItem {
  id: string;
  quantity: number;
  price_snapshot: number;
  product_name_snapshot: string;
  variant_snapshot: string;
  product_variant: {
    id: string;
    sku: string;
    product: { id: string; name: string; };
  } | null;
}

export interface DBOrder {
  id: string;
  user_id: string;
  status: string;
  total: number;
  created_at: string;
  user: { id: string; email: string; full_name: string; } | null;
  order_items: DBOrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  // Live UI fields (Mapped from snapshots)
  price_at_purchase: number;
  name: string;
  variant: string;

  // Database snapshots (Original fields)
  price_snapshot?: number;
  product_name_snapshot?: string;
  variant_snapshot?: string;

  // Relation to the actual product variant
  product_variant?: {
    id?: string;
    sku: string;
    stock_quantity?: number; // Useful for the "Low Stock" alerts in the table
    product: {
      id?: string;
      name: string;
    };
  } | null;
}
export interface InternalNote {
  text: string;
  created_by: string;
  created_at: string;
}

// Ensure the Order interface includes payments and internal_notes
export interface Order {
  id: string;
  order_number?: string;
  status: string;
  total_amount: number;
  created_at: string;
  user?: {
    email: string;
    full_name: string;
  };
  order_items: OrderItem[];
  payments?: {
    payment_method: string;
    status: string;
    amount: number;
  }[];
  internal_notes?: InternalNote[];
  total?: number;
}

export interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
}

export interface OrdersManagerProps {
  initialOrders: Order[];
  totalPages: number;
}

// In your types file or at the top of the component
export interface OrderItemWithStock {
  id: string;
  quantity: number;
  product_variant?: {
    sku: string;
    stock_quantity: number; // Added for the low stock check
    product: { name: string };
  };
}



export interface OrdersTableProps {
  orders: Order[];
  selectedIds: Set<string>;
  onSelectAll: () => void;
  onSelectRow: (id: string) => void;
  onViewDetails: (order: Order) => void;
}