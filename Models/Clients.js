const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  clientId: { type: String, unique: true, required: true },
  apiKey: { type: String, unique: true, sparse: true },
  businessName: { type: String, required: true },
  businessEmail: { type: String, required: true },
  businessData: String,
  model: { type: String, default: "llama-3.1-8b-instant" },
  plan: { type: String, default: "starter" },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Client", ClientSchema);