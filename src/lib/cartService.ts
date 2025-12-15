import pool from "@/lib/db"
import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"

/**
 * Create or return an existing guest session ID
 */
export function getOrCreateGuestSessionId(req: NextRequest, res: NextResponse): string {
  const existing = req.cookies.get("session_id")?.value
  if (existing) return existing

  const sessionId = randomUUID()
  res.cookies.set("session_id", sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  return sessionId
}

/**
 * Fetch cart items for a user or guest session
 */
export async function getCart(identity: { userId?: string; sessionId?: string }) {
  const { userId, sessionId } = identity
  if (!userId && !sessionId) return []

  const sql = `
    SELECT
      ci.id AS cart_item_id,
      ci.product_variant_id,
      ci.quantity,
      v.price,
      p.title AS product_title
    FROM cart_items ci
    JOIN product_variants v ON ci.product_variant_id = v.id
    JOIN products p ON v.product_id = p.id
    WHERE ${userId ? "ci.user_id = $1" : "ci.session_id = $1"}
    ORDER BY ci.added_at DESC
  `
  const { rows } = await pool.query(sql, [userId ?? sessionId])
  return rows
}

/**
 * Add or update a cart item
 */
export async function addOrUpdateCartItem(
  identity: { userId?: string; sessionId?: string },
  product_variant_id: number,
  quantity: number
) {
  const { userId, sessionId } = identity
  if (!userId && !sessionId) throw new Error("Not authenticated")
  if (!product_variant_id || quantity < 1) throw new Error("Invalid input")

  const sql = userId
    ? `
      INSERT INTO cart_items (user_id, product_variant_id, quantity, added_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (user_id, product_variant_id)
      DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()
      RETURNING id
    `
    : `
      INSERT INTO cart_items (session_id, product_variant_id, quantity, added_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (session_id, product_variant_id)
      DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()
      RETURNING id
    `

  const params = userId ? [userId, product_variant_id, quantity] : [sessionId!, product_variant_id, quantity]
  const { rows } = await pool.query(sql, params)
  return rows[0].id
}

/**
 * Update quantity of a cart item
 */
export async function updateCartItemQuantity(
  identity: { userId?: string; sessionId?: string },
  cart_item_id: number,
  quantity: number
) {
  const { userId, sessionId } = identity
  if (!userId && !sessionId) throw new Error("Not authenticated")
  if (!cart_item_id || quantity < 1) throw new Error("Invalid input")

  const sql = `
    UPDATE cart_items
    SET quantity = $1, updated_at = NOW()
    WHERE id = $2 AND ${userId ? "user_id = $3" : "session_id = $3"}
    RETURNING id
  `
  const { rows } = await pool.query(sql, [quantity, cart_item_id, userId ?? sessionId])
  if (!rows.length) throw new Error("Cart item not found")
  return rows[0].id
}

/**
 * Delete a cart item
 */
export async function deleteCartItem(identity: { userId?: string; sessionId?: string }, cart_item_id: number) {
  const { userId, sessionId } = identity
  if (!userId && !sessionId) throw new Error("Not authenticated")
  if (!cart_item_id) throw new Error("Invalid cart_item_id")

  const sql = `
    DELETE FROM cart_items
    WHERE id = $1 AND ${userId ? "user_id = $2" : "session_id = $2"}
    RETURNING id
  `
  const { rows } = await pool.query(sql, [cart_item_id, userId ?? sessionId])
  if (!rows.length) throw new Error("Cart item not found")
  return rows[0].id
}

/**
 * Merge guest cart into user cart on login
 */
export async function mergeGuestCartToUser(userId: string, sessionId: string) {
  if (!sessionId) return

  const mergeSQL = `
    INSERT INTO cart_items (user_id, product_variant_id, quantity, added_at, updated_at)
    SELECT $1, product_variant_id, quantity, NOW(), NOW()
    FROM cart_items
    WHERE session_id = $2
    ON CONFLICT (user_id, product_variant_id)
    DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW();
  `
  await pool.query(mergeSQL, [userId, sessionId])

  // Remove guest cart items
  await pool.query(`DELETE FROM cart_items WHERE session_id = $1`, [sessionId])
}
