const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://thendralm11_db_user:N1S0SHabPoai1wuw@cluster0.fdir9xi.mongodb.net/?retryWrites=true&w=majority";

async function test() {
  const client = new MongoClient(uri, {
    tlsCAFile: undefined,  // optional, forces Node.js CA bundle
    tlsAllowInvalidCertificates: false,
    tls: true,
    minPoolSize: 1,
  });

  try {
    await client.connect();
    console.log("✅ Connected successfully");
  } catch (err) {
    console.error("❌ Connection failed:", err);
  } finally {
    await client.close();
  }
}

test();

