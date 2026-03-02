const Client = require("../Models/Clients");

/**
 * Validate API key from header or query parameter
 * Attaches client data to req.client
 */
async function validateApiKey(req, res, next) {
  try {
    // Get API key from header (Authorization: Bearer APIKEY) or query param (?api_key=APIKEY)
    let apiKey = req.headers.authorization?.replace("Bearer ", "") || 
                 req.query.api_key || 
                 req.body.api_key;

    if (!apiKey) {
      return res.status(401).json({ 
        message: "Missing API key. Provide via header (Authorization: Bearer YOUR_KEY) or query parameter (?api_key=YOUR_KEY)" 
      });
    }

    // Find client by API key
    const client = await Client.findOne({ apiKey, active: true });
    if (!client) {
      return res.status(403).json({ 
        message: "Invalid or inactive API key." 
      });
    }

    // Attach client to request for use in routes
    req.client = client;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Authentication error." });
  }
}

module.exports = { validateApiKey };
