import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI!
const client = new MongoClient(uri)

let clientPromise: Promise<MongoClient>

if (!global._mongoClientPromise) {
  global._mongoClientPromise = client.connect()
}

clientPromise = global._mongoClientPromise

export async function getDb() {
  const client = await clientPromise
  return client.db()
}
