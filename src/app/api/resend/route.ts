// app/api/resend/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient, AdminUserAttributes } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ROLE! // Must be service role key
);

interface ResendRequestBody {
  email: string;
}

interface ApiResponse {
  message?: string;
  error?: string;
}

/**
 * POST handler - resend verification email
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as ResendRequestBody;

    if (!email) {
      return NextResponse.json<ApiResponse>({ error: "Email is required." }, { status: 400 });
    }

    // 1️⃣ List users in Supabase
    const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("[resend] listUsers error:", listError);
      return NextResponse.json<ApiResponse>({ error: "Server error" }, { status: 500 });
    }

    // 2️⃣ Find user by email
    const user = data.users.find((u: AdminUserAttributes) => u.email === email);

    if (!user) {
      return NextResponse.json<ApiResponse>({ error: "User not found." }, { status: 404 });
    }

    if (user.email_confirmed_at) {
      return NextResponse.json<ApiResponse>({
        message: "Email is already confirmed. You can log in.",
      }, { status: 200 });
    }

    // 3️⃣ Generate a magic link to confirm email
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink", // Send a magic link for confirmation
      email,
      options: { redirectTo: "/auth/verify" }, // Redirect after click
    });

    if (linkError) {
      console.error("[resend] generateLink error:", linkError);
      return NextResponse.json<ApiResponse>({ error: "Failed to send verification email." }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      message: "Verification email sent. Please check your inbox.",
    }, { status: 200 });

  } catch (err: unknown) {
    console.error("[resend] error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json<ApiResponse>({ error: message }, { status: 500 });
  }
}
