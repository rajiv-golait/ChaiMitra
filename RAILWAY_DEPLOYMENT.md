# ChaiMitra Railway Deployment Guide 🚀

This guide will help you deploy ChaiMitra to Railway platform from your GitHub repository.

## 📋 Prerequisites

1. **GitHub Account** - Your repository should be pushed to GitHub
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **Firebase Project** - Ensure your Firebase project is set up and configured

## 🔧 Environment Variables Setup

In Railway, you'll need to configure these environment variables:

### Required Environment Variables:
```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_VAPID_KEY=your_vapid_key
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# Node.js Environment
NODE_ENV=production
PORT=5000

# Firebase Admin (for server-side)
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account_key.json
```

## 🚀 Deployment Steps

### Step 1: Push to GitHub
```bash
# Make sure all changes are committed and pushed
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### Step 2: Connect to Railway
1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `ChaiMitra` repository
4. Railway will automatically detect it as a Node.js project

### Step 3: Configure Environment Variables
🔐 **IMPORTANT: Never commit your .env file! It contains sensitive credentials.**

1. In your Railway project dashboard, go to **Variables** tab
2. Add all the environment variables listed above
3. Use the values from your local `.env` file (NOT the .env.example)
4. Copy each variable name and value individually into Railway's interface

### Step 4: Configure Firebase Admin
For server-side Firebase operations, you'll need to:
1. Download your Firebase service account key from Firebase Console
2. Either:
   - **Option A**: Base64 encode the JSON key and add it as `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Option B**: Add the JSON content directly as individual environment variables

### Step 5: Deploy
1. Railway will automatically build and deploy your application
2. The build process will:
   - Install dependencies (`npm install`)
   - Build the React frontend (`npm run build`)
   - Start the server (`npm start`)

## 📱 Build Process

Railway will execute these commands automatically:
```bash
npm install          # Install all dependencies
npm run build        # Build React frontend (creates /build folder)
npm start           # Start the Express server (serves React + API)
```

## 🌐 Application Structure After Deployment

```
Railway Container:
├── 📁 server/          # Express.js backend
│   ├── server.js       # Main server file
│   └── routes/         # API routes
├── 📁 build/           # Built React frontend
│   ├── index.html      # Main HTML file
│   └── static/         # CSS, JS, images
└── 📄 package.json     # Dependencies & scripts
```

## 🔍 Health Check

Your app includes a health check endpoint at `/api/health` that Railway can use to monitor your application.

## 📊 Monitoring

After deployment, you can:
1. View logs in Railway dashboard
2. Monitor performance metrics
3. Set up custom domains
4. Configure auto-scaling

## 🚨 Troubleshooting

### Common Issues:

**Build Fails:**
- Check that all dependencies are in `package.json`
- Verify environment variables are set correctly

**Firebase Connection Issues:**
- Ensure Firebase service account is properly configured
- Check that all Firebase environment variables are correct

**Port Issues:**
- Railway automatically assigns a port via `process.env.PORT`
- Our server is configured to use this automatically

**Static Files Not Loading:**
- The server serves React build files from `/build` directory
- Ensure the build process completed successfully

## 📞 Support

If you encounter issues:
1. Check Railway build logs
2. Verify all environment variables
3. Test Firebase connections
4. Check server logs for specific errors

## 🎉 Success!

Once deployed, your ChaiMitra app will be available at:
`https://your-project-name.railway.app`

The application serves:
- **Frontend**: React app with all pages and components
- **API**: Express.js backend at `/api/*` routes
- **Health Check**: `/api/health` for monitoring

---

**🍵 Your ChaiMitra app is now live on Railway! Ready to connect Indian street food vendors with suppliers worldwide.**
