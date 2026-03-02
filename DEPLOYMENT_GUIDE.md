# Multi-Tenant AI Chatbot Widget - Setup & Deployment Guide

## Overview
Your chatbot is now a **secure, multi-tenant system** where each client gets:
- ✅ Unique API Key (no shared access)
- ✅ Custom business data & training
- ✅ Own email for lead notifications
- ✅ Embeddable widget for any website

---

## Step 1: Environment Setup (.env)

Create a `.env` file in your root directory:

```bash
# MongoDB
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Groq API (AI Model)
GROQ_API_KEY=your_groq_api_key_here

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourbusiness.com

# Server
PORT=3000
NODE_ENV=production

# Frontend Base URL (where widget loads from)
WIDGET_BASE_URL=https://yourdomain.com/api
```

### Getting API Keys:
- **Groq API**: Visit https://console.groq.com/keys
- **Gmail SMTP**: Use App Passwords (2FA required)
  1. Go to myaccount.google.com/apppasswords
  2. Generate 16-character password

---

## Step 2: Deploy Your Backend

### Option A: Heroku (Free Tier)
```bash
# Install Heroku CLI
heroku login
heroku create your-app-name
git push heroku main
heroku config:set MONGODB_URL=your_mongodb_url
heroku config:set GROQ_API_KEY=your_groq_key
# ... add all other env vars
```

### Option B: Replit
1. Upload files to Replit
2. Add `.env` file
3. Click "Run" button

### Option C: VPS/Self-Hosted
```bash
npm install
npm run dev  # for development
npm run build  # for production with PM2
```

---

## Step 3: Register Your First Client

### Via API Call (Postman/cURL):
```bash
POST https://yourdomain.com/api/clients/register
Content-Type: application/json

{
  "clientId": "acme-corp",
  "businessName": "ACME Corporation",
  "businessEmail": "owner@acmecorp.com",
  "businessData": "We sell innovative solutions for businesses. We specialize in AI-powered customer service and automation. We're passionate about helping businesses grow."
}
```

**Response Example:**
```json
{
  "message": "Client registered successfully! Save your API key - it will only be shown once.",
  "client": {
    "clientId": "acme-corp",
    "businessName": "ACME Corporation",
    "businessEmail": "owner@acmecorp.com",
    "apiKey": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "createdAt": "2024-03-02T10:30:00Z"
  }
}
```

⚠️ **SAVE THE API KEY!** It's only shown once.

---

## Step 4: Embed Widget on Client Website

### For Any Website (WordPress, Shopify, Custom HTML):

1. **Get the API Key** from client registration
2. **Add this single script tag** to website:

```html
<!-- Embed this in your website's <head> or before </body> -->
<script 
  src="https://yourdomain.com/api/widget.js"
  data-api-key="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
  data-base-url="https://yourdomain.com/api"
  async>
</script>
```

### WordPress:
- Use **Code Snippets** plugin or add to theme footer
- Place in wp-content/themes/your-theme/footer.php

### Shopify:
- Settings → Checkout → Additional Scripts
- Paste the script tag

### Custom Code:
- Add anywhere in your HTML `<body>`

---

## Step 5: Train the Bot for Each Client

### Update Client's Business Data:

```bash
PUT https://yourdomain.com/api/clients/update
Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
Content-Type: application/json

{
  "businessName": "ACME Corp Updated",
  "businessEmail": "newemail@acmecorp.com",
  "businessData": "We are ACME Corporation. We help Fortune 500 companies with:\n- Cloud migration\n- AI implementation\n- 24/7 customer support\n\nOur services include consulting, development, and training.",
  "model": "llama-3.1-8b-instant"
}
```

**The businessData field is the AI's instruction set** - customize for each client:
- Include company mission & values
- List services/products
- Define tone & personality
- Add FAQs or knowledge base

---

## Step 6: Receive & Manage Leads

Leads are automatically sent to `businessEmail` when visitors click "Get In Touch" button on the widget.

### Check Received Leads (Optional):

