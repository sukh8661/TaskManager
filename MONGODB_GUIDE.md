# MongoDB Data Storage & CRUD Operations Guide

## 📊 How Data is Stored in MongoDB

### Database Structure

MongoDB stores data in **collections** (similar to tables in SQL). Our application uses two collections:

1. **`users`** collection
2. **`tasks`** collection

### User Collection Structure

Each user document in the `users` collection looks like this:

```json
{
  "_id": "507f1f77bcf86cd799439011",  // MongoDB ObjectId (automatically generated)
  "username": "john_doe",
  "password": "$2a$10$hashedPasswordHere...",  // bcrypt hashed password
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Fields:**
- `_id`: Unique identifier (MongoDB ObjectId)
- `username`: Unique username (indexed for fast lookups)
- `password`: Hashed password using bcrypt
- `createdAt`: Timestamp when user was created
- `updatedAt`: Timestamp when user was last updated

### Task Collection Structure

Each task document in the `tasks` collection looks like this:

```json
{
  "_id": "507f191e810c19729de860ea",  // MongoDB ObjectId
  "userId": "507f1f77bcf86cd799439011",  // Reference to user's _id (ObjectId)
  "title": "Complete project documentation",
  "description": "Write comprehensive documentation for the task management app",
  "status": "pending",  // "pending" or "completed"
  "createdAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Fields:**
- `_id`: Unique identifier (MongoDB ObjectId)
- `userId`: Reference to the user who owns this task (ObjectId)
- `title`: Task title (required)
- `description`: Optional task description
- `status`: Task status - either "pending" or "completed"
- `createdAt`: Timestamp when task was created
- `updatedAt`: Timestamp when task was last updated

**Index:**
- `userId` is indexed for fast queries when fetching all tasks for a user

## 🔄 How CRUD Operations Work

### 1. CREATE Operations

#### Creating a User (Registration)

**API Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "username": "john_doe",
  "password": "securepassword123"
}
```

**What Happens:**
1. Backend validates username and password
2. Checks if username already exists in `users` collection
3. Hashes password using bcrypt
4. Creates new document in `users` collection
5. Returns user data (without password)

**MongoDB Operation:**
```javascript
await prisma.user.create({
  data: {
    username: "john_doe",
    password: "$2a$10$hashedPassword...",
  }
});
```

**Result in MongoDB:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "password": "$2a$10$hashedPassword...",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### Creating a Task

**API Endpoint:** `POST /api/tasks` (requires JWT token)

**Request:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive documentation",
  "status": "pending"
}
```

**What Happens:**
1. Backend validates JWT token and extracts `userId`
2. Validates task data (title, description, status)
3. Creates new document in `tasks` collection with `userId`
4. Returns created task

**MongoDB Operation:**
```javascript
await prisma.task.create({
  data: {
    title: "Complete project documentation",
    description: "Write comprehensive documentation",
    status: "pending",
    userId: "507f1f77bcf86cd799439011"  // From JWT token
  }
});
```

**Result in MongoDB:**
```json
{
  "_id": "507f191e810c19729de860ea",
  "userId": "507f1f77bcf86cd799439011",
  "title": "Complete project documentation",
  "description": "Write comprehensive documentation",
  "status": "pending",
  "createdAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

### 2. READ Operations

#### Reading User Tasks

**API Endpoint:** `GET /api/tasks` (requires JWT token)

**What Happens:**
1. Backend validates JWT token and extracts `userId`
2. Queries `tasks` collection for all tasks where `userId` matches
3. Returns array of tasks sorted by creation date (newest first)

**MongoDB Operation:**
```javascript
await prisma.task.findMany({
  where: { userId: "507f1f77bcf86cd799439011" },
  orderBy: { createdAt: 'desc' }
});
```

**MongoDB Query (equivalent):**
```javascript
db.tasks.find({ userId: ObjectId("507f1f77bcf86cd799439011") })
  .sort({ createdAt: -1 })
