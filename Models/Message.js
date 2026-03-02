const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  clientId: String,
  role: String,
  content: String,
  messageType: { type: String, default: "text" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", MessageSchema);