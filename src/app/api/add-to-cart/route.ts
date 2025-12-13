import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

/** Get logged-in user ID */
function getUserId(req: NextRequest): number | null {
  const header = req.headers.get("x-user-id");
  if (!header) return null;
  const n = Number(header);
  return Number.isInteger(n) ? n : null;
}

/** Get or create guest session ID */
function getSessionId(req: NextRequest, res?: NextResponse): string {
  let sessionId = req.cookies.get("session_id")?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    res?.cookies.set("session_id", sessionId, { path: "/", httpOnly: true });
  }
  return sessionId;
}

/** Merge guest cart into user cart on login */
async function mergeGuestCart(userId: number, sessionId: string) {
  if (!sessionId) return;
  const sql = `
    INSERT INTO cart_items (user_id, product_variant_id, quantity, added_at, updated_at)
    SELECT $1, product_variant_id, quantity, added_at, updated_at
    FROM cart_items
    WHERE session_id = $2
    ON CONFLICT (user_id, product_variant_id)
    DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW();
  `;
  await pool.query(sql, [userId, sessionId]);
  // clear guest cart
  await pool.query(`DELETE FROM cart_items WHERE session_id = $1`, [sessionId]);
}

/** GET cart items */
export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const userId = getUserId(req);
    const sessionId = getSessionId(req, res);

    if (!userId && !sessionId) return NextResponse.json([], { status: 200 });

    // If logged-in, merge guest cart first
    if (userId && sessionId) await mergeGuestCart(userId, sessionId);

    const sql = `
      SELECT
        ci.id AS cart_item_id,
        ci.product_variant_id,
        ci.quantity,
        v.price AS price,
        p.title AS product_title
      FROM cart_items ci
      JOIN product_variants v ON ci.product_variant_id = v.id
      JOIN products p ON v.product_id = p.id
      WHERE ${userId ? "ci.user_id = $1" : "ci.session_id = $1"}
      ORDER BY ci.added_at DESC
    `;
    const { rows } = await pool.query(sql, [userId ?? sessionId]);
    return NextResponse.json(rows, { status: 200 });
  } catch (err) {
    console.error("GET /api/cart error:", err);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

/** POST: add or update cart item */
export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const sessionId = getSessionId(req);

    if (!userId && !sessionId) {
      return NextResponse.json({ error: "No user or session found" }, { status: 401 });
    }

    const body = await req.json();
    const product_variant_id = Number(body.product_variant_id);
    const quantity = Number(body.quantity ?? 1);

    if (!product_variant_id || quantity < 1) {
      return NextResponse.json({ error: "Invalid product_variant_id or quantity" }, { status: 400 });
    }

    let sql = "";
    let params: (number | string)[] = [];

    if (userId) {
      sql = `
        INSERT INTO cart_items (user_id, product_variant_id, quantity, added_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (user_id, product_variant_id)
        DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()
        RETURNING id
      `;
      params = [userId, product_variant_id, quantity];
    } else {
      sql = `
        INSERT INTO cart_items (session_id, product_variant_id, quantity, added_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (session_id, product_variant_id)
        DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()
        RETURNING id
      `;
      params = [sessionId!, product_variant_id, quantity];
    }

    const { rows } = await pool.query(sql, params);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Failed to add/update cart" }, { status: 500 });
    }

    return NextResponse.json({ success: true, cart_item_id: rows[0].id }, { status: 200 });
  } catch (err) {
    console.error("POST /api/cart error:", err);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}


/** PATCH: update quantity of a cart item */
export async function PATCH(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const sessionId = getSessionId(req);

    if (!userId && !sessionId) {
      return NextResponse.json({ error: "No user or session found" }, { status: 401 });
    }

    const body = await req.json();
    const cart_item_id = Number(body.cart_item_id);
    const quantity = Number(body.quantity);

    if (!cart_item_id || quantity < 1) {
      return NextResponse.json({ error: "Invalid cart_item_id or quantity" }, { status: 400 });
    }

    const sql = `
      UPDATE cart_items
      SET quantity = $1, updated_at = NOW()
      WHERE id = $2 AND ${userId ? "user_id = $3" : "session_id = $3"}
      RETURNING id
    `;
    const params = [quantity, cart_item_id, userId ?? sessionId];
    const { rows } = await pool.query(sql, params);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/cart error:", err);
    return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const sessionId = getSessionId(req);

    if (!userId && !sessionId) {
      return NextResponse.json({ error: "No user or session found" }, { status: 401 });
    }

    // Get cart_item_id from query params instead of req.json()
    const url = new URL(req.url);
    const cart_item_id = Number(url.searchParams.get("cart_item_id"));

    if (!cart_item_id) {
      return NextResponse.json({ error: "Invalid cart_item_id" }, { status: 400 });
    }

    const sql = `
      DELETE FROM cart_items
      WHERE id = $1 AND ${userId ? "user_id = $2" : "session_id = $2"}
      RETURNING id
    `;
    const params = [cart_item_id, userId ?? sessionId];
    const { rows } = await pool.query(sql, params);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/cart error:", err);
    return NextResponse.json({ error: "Failed to delete cart item" }, { status: 500 });
  }
}
