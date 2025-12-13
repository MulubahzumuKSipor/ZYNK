import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { authMiddleware } from "@/lib/middleware";
import type { User } from "@supabase/supabase-js";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authMiddleware(req);

    if (authResult instanceof NextResponse) return authResult;

    const authUser: User = authResult;
    const { id } = await context.params;

    if (!id) return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    if (authUser.id !== id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rows } = await pool.query(
      `SELECT id, username, email, role, status FROM users WHERE user_id = $1`,
      [id]
    );

    if (!rows || rows.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user: rows[0] }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/users/[id]] error:", err);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
