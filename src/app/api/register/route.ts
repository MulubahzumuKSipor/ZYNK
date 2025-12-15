// app/api/register/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { supabase } from "@/lib/client";

/**
 * Types
 */
type UserType = "user" | "buyer" | "seller" | "exclusive buyer" | "exclusive seller";

interface RegisterRequestBody {
  username: string;
  email: string;
  phone: string;
  password: string;
  user_type?: UserType;
}

interface ApiResponse {
  message?: string;
  error?: string;
  user?: Record<string, unknown> | null;
  redirect?: string;
}

/**
 * POST handler
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterRequestBody;
    const { username, email, phone, password, user_type } = body;

    if (!username || !email || !phone || !password) {
      return NextResponse.json<ApiResponse>({ error: "All fields are required" }, { status: 400 });
    }

    // ✅ Check if email already exists in Postgres (only confirmed users are here)
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const existingUser = rows[0];

    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        error: "Email already exists. Did you forget your password?",
        redirect: "/auth/forgot-password?email=" + encodeURIComponent(email),
      }, { status: 409 });
    }

    // ✅ Create user in Supabase (anon client)
    const signUpResp = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `/auth/resend`,
      },
    });

    if (signUpResp.error) {
      return NextResponse.json<ApiResponse>({ error: signUpResp.error.message }, { status: 400 });
    }

    const userId = signUpResp.data.user?.id;
    if (!userId) {
      return NextResponse.json<ApiResponse>({ error: "Failed to create user" }, { status: 500 });
    }


    return NextResponse.json<ApiResponse>({
      message: "User registered. Please check your email to verify your account.",
    }, { status: 200 });

  } catch (err: unknown) {
    console.error("[register] error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json<ApiResponse>({ error: message }, { status: 500 });
  }
}
