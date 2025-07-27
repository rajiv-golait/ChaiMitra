#!/bin/bash

# ChaiMitra Startup Script for Railway Deployment

echo "🍵 Starting ChaiMitra Application..."

# Check if build directory exists
if [ ! -d "build" ]; then
    echo "📦 Build directory not found. Running build process..."
    npm run build
fi

# Start the application
echo "🚀 Starting server..."
npm start
