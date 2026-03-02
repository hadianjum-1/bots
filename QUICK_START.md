# Quick Start Examples - How to Use Your Chatbot

## 🚀 Quick Overview

Your bot system works in 3 simple steps:

1. **Register** a customer → Get API Key
2. **Embed** widget code on their website
3. **Chat** using the API Key

---

## Example 1: Register Your First Customer (cURL)

```bash
curl -X POST http://localhost:3000/api/clients/register \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "mcdonalds-2024",
    "businessName": "McDonalds - Downtown",
    "businessEmail": "manager@mcdonalds.com",
    "businessData": "We are McDonalds. We serve:\n- Burgers\n- Fries\n- Shakes\n- Salads\n\nOpen: 6AM - 11PM\nMobile App: McApp\nDelivery: Yes"
  }'
```

**Response:**
```json
{
  "message": "Client registered successfully! Save your API key - it will only be shown once.",
  "client": {
    "clientId": "mcdonalds-2024",
    "businessName": "McDonalds - Downtown",
    "businessEmail": "manager@mcdonalds.com",
    "apiKey": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "createdAt": "2024-03-02T10:30:00Z"
  }
}
```

✅ **Save the API Key!** → `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

---

## Example 2: Embed Widget on Website

### For WordPress:

1. Go to **Dashboard → Appearance → Theme Code Editor**
2. Find **footer.php**
3. Add before `</body>`:

```html
<script 
  src="http://localhost:3000/api/widget.js"
  data-api-key="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
  data-base-url="http://localhost:3000/api"
  async>
</script>
```

4. Save
5. ✨ Done! Widget appears on site

### For Shopify:

Settings → Checkout → Additional Scripts → Paste above code

### For Custom HTML:

```html
<!DOCTYPE html>
<html>
<body>
  <h1>My Business Website</h1>
  <p>Chat with our AI bot!</p>

  <!-- Add this at the end -->
  <script 
    src="http://localhost:3000/api/widget.js"
    data-api-key="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
    data-base-url="http://localhost:3000/api"
    async>
  </script>
</body>
</html>
```

---

## Example 3: Send Chat Message (cURL)

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" \
  -d '{
    "type": "text",
    "messages": [
      {
        "role": "user",
        "content": "What are your opening hours?"
      }
    ]
  }'
```

**Response:**
```json
{
  "reply": "We are open from 6AM to 11PM every day! You can order ahead through our mobile app or visit us in person."
}
```

---

## Example 4: Submit Lead (cURL)

```bash
curl -X POST http://localhost:3000/api/lead \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" \
  -d '{
    "name": "John Smith",
    "email": "john@example.com",
    "message": "I want to order catering for my office event"
  }'
```

**What Happens:**
- ✅ Lead saved to database
- 📧 Email sent to `manager@mcdonalds.com` with lead info
- 📧 Confirmation email sent to `john@example.com`

---

## Example 5: Update Bot Training Data (cURL)

Train the bot with better instructions:

```bash
curl -X PUT http://localhost:3000/api/clients/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" \
  -d '{
    "businessData": "McDonalds Downtown:\n\nWe serve:\n- Big Mac ($6.99)\n- Quarter Pounder ($5.99)\n- Chickem McNuggets ($4.99)\n- Fries ($2.49)\n- McFlurry ($3.99)\n\nHours:\nMonday-Friday: 6AM - Midnight\nWeekend: 6AM - 1AM\n\nWe deliver via: DoorDash, Uber Eats, GrubHub\nCall: +1-555-MCDONALD\n\nSpecial: Buy 2 burgers get free fries!"
  }'
```

**Result:**
- Bot now has updated knowledge
- All new conversations use this training
- Old conversations unchanged

---

## Example 6: Get Client Settings (cURL)

