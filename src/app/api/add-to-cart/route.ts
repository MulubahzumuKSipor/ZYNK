import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/serverClient"
import {
  getCart,
  addOrUpdateCartItem,
  updateCartItemQuantity,
  deleteCartItem,
  getOrCreateGuestSessionId,
  mergeGuestCartToUser,
} from "@/lib/cartService"

/**
 * Get logged-in user ID
 */
async function getUserId(): Promise<string | undefined> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? undefined
}

/* -------------------------------------------------------------------------- */
/*                                   GET                                      */
/* -------------------------------------------------------------------------- */

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId()
    const sessionId = req.cookies.get("session_id")?.value ?? undefined
    const items = await getCart({ userId, sessionId })
    return NextResponse.json(items)
  } catch (err) {
    console.error("GET /api/add-to-cart error:", err)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

/* -------------------------------------------------------------------------- */
/*                                   POST                                     */
/* -------------------------------------------------------------------------- */

export async function POST(req: NextRequest) {
  try {
    const userId = (await getUserId()) ?? undefined
    const res = NextResponse.json({}) // for setting cookies
    const sessionId = userId ? undefined : getOrCreateGuestSessionId(req, res)

    const { product_variant_id, quantity = 1 } = await req.json()
    const cart_item_id = await addOrUpdateCartItem({ userId, sessionId }, product_variant_id, quantity)

    return NextResponse.json({ success: true, cart_item_id })
  } catch (err) {
    console.error("POST /api/add-to-cart error:", err)
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 })
  }
}

/* -------------------------------------------------------------------------- */
/*                                   PATCH                                    */
/* -------------------------------------------------------------------------- */

export async function PATCH(req: NextRequest) {
  try {
    const userId = (await getUserId()) ?? undefined
    const sessionId = req.cookies.get("session_id")?.value ?? undefined
    const { cart_item_id, quantity } = await req.json()
    await updateCartItemQuantity({ userId, sessionId }, cart_item_id, quantity)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("PATCH /api/add-to-cart error:", err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

/* -------------------------------------------------------------------------- */
/*                                   DELETE                                   */
/* -------------------------------------------------------------------------- */

export async function DELETE(req: NextRequest) {
  try {
    const userId = (await getUserId()) ?? undefined
    const sessionId = req.cookies.get("session_id")?.value ?? undefined
    const cart_item_id = Number(new URL(req.url).searchParams.get("cart_item_id"))
    await deleteCartItem({ userId, sessionId }, cart_item_id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/add-to-cart error:", err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
