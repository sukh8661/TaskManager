# Task Management Application with User Authentication

A full-stack task management application built with React, Node.js, Express, Prisma, and PostgreSQL.

## 🚀 Tech Stack

### Frontend
- React (Vite)
- TailwindCSS
- Redux Toolkit
- Axios
- React Hook Form
- Zod

### Backend
- Node.js + Express (TypeScript)
- Prisma ORM
- MongoDB
- JWT Authentication

## 📁 Project Structure

```
root/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── controllers/
│   │   ├── utils/
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.tsx
│   ├── public/
│   ├── tests/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher) or MongoDB Atlas account
- npm or yarn

### 1. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 2. Environment Variables

#### Backend (.env)
Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL="mongodb://localhost:27017/taskmanagement"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
NODE_ENV=development
```

**Note:** For MongoDB Atlas (cloud), use:
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/taskmanagement?retryWrites=true&w=majority"
```

#### Frontend (.env)
Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Database Setup

1. **Local MongoDB:**
   - Install and start MongoDB locally, or
   - Use MongoDB Atlas (cloud) - create a free cluster at https://www.mongodb.com/cloud/atlas

2. **Push Prisma schema to MongoDB:**
```bash
cd backend
npx prisma db push
```

3. **Generate Prisma Client:**
```bash
npx prisma generate
```

**Note:** MongoDB doesn't use traditional migrations. Use `prisma db push` to sync your schema with the database.

### 4. Running the Application

#### Backend
```bash
cd backend
npm run dev
```
The backend server will run on `http://localhost:5000`

#### Frontend
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173` (or another port if 5173 is taken)

### 5. Running Tests

#### Backend Tests
```bash
cd backend
npm test
```

#### Backend Test Coverage
```bash
cd backend
npm run test:coverage
```

#### Frontend Tests
```bash
cd frontend
npm test
```

#### Frontend Test Coverage
```bash
cd frontend
npm run test:coverage
```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Routes

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "username": "string"
  }
}
```

**Error (400):**
```json
{
  "error": "Username already exists"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "username": "string"
  }
}
```

**Error (401):**
```json
{
  "error": "Invalid credentials"
}
```

### Task Routes (Protected - Requires JWT)

All task routes require authentication. Include the JWT token in the Authorization header:
```http
Authorization: Bearer <jwt-token>
```

#### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "string",
    "description": "string | null",
    "status": "pending" | "completed",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
]
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "description": "string (optional)",
  "status": "pending" | "completed"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string | null",
  "status": "pending" | "completed",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "description": "string (optional)",
  "status": "pending" | "completed"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string | null",
  "status": "pending" | "completed",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

**Error (404):**
```json
{
  "error": "Task not found"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

**Error (404):**
```json
{
  "error": "Task not found"
}
```

## 🔐 Authentication Flow

1. User registers or logs in
2. Backend returns JWT token
3. Frontend stores token in localStorage
4. Token is included in Authorization header for protected routes
5. Backend validates token and extracts user ID
6. Users can only access their own tasks

## 🧪 Testing

### Backend Tests
- Auth routes (register, login)
- Task CRUD operations
- JWT middleware validation
- Error handling

### Frontend Tests
- Form validation
- Component rendering
- Redux store actions
- Protected route navigation

## 📝 Notes

- JWT tokens expire after 24 hours (configurable)
- Passwords are hashed using bcrypt
- All task operations are scoped to the authenticated user
- CORS is enabled for frontend development

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MongoDB is running (if using local MongoDB)
- Check DATABASE_URL in `.env` file
- For MongoDB Atlas, ensure your IP is whitelisted and credentials are correct
- Test connection with: `mongosh "your-connection-string"`

### Port Already in Use
- Change PORT in backend `.env`
- Update VITE_API_URL in frontend `.env` accordingly

### Prisma Issues
- Run `npx prisma generate` after schema changes
- Run `npx prisma db push` to sync schema with MongoDB
- Use `npx prisma studio` to view database

