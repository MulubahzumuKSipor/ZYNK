import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET all users
export async function GET() {
  try {
    const { rows } = await pool.query("SELECT * FROM users");
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST a new user
export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json();
    const { rows } = await pool.query(
      "INSERT INTO User(name, email, password, phone) VALUES($1, $2, $3, $4) RETURNING *",
      [name, email, password, phone]
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
  }
}
