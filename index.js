// index.js (Revised)

import express from "express";
import cors from "cors";
import { connectToDatabase } from "./src/backend_routes/lib/database.js"; // Ensure path is correct
import { ObjectId } from "mongodb";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Remove 'let db;' from global scope. We will pass the connection.

async function startServer() {
  let db; // Scope the db variable locally



  try {
    db = await connectToDatabase();
    console.log("Database connection successful. Starting server...");

    // --- Get all products (with optional search query) ---
    app.get("/ecommerce", async (req, res) => {
      try {
        const { q } = req.query;
        let filter = {};
        if (q && q.trim() !== "") {
          filter = { title: { $regex: q, $options: "i" } };
        }
        const products = await db.collection("products").find(filter).toArray();
        res.json({ products });
      } catch (error) {
        console.error("Database query failed:", error);
        res.status(500).send("Server Error during data retrieval");
      }
    });

    // --- Get a single product by ID ---
    app.get("/ecommerce/products/:id", async (req, res) => {
      const { id } = req.params;

      try {
        // 1. INPUT VALIDATION: Check if the string can be a valid MongoDB ObjectId
        // This prevents a 500 error and returns a helpful 400 error.
        if (!ObjectId.isValid(id)) {
          // Use 400 Bad Request for invalid client input
          return res.status(400).json({ error: "Invalid product ID format" });
        }

        // 2. QUERY CORRECTION: Query by the standard '_id' field
        // and convert the string 'id' to a MongoDB ObjectId type.
        const product = await db
          .collection("products")
          .findOne({ _id: new ObjectId(id) });

        if (!product) {
          // Use 404 Not Found if the format is correct but no product exists
          return res.status(404).json({ error: "Product not found" });
        }

        res.json(product);
      } catch (error) {
        // This is for unexpected server/database errors
        console.error("Failed to fetch product:", error);
        res.status(500).json({ error: "Server error" });
      }
    });
    // --- End API Routes ---

    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error("Failed to connect to the database. Server shutting down.", error);
    process.exit(1);
  }
}

startServer();