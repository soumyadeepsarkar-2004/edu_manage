# Architecture

This document explains how the EduManage system is structured, how the components interact, and the key design decisions made.

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser / Client                        │
│            React 18 SPA served from Vercel CDN                  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS (Axios)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Backend API (Express.js on Vercel)                  │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │  /auth   │  │ /courses │  │  /users  │  │ /assignments   │  │
│  │ /upload  │  │ /grades  │  │ /enroll  │  │ /submissions   │  │
│  │ /attend  │  │ /messages│  │ /notifs  │  │ /analytics     │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Middleware: auth.js (JWT verify) · upload.js (Multer)  │    │
│  └─────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │ Mongoose ODM
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MongoDB Atlas (Cloud)                          │
│  Collections: users · courses · enrollments · assignments        │
│               submissions · attendance · grades · messages        │
│               notifications                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Entry Points

| File | Role |
|---|---|
| `index.js` | Mounts `<App />` into the DOM, wraps in `<AuthProvider>` |
| `App.js` | Defines all React Router v6 `<Route>` declarations |
| `context/AuthContext.js` | Global auth state, axios `baseURL` and `Authorization` header |

### Routing Strategy

Routes are protected by a wrapper component that reads from `AuthContext`. Unauthenticated users are redirected to `/login`. Role-specific routes further redirect if the user's role doesn't match.

```
/                 → PublicLayout (landing page)
/login            → Login
/register         → Register
/dashboard        → Layout → role-switch → Student/Instructor/Admin Dashboard
/courses          → CourseList
/courses/:id      → CourseDetail
/assignments      → AssignmentList
...
```

### State Management

The app uses **React Context + `useState`** without any external state library. Each page/component fetches its own data via `axios` on mount. The only shared state is:
- `user` (current user object)
- `loading` (auth loading flag)
- Helper functions: `login`, `register`, `logout`

### Component Structure

```
components/
├── Auth/           Login, Register
├── Layout/         Layout (authenticated shell), PublicLayout
├── Home/           Landing page sections
├── Common/         Reusable UI: loaders, buttons, badges
├── Dashboard/      StudentDashboard, InstructorDashboard, AdminDashboard
├── Courses/        CourseList, CourseDetail, CreateCourse, CourseMaterials, CoursePerformance
├── Assignments/    AssignmentList, AssignmentDetail, CreateAssignment, AssignmentSubmissions
├── Enrollments/    MyEnrollments
├── Attendance/     AttendanceView
├── Grades/         GradeView
├── Messages/       Messages
├── Profile/        Profile
└── Admin/          UserManagement
```

---

## Backend Architecture

### Server Lifecycle

The Express app is exported as `module.exports = app`. This enables two run modes:

1. **Local dev** — `node server.js` (or via nodemon): `require.main === module` is `true`, so `app.listen()` is called directly.
2. **Vercel serverless** — Vercel imports `server.js` as a module. `require.main === module` is `false`, so `app.listen()` is skipped, and Vercel manages the HTTP lifecycle.

```js
// server.js (simplified)
module.exports = app;

if (require.main === module) {
  connectDB().then(() => app.listen(PORT));
}
```

### Database Connection (Serverless-Safe)

Serverless functions have no persistent process. Naively connecting on every invocation would exhaust the MongoDB connection pool. EduManage uses a **lazy connection with a module-level flag**:

```js
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;           // re-use existing connection
  await mongoose.connect(URI);
  isConnected = true;
};

app.use(async (req, res, next) => {  // runs before every route
  await connectDB();
  next();
});
```

Node.js module caching means `isConnected` persists across requests within the same warm serverless instance. Once the connection is established, subsequent requests reuse it without reconnecting.

### Middleware Stack

```
Request
  │
  ├── CORS          (dynamic origin allow-list: ClientURL + *.vercel.app + localhost)
  ├── express.json  (body parsing, 10MB limit)
  ├── connectDB     (lazy MongoDB connection)
  │
  ├── [Route handler]
  │     └── auth    (optional — JWT verify → req.user)
  │     └── authorize (optional — role check)
  │
  └── Error handler (last middleware)
```

### Role-Based Access Control

Three roles: `student`, `instructor`, `admin`.

```js
// middleware/auth.js
const auth = async (req, res, next) => { /* JWT verify, attaches req.user */ };
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json(...);
  next();
};
```

Route usage:
```js
router.put('/:id/approve', [auth, authorize('admin')], handler);
```

---

## Data Models

### User
```
firstName, lastName, email (unique), password (hashed), role (student|instructor|admin),
isActive, verificationStatus (pending|verified|rejected), documents[], instructorProfile,
createdAt, updatedAt
```

### Course
```
title, description, instructor (ref: User), category, level, status (pending|approved|rejected),
maxStudents, enrolledCount, materials[], startDate, endDate, createdAt
```

### Enrollment
```
student (ref: User), course (ref: Course), enrolledAt, status (active|completed|dropped)
```

### Assignment
```
course (ref: Course), title, description, dueDate, maxScore, createdAt
```

### Submission
```
assignment (ref: Assignment), student (ref: User), textContent, fileUrl,
submittedAt, score, feedback, gradedAt, gradedBy (ref: User)
```

### Attendance
```
course (ref: Course), date, instructor (ref: User),
records: [{ student (ref: User), status (present|absent|late) }]
```

### Grade
```
student (ref: User), course (ref: Course), assignment (ref: Assignment),
score, maxScore, gradedAt
```

### Message
```
sender (ref: User), recipient (ref: User), content, readAt, createdAt
```

### Notification
```
recipient (ref: User), type, message, relatedId, read, createdAt
```

---

## File Upload Architecture

| Environment | Storage | Path |
|---|---|---|
| Development | Local disk | `backend/uploads/{course-materials,documents,videos,profiles}/` |
| Production (Vercel) | `/tmp` (ephemeral) | `/tmp/{course-materials,documents,videos,profiles}/` |

> **Important:** Vercel's filesystem is read-only except for `/tmp`, which is ephemeral (wiped between cold starts). For persistent file storage in production, configure **Cloudflare R2** — set the `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME` env vars. See [docs/ENVIRONMENT.md](./ENVIRONMENT.md) for setup details.

---

## Security Considerations

- Passwords hashed with **bcryptjs** (salt rounds: 10)
- JWT tokens signed with a secret ≥ 64 characters, expire in 7 days by default
- All private routes protected by `auth` middleware
- Role checks applied per route via `authorize()`
- Input validated on all POST/PUT endpoints using `express-validator`
- File uploads filtered by MIME type and extension; max size enforced by Multer
- CORS restricted to known frontend origins
