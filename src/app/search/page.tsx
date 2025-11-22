"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/app/types/product";

const safeFormatPrice = (v: unknown) => {
  if (v == null || v === "") return "N/A";
  const n = typeof v === "number" ? v : parseFloat(String(v));
  if (Number.isNaN(n)) return "N/A";
  return Number.isInteger(n) ? `${n}` : n.toFixed(2);
};

export default function SearchPage() {
  const params = useSearchParams();
  const query = params.get("query") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/products`);
        const json = await res.json();
        const all: Product[] = json.products ?? json;

        const q = query.toLowerCase();
        const filtered = all.filter((p: Product) => {
          const str = [
            p.title,
            p.brand,
            p.sku,
            p.description,
            ...(p.categories?.map((c) => c.name) ?? []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return str.includes(q);
        });

        setProducts(filtered);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [query]);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: 900, margin: "0 auto" }}>
      <h1>Search results for: {query}</h1>
      <p>{products.length} products found</p>

      {products.length === 0 && <p>No products match your search.</p>}

      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {products.map((p, idx) => {
          const key = p.product_id ?? p.external_id ?? p.sku ?? idx; // stable key
          const title = p.title ?? p.name ?? "Untitled product";
          const imageUrl = p.images?.[0]?.image_url;

          return (
            <li
              key={key}
              style={{
                display: "flex",
                gap: 12,
                padding: 10,
                borderBottom: "1px solid #f1f1f1",
                alignItems: "center",
              }}
            >
              <div style={{ width: 64, height: 64, background: "#f6f6f6", borderRadius: 6 }}>
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={title}
                    width={64}
                    height={64}
                    style={{ objectFit: "cover", borderRadius: 6 }}
                  />
                ) : (
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                    }}
                  >
                    No image
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontWeight: 600 }}>{title}</div>
                  <div>${safeFormatPrice(p.price)}</div>
                </div>
                <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>
                  {p.brand ? `by ${p.brand}` : p.sku ? `sku: ${p.sku}` : null} • Stock: {p.stock_quantity ?? "N/A"}
                </div>
                {p.description && (
                  <div style={{ marginTop: 6, fontSize: 13, color: "#444" }}>
                    {String(p.description).slice(0, 120)}
                    {String(p.description).length > 120 ? "…" : ""}
                  </div>
                )}
              </div>

              <div>
                <Link href={`/shop/${p.product_id ?? p.external_id}`} style={{ fontSize: 13, color: "#0066cc" }}>
                  View
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
