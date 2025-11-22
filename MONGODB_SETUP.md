# MongoDB Setup Guide

## 🔧 Setting Up MongoDB Connection

### Step 1: Check Your MongoDB Connection

Your MongoDB database is empty because either:
1. The connection string is incorrect
2. Prisma schema hasn't been pushed to MongoDB
3. MongoDB service isn't running

### Step 2: Verify MongoDB Connection String

Check your `backend/.env` file:

**For Local MongoDB:**
```env
DATABASE_URL="mongodb://localhost:27017/taskmanagement"
```

**For MongoDB Atlas (Cloud):**
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/taskmanagement?retryWrites=true&w=majority"
```

### Step 3: Push Prisma Schema to MongoDB

Run these commands in the `backend` directory:

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Push schema to MongoDB (creates collections)
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### Step 4: Verify Collections Are Created

After running `prisma db push`, you should see:
- `users` collection created
- `tasks` collection created

### Step 5: Test the Connection

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Try registering a user through the frontend

3. Check MongoDB Compass:
   - Open MongoDB Compass
   - Connect to your database
   - You should see the `taskmanagement` database
   - Inside, you should see `users` and `tasks` collections

## 🐛 Troubleshooting

### Issue: "Database connection failed"

**Solution:**
1. Verify MongoDB is running (if local):
   ```bash
   # Windows
   net start MongoDB
   
   # Or check MongoDB Compass connection
   ```

2. Check your connection string in `backend/.env`

3. For MongoDB Atlas:
   - Ensure your IP is whitelisted
   - Check username and password are correct
   - Verify cluster is running

### Issue: Collections not appearing

**Solution:**
1. Run `npx prisma db push` again
2. Check for errors in the terminal
3. Verify DATABASE_URL is correct

### Issue: "PrismaClientInitializationError"

**Solution:**
1. Check MongoDB connection string
2. Ensure MongoDB service is running
3. For Atlas, verify network access settings

## ✅ Verification Checklist

- [ ] MongoDB is running (local) or Atlas cluster is active
- [ ] `DATABASE_URL` in `backend/.env` is correct
- [ ] Ran `npx prisma generate`
- [ ] Ran `npx prisma db push` successfully
- [ ] Can see `users` and `tasks` collections in MongoDB Compass
- [ ] Backend server starts without errors
- [ ] Can register a new user successfully

## 📊 Expected Database Structure

After setup, your MongoDB should have:

**Database:** `taskmanagement`
- **Collection:** `users`
- **Collection:** `tasks`

Both collections will be empty until you create users and tasks through the application.

