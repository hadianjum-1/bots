const mongoose = require("mongoose");
require("dotenv").config();

async function cleanupIndexes() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ MongoDB Connected");
    
    const db = mongoose.connection;
    const collection = db.collection('clients');
    
    // List current indexes
    const indexes = await collection.listIndexes().toArray();
    console.log("Current indexes:", indexes.map(i => i.name));
    
    // Drop the email index
    const result = await collection.dropIndex('email_1').catch(e => {
      if (e.message.includes("index not found")) {
        console.log("✅ Index 'email_1' does not exist (or already dropped)");
        return null;
      }
      throw e;
    });
    
    if (result) {
      console.log("✅ Successfully dropped 'email_1' index");
    }
    
    // List indexes again
    const newIndexes = await collection.listIndexes().toArray();
    console.log("Indexes after cleanup:", newIndexes.map(i => i.name));
    
    console.log("✅ Index cleanup complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

cleanupIndexes();
