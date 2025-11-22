import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id AS product_id,
        p.title,
        p.description,
        p.brand,
        p.rating,
        v.id AS variant_id,
        v.sku,
        v.price,
        v.compare_at_price,
        v.stock_quantity,
        c.id AS category_id,
        c.name AS category_name,
        json_agg(
          json_build_object(
            'image_url', i.image_url,
            'thumbnail_url', i.thumbnail_url,
            'display_order', i.display_order
          )
          ORDER BY i.display_order
        ) AS images
      FROM products p
      LEFT JOIN product_variants v ON v.product_id = p.id
      LEFT JOIN product_categories pc ON pc.product_id = p.id
      LEFT JOIN categories c ON c.id = pc.category_id
      LEFT JOIN product_images i ON i.product_id = p.id
      GROUP BY p.id, v.id, c.id;
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST a new products
// export async function POST(request: NextRequest) {
//   try {
//     const { name, email, password, phone } = await request.json();
//     const { rows } = await pool.query(
//       "INSERT INTO User(name, email, password, phone) VALUES($1, $2, $3, $4) RETURNING *",
//       [name, email, password, phone]
//     );
//     return NextResponse.json(rows[0]);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
//   }
// }
