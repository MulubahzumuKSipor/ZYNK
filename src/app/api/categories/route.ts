import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    // specific query to get categories and maybe a cover image if you have one
    const query = `
      SELECT id, name, description, categories_images
      FROM categories
      ORDER BY name ASC
    `;
    
    const { rows } = await pool.query(query);
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}