# 🚂 Deploy to Railway: Step-by-Step Guide

Railway is a modern cloud platform that makes deploying Node.js apps incredibly easy. This guide walks you through deploying your chatbot backend to Railway in 15 minutes.

---

## ✅ What You'll Have After This

- Live backend running on Railway
- Custom domain (like `yourapp.railway.app`)
- Production MongoDB database
- Environment variables configured
- Automatic deployments from Git
- Monitoring dashboard

---

## 📋 Prerequisites

Before starting, make sure you have:

1. ✅ Git installed ([download](https://git-scm.com/download/win))
2. ✅ GitHub account ([github.com](https://github.com))
3. ✅ Your code pushed to GitHub
4. ✅ All environment variables ready

---

## 🔑 Step 1: Prepare Your Environment Variables

### What You Need (Create a `.env` file in your project root)

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

# AI API Keys
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-key

# Other
PORT=3000
NODE_ENV=production
```

### Getting These Values

**MONGODB_URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a cluster (M0 free tier is fine)
4. Go to "Database" → "Connect"
5. Choose "Drivers" → copy connection string
6. Replace `<password>` and `<dbname`

**Gmail App Password:**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication
3. Go to "App passwords"
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password
6. Use that in `SMTP_PASS`

**GROQ_API_KEY:**
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up free
3. Create API key in dashboard
4. Copy the key

---

## 🔧 Step 2: Update Your package.json

Add a start script to your `package.json`:

```json
{
  "name": "botbackend",
  "version": "1.0.0",
  "main": "app.js",
  "scripts": {
    "dev": "nodemon app.js",
    "start": "node app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "cors": "^2.8.6",
    "dotenv": "^17.3.1",
    "express": "^5.2.1",
    "mongoose": "^9.2.3",
    "nodemailer": "^8.0.1",
    "openai": "^6.25.0",
    "path": "^0.12.7"
  }
}
```

The important part is adding `"start": "node app.js"`

---

## 📤 Step 3: Push Code to GitHub

### Create GitHub Repo + Push Code

```powershell
# Open terminal in your project folder
cd C:\Users\hadianjum\Desktop\Botbackend

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Chatbot backend"

# Add GitHub remote (replace YOUR_USERNAME and YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Important:** Make sure `.env` is in `.gitignore` so you don't push secrets!

Check/create `.gitignore`:

```
node_modules/
.env
.env.local
.DS_Store
*.log
```

---

## 🚀 Step 4: Deploy to Railway

### Option A: Simple Deployment (Recommended for First Time)

1. **Go to Railway** → [railway.app](https://railway.app)

2. **Click "Start a New Project"**

3. **Click "Deploy from GitHub Repo"**

4. **Authorize Railway** with GitHub (it will ask permission)

5. **Select your GitHub repo** from the list

6. **Click "Deploy"**

Railway will automatically:
- Clone your code
- Install dependencies
- Start the app
- Give you a live URL

**Wait 2-3 minutes** for deployment to complete.

### Option B: Using Railway CLI (Advanced)

```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
# This opens a browser to authenticate

# Navigate to your project folder
cd C:\Users\hadianjum\Desktop\Botbackend

# Link to Railway
railway init
# Select "Create a new project"

# Deploy
railway up
# This uploads your code and deploys
```

---

## ⚙️ Step 5: Add Environment Variables to Railway

Once deployed:

1. **Go to Railway Dashboard** → [railway.app/dashboard](https://railway.app/dashboard)

2. **Click your project**

3. **Click the "botbackend" service** (or whatever your service is named)

4. **Click "Variables" tab**

5. **Add each variable:**
   - `MONGODB_URI` = (your MongoDB connection string)
   - `SMTP_HOST` = smtp.gmail.com
   - `SMTP_PORT` = 587
   - `SMTP_SECURE` = false
   - `SMTP_USER` = your-email@gmail.com
   - `SMTP_PASS` = your-gmail-app-password
   - `GROQ_API_KEY` = your-groq-key
   - `NODE_ENV` = production

6. **Click "Deploy" or "Redeploy"** button

The app will restart with new environment variables.

---

## 🗄️ Step 6: (Optional) Set Up MongoDB on Railway

If you want to host MongoDB on Railway instead of MongoDB Atlas:

1. **In Railway Dashboard**, open your project

2. **Click "+ Add Service"** → **"Database"** → **"MongoDB"**

3. **Railway auto-generates** `MONGODB_URI` environment variable

4. **That's it!** Your app automatically sees it

---

## 🌐 Step 7: Get Your Live URL

### Find Your Public URL

1. **Go to Railway Dashboard**
2. **Click your project**
3. **Click "Network" tab**
4. **You'll see:**
   ```
   URL: your-app-xxxxxx.railway.app
   ```

### Your API is now live at:
```
https://your-app-xxxxxx.railway.app/api/chat
https://your-app-xxxxxx.railway.app/api/clients/register
https://your-app-xxxxxx.railway.app/api/widget.js
```

---

## ✅ Step 8: Test Your Deployment

### Test 1: Check if Server is Running
```bash
curl https://your-app-xxxxxx.railway.app/api/clients/register
```

You should NOT get an error (might get error about POST, but that's OK - means server responded)

### Test 2: Register a Test Customer
```bash
curl -X POST https://your-app-xxxxxx.railway.app/api/clients/register \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "test-business",
    "businessName": "Test Business",
    "businessEmail": "your-email@gmail.com",
    "businessData": "We sell amazing products"
  }'
```

### Test 3: Use test.html with Production URL

1. **Open test.html** in your browser
2. **Look for the endpoint/baseURL input**
3. **Change from** `http://localhost:3000` **to** `https://your-app-xxxxxx.railway.app`
4. **Test registration, chat, everything**

---

## 🔄 Step 9: Automatic Deployments (Continuous Deployment)

Railway automatically redeploys whenever you push to GitHub!

### Make a Change and Deploy
```powershell
# Make a change to your code
# (e.g., update app.js)

git add .
git commit -m "Update API response"
git push origin main

# Wait 2-3 minutes
# Railway automatically detects the push and redeploys
```

Check deployment status:
1. **Railway Dashboard** → **Deployments** tab
2. See real-time logs of the deployment

---

## 📊 Monitor Your App

### View Logs
```
Railway Dashboard → Logs tab
```

See real-time logs of:
- Server startup
- API requests
- Errors
- Database connections

### Monitor Performance
```
Railway Dashboard → Metrics tab
```

See:
- CPU usage
- Memory usage
- Disk usage
- Network requests

---

## 🆘 Troubleshooting

### Issue: "502 Bad Gateway" Error

**Causes:**
1. App crashed (check logs)
2. Environment variables missing
3. Database connection failed

**Fix:**
```
1. Go to Railway Dashboard → Logs tab
2. Look for error messages
3. Check all environment variables added
4. Verify MONGODB_URI is correct
5. Click "Redeploy" button
```

### Issue: "Cannot Find Module"

**Cause:** Dependencies not installed

**Fix:**
```powershell
# On your machine
npm install

# Add package-lock.json to git
git add package-lock.json
git commit -m "Add package lock"
git push

# Railway will see package.json and install all dependencies
```

### Issue: Email Not Sending

**Cause:** SMTP credentials wrong or Gmail security

**Fix:**
```
1. Verify Gmail app password (NOT your regular Gmail password)
2. Check SMTP_HOST = smtp.gmail.com
3. Check SMTP_PORT = 587
4. Check SMTP_SECURE = false
5. Check SMTP_USER = your email address
6. Verify email account has 2FA enabled
```

### Issue: API Key Not Working

**Cause:** Environment variable not set on Railway (only on your machine's .env)

**Fix:**
```
1. Add all variables to Railway Variables tab
2. Click "Redeploy" or "Redeploy Latest"
3. Wait for deployment to finish
4. Test again
```

---

## 🎯 Your Next Steps (Deployment Checklist)

- [ ] Create MongoDB Atlas account and get `MONGODB_URI`
- [ ] Get Gmail app password and test SMTP
- [ ] Get Groq API key
- [ ] Create `.env` file locally with all variables
- [ ] Add `"start": "node app.js"` to package.json
- [ ] Create/push code to GitHub repo
- [ ] Sign up for Railway account
- [ ] Deploy project from GitHub
- [ ] Add all environment variables to Railway
- [ ] Test with curl commands
- [ ] Test with test.html (update base URL)
- [ ] Monitor logs in Railway dashboard
- [ ] Ready to share with customers! 🎉

---

## 📞 Useful Railway Links

| Resource | URL |
|----------|-----|
| Railway Dashboard | https://railway.app/dashboard |
| Railway Docs | https://docs.railway.app |
| Troubleshooting | https://docs.railway.app/troubleshooting |
| Pricing | https://railway.app/pricing |
| Status Page | https://status.railway.app |

---

## 💰 Railway Pricing

**Free tier includes:**
- 5 GB disk space
- 100 GB bandwidth/month
- 500 hours compute/month
- Zero credit card needed

**Perfect for:**
- Testing
- Small projects
- Proof of concept

**Pro tier:** $5/month for paid features

---

## 🎓 What Happens After Deployment

### Your Backend Flow
```
Your Machine
    ↓ (git push)
GitHub
    ↓ (webhook notification)
Railway
    ↓
Builds project
    ↓
Installs dependencies
    ↓
Loads environment variables
    ↓
Runs: npm start (node app.js)
    ↓
Your app is LIVE 🚀
    ↓
Customers embed widget
    ↓
Messages → Your Railway server
    ↓
Stored in MongoDB
    ↓
Responses from Groq AI
    ↓
Back to widget
```

### Customer Access Model
```
Before Deployment:
- You: http://localhost:3000
- Customers: Can't access (your machine only)

After Deployment:
- You: Still use localhost for development
- Customers: https://your-app-xxxxxx.railway.app
- Everyone: Sees the same live backend
```

---

## 🔐 Security Tips

1. **Never commit `.env`**
   - Add to `.gitignore`
   - Only set variables in Railway dashboard

2. **Use strong API keys**
   - Don't share tokens publicly
   - Rotate keys regularly

3. **Monitor logs**
   - Check Railway logs weekly
   - Watch for unauthorized access

4. **Backup MongoDB**
   - MongoDB Atlas auto-backups free tier
   - Download backups monthly

---

## 🎉 Success Indicators

You're successfully deployed when:

✅ Railway Dashboard shows "Deployed" status
✅ No errors in Logs tab
✅ curl requests return responses
✅ test.html works with production URL
✅ Customers can register
✅ Chat API responds
✅ Leads send to email

---

## 📚 Next After Deployment

1. **Set Custom Domain** (optional)
   - Railway → Project Settings → Domains
   - Point your domain to Railway
   - Better than `railway.app` URL

2. **Add Payment Processing**
   - Stripe integration
   - Customer billing dashboard

3. **Create Customer Portal**
   - Login system
   - View API key
   - Monitor usage
   - Change settings

4. **Start Selling**
   - Marketing website
   - Pricing plans
   - Customer onboarding

---

## 💬 Need Help?

- **Railway Support:** [railway.app/support](https://railway.app/support)
- **Docs:** [docs.railway.app](https://docs.railway.app)
- **Community:** [railway.app/community](https://railway.app/community)

Your app is about to go live! 🚀