```bash
GET https://yourdomain.com/api/clients/info
Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

Response:
```json
{
  "clientId": "acme-corp",
  "businessName": "ACME Corporation",
  "businessEmail": "owner@acmecorp.com",
  "model": "llama-3.1-8b-instant",
  "plan": "starter",
  "active": true,
  "createdAt": "2024-03-02T10:30:00Z"
}
```

---

## API Reference

### 1. Register New Client
```
POST /api/clients/register
No auth required
Body: { clientId, businessName, businessEmail, businessData? }
Returns: Client data with API key
```

### 2. Send Chat Message
```
POST /api/chat
Auth: Bearer API_KEY
Body: { messages: [{role, content}], type: "text" | "image", image? }
Returns: { reply }
```

### 3. Submit Lead
```
POST /api/lead
Auth: Bearer API_KEY
Body: { name, email, message? }
Returns: { lead }
```

### 4. Update Client
```
PUT /api/clients/update
Auth: Bearer API_KEY
Body: { businessName?, businessEmail?, businessData?, model?, plan? }
Returns: Updated client
```

### 5. Get Client Info
```
GET /api/clients/info
Auth: Bearer API_KEY
Returns: Client details
```

---

## Authentication Methods

The API accepts the key in these formats:

**Method 1: Header (Recommended)**
```javascript
fetch('https://api.yourdomain.com/chat', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
```

**Method 2: Query Parameter**
```
https://api.yourdomain.com/chat?api_key=YOUR_API_KEY
```

**Method 3: Body (For POST)**
```javascript
body: JSON.stringify({ 
  api_key: 'YOUR_API_KEY',
  messages: [...]
})
```

---

## Pricing Models (Optional)

You can use the `plan` field to implement tiers:

```javascript
// When registering
{
  "clientId": "company1",
  "plan": "starter",  // Free tier
  ...
}

// When registering
{
  "clientId": "company2", 
  "plan": "pro",  // Paid tier
  ...
}

// In backend, check req.client.plan before processing
if (req.client.plan === 'starter') {
  // Limit daily messages
  // Slower response model
}
```

---

## Monitoring & Troubleshooting

### Check Widget Loading Issues:
```javascript
// Open browser console and check for errors
console.log('API Key:', document.currentScript.dataset.apiKey)
```

### Common Issues:

| Issue | Solution |
|-------|----------|
| "Missing API key" | Add `data-api-key` to script tag |
| CORS errors | Ensure CORS enabled in app.js ✅ (already enabled) |
| Chat not working | Check GROQ_API_KEY in .env |
| Leads not emailing | Verify SMTP credentials |
| Widget not loading | Check if BASE_URL matches your domain |

### Test Email Setup:
```bash
GET https://yourdomain.com/api/test-email
```

---

## Security Best Practices

✅ **What's Secure:**
- API keys are unique per client
- No hardcoded keys in frontend (passed at runtime)
- CORS restricted to your domain
- Leads encrypted in MongoDB
- API key required for all chat endpoints

⚠️ **What to Add (Optional):**
- Rate limiting per API key
- IP whitelist for API keys
- Regenerate API keys periodically
- Enable HTTPS only (.env: `NODE_ENV=production`)

---

## Scale to Production

### Step 1: Get Domain
- Buy domain (Namecheap, GoDaddy)
- Point to your server

### Step 2: Update .env
```bash
WIDGET_BASE_URL=https://chatbot.yourdomain.com/api
NODE_ENV=production
PORT=3000
```

### Step 3: Use Reverse Proxy (Nginx)
```nginx
server {
    listen 443 ssl;
    server_name chatbot.yourdomain.com;
    
    location /api {
        proxy_pass http://localhost:3000/api;
    }
}
```

### Step 4: SSL Certificate
```bash
# Let's Encrypt (Free)
certbot certonly --standalone -d chatbot.yourdomain.com
```

---

## Example Integration

### Full Client Setup Workflow:

```bash
# 1. Register new customer
curl -X POST https://yourdomain.com/api/clients/register \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "pizzahut-2024",
    "businessName": "Pizza Hut Express",
    "businessEmail": "manager@pizzahut.com",
    "businessData": "We are Pizza Hut Express - fast pizza delivery in 30 minutes or less. We offer:\n- Margherita Pizza\n- Pepperoni Pizza\n- Veggie Special\n\nOrders: +1-800-PIZZA-1\nHours: 11AM-11PM Daily"
  }'

# Receive API key: xyz123abc456def789...

# 2. They add to their WordPress site
<!-- In footer.php -->
<script src="https://yourdomain.com/api/widget.js" 
  data-api-key="xyz123abc456def789" 
  data-base-url="https://yourdomain.com/api" 
  async></script>

# 3. Widget appears on their site - bot responds about pizza!
# 4. Leads go to manager@pizzahut.com
# 5. Done! 🎉
```

---

## Support

For issues:
1. Check logs: `heroku logs --tail` (Heroku) or `pm2 logs` (VPS)
2. Test email: `GET /api/test-email`
3. Check MongoDB connection
4. Verify all .env variables are set

---

## Next Steps

1. ✅ Deploy this code
2. ✅ Set up .env file
3. ✅ Register your first client (yourself for testing)
4. ✅ Add widget script to a test website
5. ✅ Chat with the bot
6. ✅ Test lead submission
7. ✅ Get paid by future clients! 💰

---

**Questions?** Check logs, test endpoints with Postman, and verify .env variables.
