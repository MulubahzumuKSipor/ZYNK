import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MongoDB_URI;
if (!uri) {
  throw new Error("MongoDB_URI environment variable not set");
}

let client;
let db;


export async function connectToDatabase() {
  if (!db) { // Only initialize if not already connected
    client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to MongoDB Atlas!");
    db = client.db("Ecommerce"); // Make sure this matches your DB name
  }
  return db;
}
