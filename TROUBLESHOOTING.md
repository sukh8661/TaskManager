# Troubleshooting Guide

## Issue: Internal Server Error on Registration

### Step 1: Stop the Backend Server

The EPERM error occurs because the Prisma query engine file is locked by the running server.

**Solution:**
1. Stop the backend server (Ctrl+C in the terminal where it's running)
2. Close any other processes that might be using Prisma

### Step 2: Regenerate Prisma Client

```bash
cd backend

# Delete the .prisma folder to force regeneration
rmdir /s /q node_modules\.prisma 2>nul || echo "Folder doesn't exist"

# Regenerate Prisma client
npx prisma generate
```

### Step 3: Test Database Connection

```bash
# Test if MongoDB is accessible
npx prisma db push
```

### Step 4: Restart Backend Server

```bash
npm run dev
```

### Step 5: Test Database Connection via API

Open in browser or use curl:
```
http://localhost:5000/api/test-db
```

This will tell you if the database connection is working.

## Common Issues and Solutions

### Issue: "EPERM: operation not permitted"

**Cause:** Prisma query engine file is locked by running process

**Solution:**
1. Stop all Node.js processes
2. Close VS Code/IDE if it's running the server
3. Run `npx prisma generate` again
4. If still failing, restart your computer

### Issue: "Database connection failed"

**Check:**
1. MongoDB is running (check MongoDB Compass or service status)
2. DATABASE_URL in `.env` is correct
3. For MongoDB Atlas: IP is whitelisted, credentials are correct

**Test connection:**
```bash
# In backend directory
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$connect().then(() => console.log('Connected!')).catch(e => console.error('Error:', e));"
```

### Issue: "Collections are empty"

**This is normal!** Collections are created but empty until you:
1. Register a user (creates entry in `users` collection)
2. Create tasks (creates entries in `tasks` collection)

### Issue: Still getting "Internal server error"

**Debug steps:**
1. Check backend terminal for error logs
2. Visit `http://localhost:5000/api/test-db` to test connection
3. Check MongoDB Compass to see if data is being created
4. Look at browser console (F12) for frontend errors
5. Check Network tab in browser DevTools to see the actual error response

## Quick Fix Script

Run this in PowerShell (in backend directory):

```powershell
# Stop any running Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Regenerate Prisma
npx prisma generate

# Push schema
npx prisma db push

# Start server
npm run dev
```

## Verify Everything Works

1. **Backend is running:** `http://localhost:5000/health` should return `{"status":"ok"}`
2. **Database connected:** `http://localhost:5000/api/test-db` should return connection status
3. **Frontend works:** `http://localhost:5173` should load
4. **Registration works:** Try registering a new user
5. **Check MongoDB:** Open MongoDB Compass and verify data appears

## Still Having Issues?

1. Check the backend terminal for detailed error messages
2. The error handler now logs full error details in development mode
3. Check the browser console (F12) for frontend errors
4. Verify your `.env` file has correct `DATABASE_URL`

