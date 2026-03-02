const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({
  clientId: String,
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Lead", LeadSchema);