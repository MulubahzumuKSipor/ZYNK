import { createClient } from '@/lib/server';
import PaymentDashboard from '@/app/ui/components/payment/management';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  const supabase = await createClient();

  // 1. Fetch Analytics (Single fast query via View)
  const { data: statsData } = await supabase.from('payment_analytics').select('*').single();
  
  // 2. Fetch Recent Transactions
  const { data: paymentsData } = await supabase
    .from('payments')
    .select('*')
    .order('paid_at', { ascending: false })
    .limit(20);

  // Default values if data is missing
  const stats = statsData || { 
    total_revenue: 0, 
    revenue_30_days: 0, 
    recent_failures: 0, 
    average_order_value: 0 
  };

  return (
    <main style={{ padding: '2rem', background: '#f8f9fa', minHeight: '100vh' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1a1a1a', margin: '0 0 0.5rem 0' }}>
          Payments & Finance
        </h1>
        <p style={{ color: '#666' }}>
          Audit your transaction history and monitor revenue streams.
        </p>
      </header>
      
      <PaymentDashboard 
        stats={stats} 
        initialPayments={paymentsData || []} 
      />
    </main>
  );
}