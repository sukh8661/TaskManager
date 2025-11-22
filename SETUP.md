# Quick Setup Guide

## Prerequisites
- Node.js (v18+)
- MongoDB (v5+) or MongoDB Atlas account
- npm or yarn

## Step-by-Step Setup

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 3. Set Up Database

#### Option A: Local MongoDB
1. Install MongoDB locally and start the service
2. MongoDB will be available at `mongodb://localhost:27017`

#### Option B: MongoDB Atlas (Cloud - Recommended)
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string

#### Configure Backend Environment
Create `backend/.env` file:

**For Local MongoDB:**
```env
DATABASE_URL="mongodb://localhost:27017/taskmanagement"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
NODE_ENV=development
```

**For MongoDB Atlas:**
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/taskmanagement?retryWrites=true&w=majority"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
NODE_ENV=development
```

#### Push Prisma Schema to MongoDB
```bash
cd backend
npx prisma db push
npx prisma generate
```

**Note:** MongoDB uses `prisma db push` instead of migrations. This syncs your schema directly with the database.

### 4. Configure Frontend Environment
Create `frontend/.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Start Development Servers

#### Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:5000

#### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5173

### 6. Run Tests

#### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

#### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

## Troubleshooting

### Database Connection Issues
- **Local MongoDB:** Verify MongoDB service is running
- **MongoDB Atlas:** Check your connection string and ensure IP is whitelisted
- Test connection: `mongosh "your-connection-string"`
- Check DATABASE_URL in `backend/.env`

### Port Already in Use
- Change PORT in `backend/.env`
- Update VITE_API_URL in `frontend/.env` accordingly

### Prisma Issues
- Run `npx prisma generate` after schema changes
- Run `npx prisma db push` to sync schema with MongoDB
- Use `npx prisma studio` to view database
- MongoDB doesn't use migrations - use `db push` instead

## Next Steps

1. Open http://localhost:5173 in your browser
2. Register a new account
3. Start creating tasks!