```bash
curl -X GET http://localhost:3000/api/clients/info \
  -H "Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

**Response:**
```json
{
  "clientId": "mcdonalds-2024",
  "businessName": "McDonalds - Downtown",
  "businessEmail": "manager@mcdonalds.com",
  "model": "llama-3.1-8b-instant",
  "plan": "starter",
  "active": true,
  "createdAt": "2024-03-02T10:30:00Z",
  "updatedAt": "2024-03-02T10:35:00Z"
}
```

---

## Example 7: JavaScript (Browser)

```javascript
// Register a customer
async function registerCustomer() {
  const res = await fetch('http://localhost:3000/api/clients/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: 'starbucks-2024',
      businessName: 'Starbucks Coffee',
      businessEmail: 'owner@starbucks.com',
      businessData: 'We serve coffee, tea, and pastries. Open 5AM-9PM daily.'
    })
  });

  const data = await res.json();
  console.log('API Key:', data.client.apiKey);
  return data.client.apiKey;
}

// Send chat message
async function chat(apiKey, message) {
  const res = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      type: 'text',
      messages: [{ role: 'user', content: message }]
    })
  });

  const data = await res.json();
  console.log('Bot says:', data.reply);
  return data.reply;
}

// Usage
const apiKey = await registerCustomer();
await chat(apiKey, 'What time do you open?');
```

---

## Real-World Workflow

### Scenario: You sell to "Amazing Pizza Co"

**Step 1: They purchase your bot**
```bash
# You register them
POST /api/clients/register
{
  "clientId": "amazing-pizza-2024",
  "businessName": "Amazing Pizza Co",
  "businessEmail": "owner@amazingpizza.com",
  "businessData": "We make authentic Italian pizza..."
}

# You get back their API Key: xyz789abc123...
# You send them the embed code
```

**Step 2: They add to their WordPress site**
```html
<script 
  src="http://localhost:3000/api/widget.js"
  data-api-key="xyz789abc123..."
  data-base-url="http://localhost:3000/api"
  async>
</script>
```

**Step 3: Their customers visit website**
- See chat bubble → Ask bot questions
- Bot responds about pizza company
- Click "Get In Touch" → Lead sent to owner@amazingpizza.com

**Step 4: You improve their bot later**
```bash
# They want to provide more training data
PUT /api/clients/update
Authorization: Bearer xyz789abc123...
{
  "businessData": "Now we also have:\n- Gluten free options\n- Vegan cheese\n- Online ordering..."
}
```

**Step 5: Repeat for more customers!** 💰

---

## Testing Tools

### Use Postman:

1. Download [Postman](https://www.postman.com/)
2. Create new POST request
3. URL: `http://localhost:3000/api/clients/register`
4. Body (JSON):
```json
{
  "clientId": "test-2024",
  "businessName": "Test Business",
  "businessEmail": "test@example.com",
  "businessData": "Test description"
}
```
5. Send → Get API key
6. Use key in Authorization header for other requests

### Or use your test.html file:

```
http://localhost:3000/test.html
```

Open in browser - interactive UI with all examples!

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot connect to server" | Make sure Node is running: `npm run dev` |
| "Invalid API key" | Copy the exact key from registration response |
| "Missing API key" | Add `Authorization: Bearer KEY` header |
| "Client not found" | Use correct clientId from registration |
| "Email not received" | Check .env has valid SMTP creds |

---

## Authentication Methods

### Method 1: Header (Recommended) ⭐
```bash
curl -H "Authorization: Bearer YOUR_API_KEY"
```

### Method 2: Query Parameter
```bash
curl http://localhost:3000/api/chat?api_key=YOUR_API_KEY
```

### Method 3: Body
```bash
curl -d '{"api_key": "YOUR_API_KEY", "messages": [...]}'
```

---

## Summary

```
1. Register customer → Get API Key
   POST /api/clients/register

2. Get embed code
   <script data-api-key="KEY" ...>

3. Add to website
   Paste embed code

4. Send message
   POST /api/chat (with Bearer token)

5. Get lead
   POST /api/lead (automatic email)

6. Update training
   PUT /api/clients/update

7. Repeat for more customers! 🎉
```

---

## Next: Deploy to Production

When you're ready to go live:

1. Change domain from `localhost:3000` to your actual domain
2. Update API_BASE_URL in all code
3. Deploy to Heroku/Replit/VPS (see DEPLOYMENT_GUIDE.md)
4. Share CUSTOMER_GUIDE.md with your customers

**Questions?** Check logs with: `npm run dev` and watch the console output.
