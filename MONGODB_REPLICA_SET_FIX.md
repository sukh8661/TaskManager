# Fix: MongoDB Replica Set Required

## The Problem
Prisma requires MongoDB to run as a replica set, even for local development. The error `P2031` means your MongoDB is running as a standalone instance.

## Solution: Set Up One-Node Replica Set (Easiest for Local)

### Option 1: Quick Fix - One Node Replica Set

**Step 1: Stop MongoDB**
```powershell
# Stop MongoDB service
net stop MongoDB
```

**Step 2: Create MongoDB Data Directory**
```powershell
# Create data directory (if it doesn't exist)
mkdir C:\data\db -ErrorAction SilentlyContinue
mkdir C:\data\repl -ErrorAction SilentlyContinue
```

**Step 3: Start MongoDB as Replica Set**

Create a file `mongod-replica.cmd` in your backend folder:

```cmd
@echo off
mongod --replSet rs0 --port 27017 --dbpath C:\data\db --bind_ip localhost
```

**Step 4: Initialize Replica Set**

1. Start MongoDB using the command above (or start MongoDB service)
2. Open a new terminal and run:
```powershell
mongosh
```

3. In mongosh, run:
```javascript
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" }
  ]
})
```

4. Wait for it to show: `"ok" : 1`
5. Check status: `rs.status()`

**Step 5: Restart Backend**
```powershell
cd backend
npm run dev
```

### Option 2: Use MongoDB Atlas (Easiest - Cloud)

MongoDB Atlas comes with replica sets by default:

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update `backend/.env`:
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/taskmanagement?retryWrites=true&w=majority"
```

### Option 3: Modify Prisma Configuration (Workaround)

We can modify the code to work around this limitation.

