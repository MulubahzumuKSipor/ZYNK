import { Suspense } from 'react';
import { supabase } from '@/lib/client';
import ProductClientPage from '@/app/ui/components/productPage';
import { Loader2 } from 'lucide-react';


export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: product, error } = await supabase
  .from('products')
  .select(`
    *,
    brands ( name ),
    product_images ( url, is_primary ),
    product_variants ( id, sku, price ),
    reviews (
      id, rating, review_text, is_verified_purchase,
      users ( email )
    )
  `)
  .eq('id', id)
  .single();

  // INDUSTRY STANDARD: Log errors on the server console
  if (error) {
    console.error("Supabase Error Details:", {
      message: error.message,
      code: error.code,
      hint: error.hint
    });
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="text-gray-500">ID: {id}</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<Loader2 className="animate-spin" />}>
      <ProductClientPage initialProduct={product} productId={id} />
    </Suspense>
  );
}