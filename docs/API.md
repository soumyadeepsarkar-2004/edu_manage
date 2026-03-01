# API Reference

All endpoints live under the base URL. Authenticated routes require the `Authorization: Bearer <token>` header.

**Local:** `http://localhost:5000`  
**Production:** `https://backend-mu-beige-26.vercel.app`

---

## Table of Contents

- [Health](#health)
- [Authentication](#authentication)
- [Users](#users)
- [Courses](#courses)
- [Enrollments](#enrollments)
- [Assignments](#assignments)
- [Submissions](#submissions)
- [Attendance](#attendance)
- [Grades](#grades)
- [Messages](#messages)
- [Notifications](#notifications)
- [Uploads](#uploads)
- [Analytics](#analytics)

---

## Health

### `GET /api/health`
No authentication required.

**Response `200`:**
```json
{
  "message": "Server is running!",
  "timestamp": "2026-03-02T00:00:00.000Z"
}
```

---

## Authentication

### `POST /api/auth/register`
Register a new student or instructor account.

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "student"
}
```
`role` must be `student` or `instructor`.

**Response `201`:**
```json
{
  "token": "<jwt>",
  "user": { "_id": "...", "firstName": "Jane", "role": "student", ... }
}
```

---

### `POST /api/auth/login`

**Body:**
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

**Response `200`:**
```json
{
  "token": "<jwt>",
  "user": { "_id": "...", "role": "student", ... }
}
```

---

### `GET /api/auth/me` 🔒
Get the currently authenticated user's profile.

**Response `200`:**
```json
{
  "user": { "_id": "...", "firstName": "Jane", "email": "...", "role": "student" }
}
```

---

### `POST /api/auth/upload-documents` 🔒 *(Instructor)*
Upload verification documents (PDF, images, DOCX). Multipart form-data with field `documents` (up to 5 files).

---

## Users

> Admin-only endpoints unless noted.

### `GET /api/users` 🔒 *(Admin)*
List all users with pagination.

**Query params:** `page`, `limit`, `role` (`student` | `instructor` | `admin`)

---

### `GET /api/users/:id` 🔒
Get a single user by ID.

---

### `PUT /api/users/:id` 🔒
Update user profile.

---

### `PUT /api/users/:id/verify` 🔒 *(Admin)*
Approve or reject an instructor's verification request.

**Body:**
```json
{ "verificationStatus": "verified" }
```
`verificationStatus`: `verified` | `rejected`

---

### `DELETE /api/users/:id` 🔒 *(Admin)*
Deactivate a user account.

---

## Courses

### `GET /api/courses`
List published/approved courses. Public — no auth required.

**Query params:** `page`, `limit`, `category`, `search`

---

### `GET /api/courses/:id`
Get full course details including materials and instructor info.

---

### `POST /api/courses` 🔒 *(Verified Instructor)*
Create a new course (starts as `pending` approval).

**Body:**
```json
{
  "title": "Introduction to React",
  "description": "...",
  "category": "Web Development",
  "level": "beginner",
  "maxStudents": 50,
  "startDate": "2026-04-01",
  "endDate": "2026-06-30"
}
```

---

### `PUT /api/courses/:id` 🔒 *(Instructor — own course)*
Update course details.

---

### `PUT /api/courses/:id/approve` 🔒 *(Admin)*
Approve or reject a course.

**Body:** `{ "status": "approved" }` | `{ "status": "rejected", "reason": "..." }`

---

### `DELETE /api/courses/:id` 🔒 *(Instructor / Admin)*
Delete a course.

---

### `POST /api/courses/:id/materials` 🔒 *(Instructor)*
Add a material entry (link, video, document) to a course.

---

### `DELETE /api/courses/:id/materials/:materialId` 🔒 *(Instructor)*
Remove a material from a course.

---

## Enrollments

### `GET /api/enrollments` 🔒
Returns the current user's enrollments (Student) or enrolled student list per course (Instructor).

---

### `POST /api/enrollments` 🔒 *(Student)*
Enroll in a course.

**Body:** `{ "courseId": "<id>" }`

---

### `DELETE /api/enrollments/:id` 🔒 *(Student)*
Withdraw from a course.

---

## Assignments

### `GET /api/assignments` 🔒
List assignments. Students see assignments for their enrolled courses. Instructors see their own course assignments.

**Query params:** `courseId`

---

### `GET /api/assignments/:id` 🔒
Get a single assignment with submission status.

---

### `POST /api/assignments` 🔒 *(Instructor)*
Create an assignment.

**Body:**
```json
{
  "courseId": "<id>",
  "title": "Week 1 Exercise",
  "description": "...",
  "dueDate": "2026-04-15T23:59:00.000Z",
  "maxScore": 100
}
```

---

### `PUT /api/assignments/:id` 🔒 *(Instructor)*
Update assignment details.

---

### `DELETE /api/assignments/:id` 🔒 *(Instructor)*
Delete an assignment.

---

## Submissions

### `GET /api/submissions` 🔒
Get submissions. Students see their own. Instructors see submissions for their assignments.

**Query params:** `assignmentId`

---

### `POST /api/submissions` 🔒 *(Student)*
Submit an assignment. Multipart form-data (optional file) + JSON fields.

**Fields:** `assignmentId`, `textContent`, optional `file`

---

### `PUT /api/submissions/:id/grade` 🔒 *(Instructor)*
Grade a submission.

**Body:**
```json
{
  "score": 85,
  "feedback": "Good work, but improve error handling."
}
```

---

## Attendance

### `GET /api/attendance` 🔒
Get attendance records. Students see their own. Instructors see their course attendance.

**Query params:** `courseId`, `date`

---

### `POST /api/attendance` 🔒 *(Instructor)*
Record attendance for a session.

**Body:**
```json
{
  "courseId": "<id>",
  "date": "2026-04-01",
  "records": [
    { "studentId": "<id>", "status": "present" },
    { "studentId": "<id>", "status": "absent" }
  ]
}
```

`status`: `present` | `absent` | `late`

---

### `PUT /api/attendance/:id` 🔒 *(Instructor)*
Update a single attendance record.

---

## Grades

### `GET /api/grades` 🔒
Get grades. Students see their own. Instructors see their course grades.

**Query params:** `courseId`

---

### `PUT /api/grades/:id` 🔒 *(Instructor)*
Update a grade entry.

---

## Messages

### `GET /api/messages` 🔒
Get all conversations for the current user.

---

### `GET /api/messages/:userId` 🔒
Get message thread with a specific user.

---

### `POST /api/messages` 🔒
Send a message.

**Body:**
```json
{
  "recipientId": "<id>",
  "content": "Hello, I have a question about the assignment."
}
```

---

## Notifications

### `GET /api/notifications` 🔒
List notifications for the current user.

---

### `PUT /api/notifications/:id/read` 🔒
Mark a notification as read.

---

### `PUT /api/notifications/read-all` 🔒
Mark all notifications as read.

---

## Uploads

### `POST /api/upload` 🔒 *(Instructor)*
Upload a single course material file. Multipart form-data.

**Field:** `file` (video, PDF, image, document ≤ 100 MB)  
**Body field:** `type` — `video` | `document` | `pdf` | `note`

**Response `200`:**
```json
{
  "message": "File uploaded successfully",
  "filename": "material-1234567890.pdf",
  "url": "https://.../uploads/documents/material-1234567890.pdf",
  "size": 204800,
  "mimetype": "application/pdf"
}
```

---

### `POST /api/upload/multiple` 🔒 *(Instructor)*
Upload up to 5 files at once. Field name: `files`.

---

## Analytics

### `GET /api/analytics/overview` 🔒 *(Admin)*
Platform-level stats: total users, courses, enrollments, submissions.

### `GET /api/analytics/courses` 🔒 *(Admin / Instructor)*
Course performance metrics.

### `GET /api/analytics/users` 🔒 *(Admin)*
User growth and activity over time.

---

## Error Format

All errors follow this shape:

```json
{
  "message": "Human-readable error description",
  "errors": [ { "msg": "...", "param": "..." } ]
}
```

| Code | Meaning |
|---|---|
| `400` | Validation error or bad request |
| `401` | Missing or invalid JWT |
| `403` | Authenticated but not authorised for this action |
| `404` | Resource not found |
| `500` | Internal server error |

---

## Authentication Flow

```
Client                         Server
  │                               │
  ├─── POST /api/auth/login ──────► Validates credentials
  │                               │
  │◄── { token, user } ───────────┤ Returns signed JWT
  │                               │
  ├─── GET /api/courses           │
  │    Authorization: Bearer <token>
  │                               │
  │◄── Course data ───────────────┤ auth middleware verifies JWT
```

Store the token in `localStorage` and attach it to every private request via `axios.defaults.headers.common['Authorization']`.
