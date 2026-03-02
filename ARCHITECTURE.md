# Code Architecture & Changes Summary

## What's New: Multi-Tenant API Key Security

Your chatbot system has been upgraded to a **secure, multi-tenant SaaS model** where each client gets isolated access with unique API keys.

---

## Files Modified

### 1. **Models/Clients.js** ✅
**Changes:**
- Added `apiKey` field (auto-generated from crypto.randomBytes)
- Added `businessEmail` field (client's email for lead notifications)
- Added `active` boolean flag (disable clients if needed)
- Added timestamps (createdAt, updatedAt)
- Added pre-save hook to auto-generate API key if missing

**Before:**
```javascript
{ clientId, businessName, model, plan, businessData }
```

**After:**
```javascript
{
  clientId,
  apiKey,           // ← NEW: Unique per client
  businessName,
  businessEmail,    // ← NEW: Client's contact email
  businessData,
  model,
  plan,
  active,           // ← NEW: Enable/disable client
  createdAt,        // ← NEW
  updatedAt         // ← NEW
}
```

---

### 2. **middleware/authMiddleware.js** ✅ (NEW FILE)
**Purpose:** Validate API keys on protected routes

**Features:**
- Accepts key from header: `Authorization: Bearer KEY`
- Accepts key from query: `?api_key=KEY`
- Accepts key from body: `{ api_key: KEY }`
- Returns 401 if missing, 403 if invalid
- Attaches `req.client` to request for downstream use

**Usage:**
```javascript
Router.post("/protected-route", validateApiKey, handler)
```

---

### 3. **Routes/Route.js** ✅
**Major Changes:**

#### A. Import Middleware
```javascript
const { validateApiKey } = require("../middleware/authMiddleware");
```

#### B. Chat Endpoint
**Before:** `POST /api/chat/:clientId` (no security)
**After:** `POST /api/chat` (protected with validateApiKey)

- Removes `:clientId` URL param
- Uses `req.client` from middleware
- Still supports text + image messages

#### C. Lead Endpoint
**Before:** `POST /api/lead/:clientId` (no security)
**After:** `POST /api/lead` (protected with validateApiKey)

- Sends notifications to `client.businessEmail` instead of hardcoded env var
- Uses `req.client` from middleware

#### D. New Endpoints

**POST /api/clients/register** (Public)
- No auth required
- Payload: `{ clientId, businessName, businessEmail, businessData }`
- Returns: Client data + API key (only shown once!)
- Prevents duplicate clientIds

**PUT /api/clients/update** (Protected)
- Requires API key
- Payload: `{ businessName?, businessEmail?, businessData?, model?, plan? }`
- Updates client settings (training data, email, model preference)

**GET /api/clients/info** (Protected)
- Requires API key
- Returns: Current client configuration

---

### 4. **public/widget.js** ✅
**Changes:**

**Before:**
```javascript
const clientId = scriptTag.dataset.client;
const BASE_URL = "http://localhost:3000/api";
```

**After:**
```javascript
const apiKey = scriptTag.dataset.apiKey;
const BASE_URL = scriptTag.dataset.baseUrl || "https://yourdomain.com/api";
```

**New Embed Format:**
```html
<script 
  src="https://yourdomain.com/api/widget.js"
  data-api-key="abc123def456..."
  data-base-url="https://yourdomain.com/api"
  async>
</script>
```

---

### 5. **public/chat-client.js** ✅
**Changes:**

#### All API Calls Now Include API Key

**Before:**
```javascript
fetch(`${API}/chat/${clientId}`)
```

**After:**
```javascript
fetch(`${API}/chat`, {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})
```

**Updated Endpoints:**
- `POST /api/chat` (changed from `/chat/:clientId`)
- `POST /api/lead` (changed from `/lead/:clientId`)

---

### 6. **.env.example** ✅ (NEW FILE)
Template for environment variables

### 7. **DEPLOYMENT_GUIDE.md** ✅ (NEW FILE)
Complete guide for:
- Deploying to Heroku/Replit/VPS
- Registering clients
- Embedding on WordPress/Shopify/Custom code
- Training the bot
- API reference

### 8. **CUSTOMER_GUIDE.md** ✅ (NEW FILE)
Simple 5-minute guide for end customers

---

## Security Architecture

### Data Flow:

```
Customer Website
    ↓ (embed script with API key)
[widget.js loads]
    ↓
[chat-client.js initializes with API key]
    ↓
Sends requests to /api/chat with Authorization header
    ↓
[validateApiKey middleware checks key]
    ↓ (if valid)
[Route handler uses req.client from middleware]
    ↓
Returns AI response for that specific client
```

### API Key Usage:

1. **Registration**: No key needed to register
2. **Usage**: Every request to `/chat` and `/lead` requires key
3. **Per-Client Isolation**: Each API key grants access to only that client's data
4. **Leads**: Only go to client's businessEmail

---

## Database Schema Changes

### Before:
```
Client {
  clientId: String
  businessName: String
  model: String
  plan: String
  businessData: String
}
```

### After:
```
Client {
  clientId: String (unique, required)
  apiKey: String (unique, required, auto-generated)
  businessName: String (required)
  businessEmail: String (required) ← NEW
  businessData: String
  model: String (default: "llama-3.1-8b-instant")
  plan: String (default: "starter")
  active: Boolean (default: true) ← NEW
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

---

## Migration (If You Have Existing Data)

If you have existing clients in MongoDB, run this to add missing fields:

```javascript
// In MongoDB shell or Compass
db.clients.updateMany(
  {},
  {
    $set: {
      active: true,
      apiKey: null  // Will be auto-generated on first save
    }
  }
)
```

Then update each client to get their API key:

```javascript
const Client = require('./Models/Clients');
const crypto = require('crypto');

async function migrateClients() {
  const clients = await Client.find({ apiKey: null });
  for (let client of clients) {
    client.apiKey = crypto.randomBytes(32).toString('hex');
    await client.save();
    console.log(`${client.clientId}: ${client.apiKey}`);
  }
}

migrateClients();
```

---

## API Key Rotation (Future Enhancement)

If needed, add this endpoint to allow clients to rotate their keys:

```javascript
Router.post("/clients/rotate-key", validateApiKey, async (req, res) => {
  const client = req.client;
  const crypto = require('crypto');
  client.apiKey = crypto.randomBytes(32).toString('hex');
  await client.save();
  res.json({ 
    message: "API key rotated successfully", 
    newApiKey: client.apiKey 
  });
});
```

---

## Production Deployment Checklist

- [ ] Update `.env` with real MongoDB, Groq, SMTP credentials
- [ ] Set `NODE_ENV=production`
- [ ] Set `WIDGET_BASE_URL` to your actual domain
- [ ] Enable HTTPS only
- [ ] Set strong rate limiting on `/clients/register`
- [ ] Add IP whitelist for admin endpoints (optional)
- [ ] Test email sending
- [ ] Test widget embedding on test site
- [ ] Monitor logs for errors

---

## Testing the System

### 1. Register a test client:
```bash
curl -X POST http://localhost:3000/api/clients/register \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "test-business",
    "businessName": "Test Business",
    "businessEmail": "test@example.com",
    "businessData": "We sell test products."
  }'
```

### 2. Get the API key from response, then test chat:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "messages": [
      { "role": "user", "content": "Hello, who are you?" }
    ]
  }'
```

### 3. Test lead submission:
```bash
curl -X POST http://localhost:3000/api/lead \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "I'm interested in your service"
  }'
```

---

## Pricing Model Ideas

Since you now have per-client tracking, you can implement tiers:

```javascript
// In your controller
if (req.client.plan === 'starter') {
  // Limit to 100 messages/month
  // Use slower model: "llama-3.1-1b-instant"
} else if (req.client.plan === 'pro') {
  // Unlimited messages
  // Use medium model: "llama-3.1-8b-instant"
} else if (req.client.plan === 'enterprise') {
  // Unlimited everything
  // Use best model: "llama-3.2-90b-vision-preview"
}
```

---

## Next Steps

1. **Deploy**: Follow DEPLOYMENT_GUIDE.md
2. **Test**: Register a client, embed widget, verify chat & leads work
3. **Scale**: Share CUSTOMER_GUIDE.md with clients
4. **Monitor**: Check logs for errors, track API usage
5. **Monetize**: Charge clients per month based on plan

Enjoy your SaaS bot! 🚀