```

**Result:**
```json
[
  {
    "_id": "507f191e810c19729de860ea",
    "userId": "507f1f77bcf86cd799439011",
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation",
    "status": "pending",
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  },
  {
    "_id": "507f191e810c19729de860eb",
    "userId": "507f1f77bcf86cd799439011",
    "title": "Review code",
    "description": null,
    "status": "completed",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

**Important:** Users can only see their own tasks. The `userId` filter ensures data isolation.

### 3. UPDATE Operations

#### Updating a Task

**API Endpoint:** `PUT /api/tasks/:id` (requires JWT token)

**Request:**
```json
{
  "title": "Updated task title",
  "status": "completed"
}
```

**What Happens:**
1. Backend validates JWT token and extracts `userId`
2. Verifies task exists and belongs to the user
3. Updates task document in `tasks` collection
4. Returns updated task

**MongoDB Operation:**
```javascript
// First verify ownership
const existingTask = await prisma.task.findFirst({
  where: {
    id: "507f191e810c19729de860ea",
    userId: "507f1f77bcf86cd799439011"
  }
});

// Then update
await prisma.task.update({
  where: { id: "507f191e810c19729de860ea" },
  data: {
    title: "Updated task title",
    status: "completed"
  }
});
```

**MongoDB Query (equivalent):**
```javascript
db.tasks.updateOne(
  { 
    _id: ObjectId("507f191e810c19729de860ea"),
    userId: ObjectId("507f1f77bcf86cd799439011")
  },
  {
    $set: {
      title: "Updated task title",
      status: "completed",
      updatedAt: new Date()
    }
  }
)
```

**Result in MongoDB:**
```json
{
  "_id": "507f191e810c19729de860ea",
  "userId": "507f1f77bcf86cd799439011",
  "title": "Updated task title",
  "description": "Write comprehensive documentation",
  "status": "completed",
  "createdAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z"  // Updated timestamp
}
```

### 4. DELETE Operations

#### Deleting a Task

**API Endpoint:** `DELETE /api/tasks/:id` (requires JWT token)

**What Happens:**
1. Backend validates JWT token and extracts `userId`
2. Verifies task exists and belongs to the user
3. Deletes task document from `tasks` collection
4. Returns success message

**MongoDB Operation:**
```javascript
// First verify ownership
const existingTask = await prisma.task.findFirst({
  where: {
    id: "507f191e810c19729de860ea",
    userId: "507f1f77bcf86cd799439011"
  }
});

// Then delete
await prisma.task.delete({
  where: { id: "507f191e810c19729de860ea" }
});
```

**MongoDB Query (equivalent):**
```javascript
db.tasks.deleteOne({
  _id: ObjectId("507f191e810c19729de860ea"),
  userId: ObjectId("507f1f77bcf86cd799439011")
})
```

**Result:** Document is removed from `tasks` collection.

## 🔐 Security & Data Isolation

### User Authentication Flow

1. **Login:** User provides username and password
   - Backend finds user in `users` collection
   - Compares hashed password
   - Generates JWT token containing `userId`
   - Returns token to frontend

2. **Protected Routes:** All task operations require JWT token
   - Frontend sends token in `Authorization: Bearer <token>` header
   - Backend validates token and extracts `userId`
   - All queries filter by `userId` to ensure users only see their own data

### Data Isolation Example

**User A (userId: "507f1f77bcf86cd799439011")** creates tasks:
- Task 1: "Buy groceries"
- Task 2: "Call dentist"

**User B (userId: "507f1f77bcf86cd799439012")** creates tasks:
- Task 3: "Finish report"
- Task 4: "Schedule meeting"

**When User A logs in and fetches tasks:**
- MongoDB query: `db.tasks.find({ userId: ObjectId("507f1f77bcf86cd799439011") })`
- Returns: Only Task 1 and Task 2
- User A cannot see Task 3 or Task 4

**When User B logs in and fetches tasks:**
- MongoDB query: `db.tasks.find({ userId: ObjectId("507f1f77bcf86cd799439012") })`
- Returns: Only Task 3 and Task 4
- User B cannot see Task 1 or Task 2

## 📝 Example: Complete User Journey

### 1. User Registration
```bash
POST /api/auth/register
{
  "username": "alice",
  "password": "password123"
}
```
**MongoDB:** Creates document in `users` collection

### 2. User Login
```bash
POST /api/auth/login
{
  "username": "alice",
  "password": "password123"
}
```
**MongoDB:** Finds user in `users` collection, verifies password
**Response:** Returns JWT token with `userId`

### 3. Create Task
```bash
POST /api/tasks
Authorization: Bearer <token>
{
  "title": "Learn MongoDB",
  "description": "Study MongoDB CRUD operations",
  "status": "pending"
}
```
**MongoDB:** Creates document in `tasks` collection with `userId` from token

### 4. Get All Tasks
```bash
GET /api/tasks
Authorization: Bearer <token>
```
**MongoDB:** Queries `tasks` collection where `userId` matches token's `userId`

### 5. Update Task
```bash
PUT /api/tasks/507f191e810c19729de860ea
Authorization: Bearer <token>
{
  "status": "completed"
}
```
**MongoDB:** Updates task document (only if `userId` matches)

### 6. Delete Task
```bash
DELETE /api/tasks/507f191e810c19729de860ea
Authorization: Bearer <token>
```
**MongoDB:** Deletes task document (only if `userId` matches)

## 🛠️ Viewing Data in MongoDB

### Using Prisma Studio
```bash
cd backend
npx prisma studio
```
Opens browser at `http://localhost:5555` to view and edit data

### Using MongoDB Compass
Connect to your MongoDB instance and browse collections:
- `users` collection
- `tasks` collection

### Using MongoDB Shell
```bash
mongosh "mongodb://localhost:27017/taskmanagement"
```

**View all users:**
```javascript
db.users.find().pretty()
```

**View all tasks:**
```javascript
db.tasks.find().pretty()
```

**View tasks for specific user:**
```javascript
db.tasks.find({ userId: ObjectId("507f1f77bcf86cd799439011") })
```

## 🔍 Key MongoDB Concepts Used

1. **Collections:** Equivalent to tables (users, tasks)
2. **Documents:** Equivalent to rows (each user/task is a document)
3. **ObjectId:** Unique identifier for each document
4. **Indexes:** `userId` is indexed for fast queries
5. **Relations:** Tasks reference users via `userId` field
6. **Cascade Delete:** If user is deleted, their tasks are automatically deleted

## ✅ Summary

- **Users** are stored in the `users` collection with hashed passwords
- **Tasks** are stored in the `tasks` collection with a reference to the user
- All CRUD operations filter by `userId` to ensure data isolation
- JWT tokens contain `userId` to identify the authenticated user
- Prisma ORM handles all MongoDB operations transparently

