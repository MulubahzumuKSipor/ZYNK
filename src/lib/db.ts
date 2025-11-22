import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.EXTERNAL_URL,
    ssl: {rejectUnauthorized: false}
});


// pool.query("SELECT NOW()")
//   .then(res => console.log("Connected to Render DB:", res.rows))
//   .catch(err => console.error("DB connection error:", err))
//   .finally(() => pool.end());

export default pool;