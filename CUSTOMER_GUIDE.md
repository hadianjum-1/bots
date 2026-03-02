# Customer Guide: Embedding AI Chat Widget

## Quick Start (5 Minutes)

You've purchased an AI chatbot widget for your website. Follow these simple steps to get it live:

### Step 1: Grab Your Embed Code

You received an email with your **API Key**. It looks like this:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

Your embed code is:
```html
<script 
  src="https://yourdomain.com/api/widget.js"
  data-api-key="YOUR_API_KEY_HERE"
  data-base-url="https://yourdomain.com/api"
  async>
</script>
```

### Step 2: Add to Your Website

#### WordPress:
1. Go to **Dashboard → Appearance → Theme Code Editor**
2. Find **footer.php** in the right sidebar
3. Add this line before `</body>`:
```html
<script src="https://yourdomain.com/api/widget.js" data-api-key="YOUR_API_KEY_HERE" data-base-url="https://yourdomain.com/api" async></script>
```
4. Click **Update**

#### Shopify:
1. Go to **Settings → Checkout and payment → Additional scripts**
2. Paste the script tag
3. Click **Save**

#### Custom Website / HTML:
1. Open your website's `index.html`
2. Add this before `</body>`:
```html
<script 
  src="https://yourdomain.com/api/widget.js"
  data-api-key="YOUR_API_KEY_HERE"
  data-base-url="https://yourdomain.com/api"
  async>
</script>
```
3. Save & upload

#### Wix:
1. Go to **Settings → Custom Code**
2. Click **Add Code**
3. Select **Footer** location
4. Paste the script tag
5. Click **Apply**

### Step 3: Done! 🎉

Reload your website. You should see a **chat bubble in the bottom-right corner**.

---

## Features

### 💬 Chat
- Click the bubble
- Type questions
- AI responds with your business information

### 📸 Upload Images
- Click attachment icon
- Bot analyzes images

### 📧 Lead Collection
- Visitors can click "Get In Touch"
- Their info gets sent to your email

---

## Customization (Wait for Developer Update)

Want to customize the bot? Email your provider with:

1. **Change Bot Personality**: I want the bot to be more [formal/casual/funny]
2. **Update Knowledge**: Here's new info about my business...
3. **Change Button Position**: Move from bottom-right to [position]

Your AI bot can be retrained to match your business perfectly!

---

## Troubleshooting

### Widget doesn't appear?
- ✅ Check browser console (F12) for error messages
- ✅ Make sure you pasted the **entire** script tag
- ✅ Check that your API key is correct

### Bot not responding?
- ✅ Check your internet connection
- ✅ Clear browser cache (Ctrl+Shift+Delete)
- ✅ Try a different browser

### Leads not going to email?
- ✅ Check spam folder
- ✅ Make sure you entered correct email address
- ✅ Contact provider

### Widget looks weird on mobile?
- ✅ Refresh the page
- ✅ Restart browser
- ✅ Clear browser cache

---

## Need Help?

Contact your chatbot provider with:
1. Your domain name
2. What's not working
3. Browser you're using

They can update your bot configuration or help troubleshoot.

---

## Important Security Notes

⚠️ **Never share your API key publicly**
- Don't post it in forums or social media
- It's embedded in your website (visible in HTML source)
- Similar to Google Analytics tracking code - it's OK to have it there
- But don't share it in emails or messages

---

Enjoy your AI-powered customer support! 🤖✨
