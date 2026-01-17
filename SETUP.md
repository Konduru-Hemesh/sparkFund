# SparkFund - Detailed Setup Guide

This guide provides step-by-step instructions to set up SparkFund with MongoDB Atlas (online database) and configure the AI chatbot.

## Quick Setup Checklist

- [ ] MongoDB Atlas account created
- [ ] Database user created and IP whitelisted
- [ ] Connection string obtained
- [ ] Google Gemini API key obtained
- [ ] Backend `.env` file created and configured
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend server running successfully
- [ ] Frontend server running successfully
- [ ] Database connection verified
- [ ] Chatbot tested and working

---

## Part 1: MongoDB Atlas Setup (Online Database)

### 1.1 Create MongoDB Atlas Account

1. Visit https://www.mongodb.com/cloud/atlas
2. Click "Try Free" or "Sign Up"
3. Fill in your details and create an account
4. Verify your email address if required

### 1.2 Create a Free Cluster

1. After logging in, you'll be prompted to create a cluster
2. Select **"M0 Sandbox"** (Free tier)
3. Choose a cloud provider and region (closest to you)
4. Leave the cluster name as default or customize it
5. Click **"Create Cluster"** (takes 3-5 minutes)

### 1.3 Create Database User

1. In the left sidebar, go to **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** as authentication method
4. Enter a username (e.g., `sparkfund_admin`)
5. Generate a strong password or create your own (SAVE THIS!)
6. Under "User Privileges", select **"Atlas admin"** or **"Read and write to any database"**
7. Click **"Add User"**

⚠️ **Important:** Save your username and password - you'll need them for the connection string!

### 1.4 Configure Network Access

1. In the left sidebar, go to **"Network Access"**
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - For production, add only specific IP addresses for security
4. Click **"Confirm"**

### 1.5 Get Connection String

1. Go back to **"Database"** in the left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Select driver: **"Node.js"** and version: **"5.5 or later"**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace the placeholders:**
   - Replace `<username>` with your database username
   - Replace `<password>` with your database user password
   - Replace `?retryWrites=true&w=majority` with `?retryWrites=true&w=majority` (keep it) or add database name: `/sparkfund?retryWrites=true&w=majority`

**Final connection string format:**
```
mongodb+srv://sparkfund_admin:your_password@cluster0.xxxxx.mongodb.net/sparkfund?retryWrites=true&w=majority
```

---

## Part 2: Google Gemini API Key Setup

### 2.1 Get API Key

1. Visit https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select or create a Google Cloud project
5. Copy the API key (it starts with `AIza...`)

⚠️ **Important:** Keep your API key secure and never share it publicly!

### 2.2 API Limits

- Free tier provides generous usage limits
- Rate limits apply: ~15 requests per minute (RPM)
- If you exceed limits, wait a few minutes before retrying

---

## Part 3: Backend Configuration

### 3.1 Install Dependencies

```bash
cd sparkFund/backend
npm install
```

### 3.2 Create .env File

1. Create a new file named `.env` in the `backend/` directory
2. Copy the contents from `backend/env.example.txt` as a template
3. Fill in your actual values:

```env
# MongoDB Atlas Connection String (REQUIRED)
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/sparkfund?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# JWT Secret (generate using: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Google Gemini API Key (REQUIRED for chatbot)
GEMINI_API_KEY=AIzaSy...your-actual-api-key

# Firebase (Optional - only if using push notifications)
# FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json
```

### 3.3 Generate JWT Secret (Recommended)

On **macOS/Linux:**
```bash
openssl rand -base64 32
```

On **Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Or use an online generator: https://generate-secret.vercel.app/32

### 3.4 Start Backend Server

```bash
# Development mode (auto-reload on changes)
npm run dev

# Production mode
npm start
```

**Expected Output:**
```
✅ MongoDB Connected: cluster0-shard-00-01.xxxxx.mongodb.net
📊 Database: sparkfund
Server running on port 5000
```

### 3.5 Verify Backend

1. Open browser: http://localhost:5000/health
2. Should see: `{"status":"OK","timestamp":"..."}`

---

## Part 4: Frontend Configuration

### 4.1 Install Dependencies

```bash
cd sparkFund/frontend
npm install
```

### 4.2 Environment Variables (Optional)

For local development, no `.env` file is needed - the proxy is configured automatically.

If connecting to a different backend:
```bash
# Create .env file in frontend/ directory
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### 4.3 Start Frontend Server

```bash
npm run dev
```

**Expected Output:**
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Part 5: Testing & Verification

### 5.1 Test Database Connection

1. Check backend terminal for MongoDB connection message
2. Visit http://localhost:5000/health
3. Should return OK status

### 5.2 Test Chatbot

1. Start both backend and frontend servers
2. Open http://localhost:5173
3. Register/Login to the application
4. Navigate to "AI Assistant" page
5. Send a test message: "Hello, how can you help me?"
6. You should receive an AI response

### 5.3 Common Issues & Solutions

**Issue: MongoDB connection fails**
- ✅ Verify connection string format (must include `/sparkfund`)
- ✅ Check username/password are correct
- ✅ Verify IP address is whitelisted in Network Access
- ✅ Ensure cluster is not paused

**Issue: Chatbot returns errors**
- ✅ Verify `GEMINI_API_KEY` is set correctly in `.env`
- ✅ Check API key is valid (not expired/revoked)
- ✅ Wait if rate limit error appears

**Issue: CORS errors**
- ✅ Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- ✅ Check backend server is running
- ✅ Clear browser cache and try again

---

## Part 6: Production Deployment Notes

### Backend (.env for production)

```env
MONGODB_URI=mongodb+srv://...  # Your production MongoDB URI
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=...  # Use a strong, unique secret
GEMINI_API_KEY=...  # Your production API key
```

### Frontend (.env for production)

```env
VITE_API_URL=https://api.yourdomain.com/api
```

### Security Checklist

- [ ] Use strong, unique JWT_SECRET in production
- [ ] Restrict MongoDB Network Access to specific IPs
- [ ] Use environment-specific API keys
- [ ] Enable HTTPS for both frontend and backend
- [ ] Set up proper error logging and monitoring
- [ ] Regularly rotate API keys and secrets

---

## Support

If you encounter issues:

1. Check the error messages in terminal/console
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas cluster is running (not paused)
4. Check API key validity and rate limits
5. Review the troubleshooting section in README.md

For more help, check the main README.md file or open an issue on GitHub.
