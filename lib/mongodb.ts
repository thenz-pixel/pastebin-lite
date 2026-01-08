import { MongoClient, Db } from "mongodb";

let client: MongoClient;
let db: Db;

export async function getDb() {
  if (db) return db;

  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not defined");

  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db(); // uses default DB from connection string
  return db;
}
