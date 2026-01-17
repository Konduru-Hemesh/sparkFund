SparkFund – Innovation & Funding Platform :
    A MERN-stack platform where innovators pitch ideas, investors fund them, and collaborators join projects — powering an ecosystem of accessible innovation.

Features
   -> Role-based authentication (Innovator / Investor / Admin)
   -> Invest in ideas with secure workflow & funding updates
   -> Collaboration requests with accept/reject flow
   -> Reviews & ratings system with auto-rating update
   -> Withdrawal request system with admin approvals
   -> Dashboards for investments, funding progress & analytics
   -> Modular backend architecture with secure CRUD APIs
   -> Clean and responsive UI with reusable components

Tech Stack :-
    Layer	              Technologies
   Frontend	      React.js, Tailwind CSS, Axios
    Backend	         Node.js, Express.js
   Database	           MongoDB (Mongoose)
     Auth	          JWT (JSON Web Token)
     Tools	               Git, Postman

Project Structure
    sparkfund/
    │
    ├── backend/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   └── server.js
    │
    └── frontend/
        ├── components/
        ├── pages/
        └── services/

Testing & Validation
    ->API testing via Postman
    ->Full CRUD validation
    ->Token-based authorization checks
    ->Input validation & error handling

Future Enhancements
    -> Realtime notifications (Socket.io)
    -> Chat system for idea collaboration
    -> Advanced analytics dashboard
    -> Multi-level admin panel
    -> Wallet / UPI-based transactions

Installation & Setup :- 

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (free tier available at https://www.mongodb.com/cloud/atlas)
- Google Gemini API Key (free at https://aistudio.google.com/app/apikey)

## Step 1: Clone the Repository
```bash
git clone https://github.com/Konduru-Hemesh/sparkFund.git
cd sparkFund
```

## Step 2: MongoDB Atlas Setup (Online Database)

1. **Create a MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account
   - Create a new free cluster (M0 Sandbox)

2. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and strong password (save these!)
   - Set User Privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

3. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) or add your IP address
   - Click "Confirm"

4. **Get Your Connection String**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `sparkfund` or your preferred database name
   - Final format: `mongodb+srv://username:password@cluster.mongodb.net/sparkfund?retryWrites=true&w=majority`

## Step 3: Backend Setup

```bash
cd backend
npm install
```

### Configure Environment Variables

1. Create a `.env` file in the `backend/` directory
2. Copy the contents from `backend/env.example.txt` to your `.env` file
3. Update the following variables:

```env
# MongoDB Atlas Connection String (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sparkfund?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# JWT Secret (generate using: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Google Gemini API Key (REQUIRED for chatbot)
GEMINI_API_KEY=your-gemini-api-key-here

# Firebase (Optional - for push notifications)
FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json
```

**Important Notes:**
- Replace `MONGODB_URI` with your actual MongoDB Atlas connection string from Step 2
- Replace `GEMINI_API_KEY` with your Google Gemini API key
- Generate a secure `JWT_SECRET` using: `openssl rand -base64 32`

### Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

## Step 4: Frontend Setup

```bash
cd frontend
npm install
```

### Configure Environment Variables (Optional)

1. Create a `.env` file in the `frontend/` directory if needed
2. For local development, the default proxy configuration works automatically
3. If connecting to a different backend:

```env
VITE_API_URL=http://localhost:5000/api
```

### Start Frontend Development Server

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Step 5: Verify Installation

1. **Check Backend Connection:**
   - Visit `http://localhost:5000/health`
   - Should return: `{"status":"OK","timestamp":"..."}`
   - Check terminal for: `✅ MongoDB Connected: cluster.mongodb.net`

2. **Test Chatbot:**
   - Login to the application
   - Navigate to AI Assistant page
   - Try sending a message
   - If you see an error about API key, verify your `GEMINI_API_KEY` in the backend `.env` file

## Troubleshooting

### MongoDB Connection Issues

**Error: "MONGODB_URI environment variable is not set"**
- Make sure you created a `.env` file in the `backend/` directory
- Verify the `MONGODB_URI` variable is set correctly

**Error: "authentication failed"**
- Verify your MongoDB username and password are correct
- Make sure you replaced `<password>` in the connection string

**Error: "ENOTFOUND" or connection timeout**
- Check your Network Access in MongoDB Atlas
- Make sure "Allow Access from Anywhere" is enabled or your IP is whitelisted
- Verify your cluster is running (not paused)

### Chatbot Issues

**Error: "AI service is not configured"**
- Set `GEMINI_API_KEY` in your backend `.env` file
- Get your API key from: https://aistudio.google.com/app/apikey

**Error: "rate limit exceeded"**
- You've exceeded the free tier limit for Gemini API
- Wait a few minutes and try again
- Consider upgrading your API plan if needed

### CORS Issues

- Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL
- For multiple origins, use comma-separated values: `http://localhost:5173,http://localhost:3000`

## Project Structure

```
sparkfund/
│
├── backend/
│   ├── config/
│   │   ├── database.js        # MongoDB connection configuration
│   │   └── firebase.js
│   ├── controllers/
│   │   ├── aiController.js    # AI chatbot controller
│   │   └── ...
│   ├── models/                # Mongoose models
│   ├── routes/                # API routes
│   ├── .env                   # Environment variables (create this)
│   ├── env.example.txt        # Example environment variables
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── AIAssistantPage.jsx  # AI Chatbot page
    │   │   └── ...
    │   └── services/
    │       └── api.js          # API service configuration
    ├── .env                    # Optional frontend env vars
    └── env.example.txt         # Example environment variables
```

## Additional Notes

- The backend now uses MongoDB Atlas (online) instead of localhost MongoDB
- The chatbot uses Google Gemini AI (free tier available)
- All environment variables are documented in `env.example.txt` files
- Make sure to never commit your `.env` files to version control

Author :- 
     Konduru Hemesh
     Contact: konduruhemesh778@gmail.com
     GitHub: https://github.com/Konduru-Hemesh
