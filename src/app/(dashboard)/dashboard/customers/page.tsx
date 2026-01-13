import { createClient } from '@/lib/server';
import CustomersManager from '@/app/ui/components/customers/management';
import styles from '@/app/ui/styles/customers.module.css';
import { Customer } from '@/app/types/customer';

export const dynamic = 'force-dynamic';

async function getCustomers(params: {
  query?: string;
  page?: string;
}) {
  const supabase = await createClient();
  const page = Number(params.page) || 1;
  const perPage = 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // We query the VIEW 'customer_overviews' instead of the raw table
  // This gives us pre-calculated totals (speed!)
  let queryBuilder = supabase
    .from('customer_overviews')
    .select('*', { count: 'exact' });

  // Search Filter
  if (params.query) {
    const q = params.query;
    queryBuilder = queryBuilder.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data, error, count } = await queryBuilder
    .order('created_at', { ascending: false }) // or order by total_spent
    .range(from, to);

  if (error) {
    console.error('Error fetching customers:', error);
    return { customers: [], totalPages: 0 };
  }

  return {
    customers: data as Customer[],
    totalPages: Math.ceil((count || 0) / perPage),
  };
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const { customers, totalPages } = await getCustomers(resolvedSearchParams);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.description}>
            View and manage your customer base and their purchase history.
          </p>
        </div>
      </header>

      <section>
        <CustomersManager initialCustomers={customers} totalPages={totalPages} />
      </section>
    </main>
  );
}