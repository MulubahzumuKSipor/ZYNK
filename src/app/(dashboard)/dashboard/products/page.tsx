import { createClient } from '@/lib/server';
import ProductManager from '@/app/ui/components/products/product-manager';
import styles from '@/app/ui/styles/manage-product.module.css';

export type ProductData = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category_id?: string; // Add this
  is_active: boolean;
  created_at: string;
  category: { id: string; name: string } | null;
  product_variants: {
    id: string; // Add this so 'upsert' works in the action
    sku: string; // Add this
    stock_quantity: number;
    price: number
  }[];
  product_images: { url: string }[];
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string; page?: string }>;
}) {
  const supabase = await createClient();

  // 1. Unwrapping searchParams for Next.js 15
  const resolvedParams = await searchParams;
  const queryTerm = resolvedParams?.query || '';
  const currentPage = Number(resolvedParams?.page) || 1;
  const itemsPerPage = 10;

  // 2. Fetch categories for the filter dropdowns
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');

  // 3. Build product query
  let dbQuery = supabase
    .from('products')
    .select(
      `
      id,
      name,
      slug,
      is_active,
      created_at,
      category:categories(id, name),
      product_variants(stock_quantity, price),
      product_images(url)
    `,
      { count: 'exact' }
    );

  // 4. Corrected Search Logic (matching your SQL schema)
  if (queryTerm) {
    dbQuery = dbQuery.ilike('name', `%${queryTerm}%`);
  }

  // 5. Pagination calculation
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  const { data: products, count, error } = await dbQuery
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Database Error:', error.message);
  }

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Product Management</h1>
          <p className={styles.subtitle}>
            {count || 0} products found • Page {currentPage} of {totalPages || 1}
          </p>
        </div>
      </div>

      <ProductManager
        initialProducts={(products as unknown as ProductData[]) || []}
        categories={categories || []}
        totalPages={totalPages}
      />
    </div>
  );
}