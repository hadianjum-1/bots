const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("MongoDB Connected");
    
    // Clean up old indexes from previous schema versions
    const db = mongoose.connection.db;
    if (db) {
      db.collection('clients').dropIndex('email_1').catch(() => {
        // Index doesn't exist or already dropped
      });
    }
  })
  .catch(err => console.error(err));

module.exports = mongoose;