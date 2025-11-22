# Quick Fix for Internal Server Error

## 🚨 Immediate Solution

The EPERM error means Prisma client wasn't generated properly. Follow these steps:

### Step 1: Stop Backend Server
Press `Ctrl+C` in the terminal where backend is running, or close the terminal.

### Step 2: Run Fix Script
```powershell
cd backend
npm run prisma:fix
```

Or manually:
```powershell
cd backend

# Stop Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Remove Prisma cache
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue

# Regenerate
npx prisma generate

# Push schema
npx prisma db push
```

### Step 3: Restart Backend
```powershell
npm run dev
```

### Step 4: Test Database Connection
Open in browser: `http://localhost:5000/api/test-db`

Should return: `{"status":"connected","message":"Database connection successful"}`

### Step 5: Try Registration Again
Go to frontend and try registering. Check the backend terminal for detailed error logs.

## 🔍 Debugging

If still getting errors:

1. **Check backend terminal** - It now shows detailed error messages
2. **Test database:** Visit `http://localhost:5000/api/test-db`
3. **Check MongoDB:** Open MongoDB Compass and verify connection
4. **Check .env file:** Verify `DATABASE_URL` is correct

## 📝 What Changed

- ✅ Added detailed error logging in registration
- ✅ Added database connection test endpoint (`/api/test-db`)
- ✅ Improved Prisma initialization with connection testing
- ✅ Created fix script for EPERM errors

The backend will now show you exactly what error is occurring!

