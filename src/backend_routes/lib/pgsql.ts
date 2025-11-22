// lib/pgsql.ts
import { Pool, QueryResult, QueryResultRow } from "pg";

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_SSLMODE,
} = process.env;

if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD) {
  throw new Error("Missing Postgres environmental variables. Check '.env'!");
}

const pool = new Pool({
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  ssl: DB_SSLMODE === "require" ? { rejectUnauthorized: false } : false,
});

pool.on("connect", () => {
  console.log("✅ Postgres pool connected");
});

pool.on("error", (err) => {
  console.error("❌ Postgres pool error:", err);
});


export async function query<
  T extends QueryResultRow = QueryResultRow
>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  // optional: console.log(`Executed query in ${duration}ms`);
  return res;
}
