# ⚡ Railway Deployment: QUICK CHECKLIST

Complete these steps in order. Estimated time: **15-20 minutes**

---

## ✅ STEP 1: Prepare Environment Variables (5 min)

- [ ] Create `.env` file in project root (copy below)
- [ ] Set each value:

```env
# Copy this into your .env file and fill in the values

# Database (get from MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

# AI
GROQ_API_KEY=your-groq-api-key

# Server
PORT=3000
NODE_ENV=production
```

**Where to get these values:**

| Variable | How to Get |
|----------|-----------|
| `MONGODB_URI` | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) → Create cluster → Copy connection string |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASS` | Gmail account → [Security](https://myaccount.google.com/security) → App passwords → Copy 16-char password |
| `GROQ_API_KEY` | [Groq Console](https://console.groq.com) → Create API key |

---

## ✅ STEP 2: Verify package.json Has Start Script (1 min)

Check if your `package.json` has this line:

```json
"scripts": {
  "start": "node app.js",
  ...
}
```

If NOT there, add it.

---

## ✅ STEP 3: Create .gitignore (1 min)

Create `.gitignore` file in project root with:

```
node_modules/
.env
.env.local
.DS_Store
*.log
```

This prevents pushing your secrets to GitHub!

---

## ✅ STEP 4: Push Code to GitHub (5 min)

```powershell
# Open PowerShell in your project folder
cd C:\Users\hadianjum\Desktop\Botbackend

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add GitHub remote (replace YOUR_USERNAME and YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/your-repo-name.git

# Push
git branch -M main
git push -u origin main
```

✅ **Verify:** Go to `github.com/YOUR_USERNAME/your-repo-name` → See your files? Good!

---

## ✅ STEP 5: Deploy to Railway (3 min)

### Option A: Web Dashboard (Easiest)

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Click "Deploy from GitHub Repo"
4. Authorize Railway with GitHub
5. Select your repo from the list
6. Click "Deploy"
7. **Wait 2-3 minutes** for deployment complete

### Option B: Using Railway CLI

```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd C:\Users\hadianjum\Desktop\Botbackend
railway init
# Follow prompts
```

---

## ✅ STEP 6: Add Environment Variables to Railway (3 min)

1. Go to [railway.app/dashboard](https://railway.app/dashboard)
2. Click your project
3. Click the "botbackend" service
4. Click **"Variables" tab**
5. **Add these variables (paste the values from your .env):**

```
MONGODB_URI = [paste from .env]
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_SECURE = false
SMTP_USER = [paste from .env]
SMTP_PASS = [paste from .env]
GROQ_API_KEY = [paste from .env]
NODE_ENV = production
```

6. Click "Save" or "Redeploy"
7. **Wait 1-2 minutes** for restart

---

## ✅ STEP 7: Get Your Live URL (1 min)

1. Railway Dashboard → Your project
2. Click **"Network" tab**
3. You'll see:
   ```
   URL: https://botbackend-production-abc123.railway.app
   ```

Copy this URL. It's your live backend!

---

## ✅ STEP 8: Test It Works (5 min)

### Test 1: Check Server is Running

```powershell
# Open PowerShell and run:
curl https://your-url-here.railway.app/api

# You should see a response (not an error)
```

### Test 2: Register a Customer

```powershell
curl -X POST https://your-url-here.railway.app/api/clients/register `
  -H "Content-Type: application/json" `
  -d '{
    "clientId": "test-biz",
    "businessName": "Test Business",
    "businessEmail": "your-email@gmail.com",
    "businessData": "We sell awesome stuff"
  }'
```

### Test 3: Check Logs

1. Railway Dashboard → Logs tab
2. Should see:
   ```
   ✅ SMTP connection successful
   Server running → http://0.0.0.0:3000
   ```

No errors? You're good!

---

## ✅ STEP 9: Update test.html (Optional but Recommended)

To test your production API from test.html:

1. Open `test.html` in your project
2. Find where it sets the API base URL
3. Change from `http://localhost:3000` to `https://your-url-here.railway.app`
4. Save and test

---

## 🎉 YOU'RE DONE!

Your backend is LIVE!

**Your production API URLs:**
```
Chat:     https://your-url.railway.app/api/chat
Register: https://your-url.railway.app/api/clients/register
Widget:   https://your-url.railway.app/api/widget.js
```

**What's next:**
- [ ] Share widget code with customers
- [ ] Set up customer dashboard
- [ ] Add payment processing (Stripe)
- [ ] Start selling! 💰

---

## 🔴 ERRORS?

### Error: "502 Bad Gateway"
```
Fix: Check Railway Logs tab for errors
     Make sure all environment variables are set
     Click "Redeploy" button
```

### Error: "Cannot find module"
```
Fix: Add package-lock.json to GitHub
     git add package-lock.json
     git commit -m "Add lock file"
     git push
```

### Error: "SMTP connection failed"
```
Fix: Verify SMTP_PASS is correct Gmail app password (not your Gmail password!)
     Check SMTP_HOST = smtp.gmail.com
     Check SMTP_PORT = 587
```

### Error: "MongoServerError"
```
Fix: Verify MONGODB_URI is correct
     Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for test)
     Try getting new connection string from Atlas
```

---

## 📞 Still Stuck?

Read the full guide: [RAILWAY_DEPLOYMENT_GUIDE.md](RAILWAY_DEPLOYMENT_GUIDE.md)

Railway docs: [docs.railway.app](https://docs.railway.app)

---

## 🎯 Remember

- **Your .env never goes to GitHub** (use .gitignore)
- **Add variables to Railway dashboard**, not in code
- **Railway auto-redeploys** when you git push
- **Logs are your friend** - always check them first

You got this! 🚀
