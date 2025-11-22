import { Product } from "@/app/types/product";
import { Suggestion } from "@/app/types/suggestion";

const API_URL = "http://localhost:3000/api/products";

export async function fetchProductSuggestions(
  q: string,
  options?: { signal?: AbortSignal }
): Promise<Suggestion<Product>[]> {
  if (!q.trim()) return [];

  try {
    const res = await fetch(`${API_URL}?q=${encodeURIComponent(q)}&limit=10`, {
      signal: options?.signal,
    });
    if (!res.ok) return [];

    const data = await res.json();
    const products: Product[] = Array.isArray(data) ? data : data.products || [];

    return products.map((p) => ({
      id: p.product_id,
      label: p.title,
      value: p,
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
}
