
export interface KeyMetrics {
  totalRevenue: number;
  orders: {
    today: number;
    week: number;
    month: number;
  };
  conversionRate: number;
  averageOrderValue: number;
  pendingOrders: number;
  fulfilledOrders: number;
  canceledOrders: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}