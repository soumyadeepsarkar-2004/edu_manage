<div align="center">

<h1>📚 EduManage</h1>
<p><strong>A complete, production-ready Course Management System built with the MERN stack.</strong></p>

<p>
  <a href="https://github.com/tumansutradhar/edu-manage"><img alt="GitHub Repo" src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github"/></a>
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge"/>
  <img alt="Node" src="https://img.shields.io/badge/Node.js-%3E%3D20-brightgreen?style=for-the-badge&logo=node.js"/>
  <img alt="React" src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react"/>
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Atlas-success?style=for-the-badge&logo=mongodb"/>
</p>

<br/>

![EduManage App Preview](./docs/images/preview.png)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)
- [Contact](#contact)

---

## Overview

EduManage is a full-featured educational platform that streamlines course creation, student enrollment, assignment management, attendance tracking, and grading. It uses **role-based access control** across three user types:

| Role | Capabilities |
|---|---|
| **Student** | Register, browse & enroll in courses, submit assignments, track grades & attendance, message instructors |
| **Instructor** | Verify account via documents, create & manage courses, upload materials, grade submissions, track attendance |
| **Admin** | Approve instructors & courses, manage all users, view platform-wide analytics |

**Live production app:** https://frontend-two-coral-74.vercel.app  
**API base URL:** https://backend-mu-beige-26.vercel.app

---

## Features

- **Authentication** — JWT-based auth with refresh, bcrypt password hashing, role-based middleware
- **Instructor Verification** — Document upload workflow, admin approval before course creation is unlocked
- **Course Management** — Create, approve, enroll with capacity controls, track per-course analytics
- **Assignments** — File + text submissions, instructor grading with comments and scores
- **Attendance** — Per-session tracking, status options (present/absent/late), exportable reports
- **Grades** — Weighted gradebook per course, GPA tracking for students
- **Messaging** — Internal inbox between students and instructors
- **Notifications** — Event-driven in-app notifications
- **File Uploads** — Multer-based, validated by type/size, serverless-safe (`/tmp` on Vercel)
- **Dashboards** — Role-specific dashboards with charts (Chart.js)
- **Analytics** — Admin-level platform statistics via dedicated analytics route

---

## Tech Stack

### Backend
| Package | Purpose |
|---|---|
| Node.js + Express.js | HTTP server and routing |
| MongoDB + Mongoose | Database and ODM |
| JSON Web Token | Stateless authentication |
| bcryptjs | Password hashing |
| Multer | File upload handling |
| express-validator | Input validation |
| nodemailer | Email notifications |
| socket.io | Real-time events |
| dotenv | Environment variable management |

### Frontend
| Package | Purpose |
|---|---|
| React 18 | UI library |
| React Router v6 | Client-side routing |
| Tailwind CSS | Utility-first styling |
| Headless UI | Accessible UI primitives |
| Axios | HTTP client |
| Chart.js + react-chartjs-2 | Data visualisation |
| Framer Motion | Animations |
| react-hot-toast | Toast notifications |
| Heroicons | Icon set |

---

## Project Structure

```
edu-manage/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
│
├── backend/
│   ├── middleware/
│   │   ├── auth.js          # JWT verification + role authorization
│   │   └── upload.js        # Multer config for document uploads
│   ├── models/
│   │   ├── Assignment.js
│   │   ├── Attendance.js
│   │   ├── Course.js
│   │   ├── Enrollment.js
│   │   ├── Grade.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   ├── Submission.js
│   │   └── User.js
│   ├── routes/
│   │   ├── analytics.js
│   │   ├── assignments.js
│   │   ├── attendance.js
│   │   ├── auth.js          # Register, login, profile
│   │   ├── courses.js
│   │   ├── enrollments.js
│   │   ├── grades.js
│   │   ├── messages.js
│   │   ├── notifications.js
│   │   ├── submissions.js
│   │   ├── upload.js        # Course material uploads
│   │   └── users.js
│   ├── scripts/
│   │   └── seedData.js      # Admin user creation
│   ├── .env                 # ← create from docs/ENVIRONMENT.md
│   ├── package.json
│   ├── server.js            # App entry point (exports app for serverless)
│   └── vercel.json
│
├── docs/
│   ├── images/
│   │   └── preview.png      # App screenshot
│   ├── API.md               # Full REST API reference
│   ├── ARCHITECTURE.md      # System design overview
│   ├── CONTRIBUTING.md      # How to contribute
│   ├── DEPLOYMENT.md        # Vercel + self-host deployment guide
│   ├── DEVELOPMENT.md       # Local dev setup
│   └── ENVIRONMENT.md       # All environment variables explained
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Admin/       # UserManagement
│   │   │   ├── Assignments/ # List, Detail, Create, Submissions
│   │   │   ├── Attendance/  # AttendanceView
│   │   │   ├── Auth/        # Login, Register
│   │   │   ├── Common/      # Shared UI components
│   │   │   ├── Courses/     # List, Detail, Create, Materials, Performance
│   │   │   ├── Dashboard/   # Student, Instructor, Admin dashboards
│   │   │   ├── Enrollments/ # MyEnrollments
│   │   │   ├── Grades/      # GradeView
│   │   │   ├── Home/        # Landing page
│   │   │   ├── Layout/      # Layout, PublicLayout
│   │   │   ├── Messages/    # Messages
│   │   │   └── Profile/     # Profile
│   │   ├── context/
│   │   │   └── AuthContext.js  # Global auth state + axios defaults
│   │   ├── utils/
│   │   │   └── dateUtils.js
│   │   ├── App.js           # Route definitions
│   │   └── index.js
│   ├── .env.production      # REACT_APP_API_URL for prod builds
│   ├── package.json
│   ├── tailwind.config.js
│   └── vercel.json          # SPA fallback rewrites
│
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── LICENSE.md
├── README.md                ← you are here
├── SECURITY.md
└── package.json             # Root: concurrently dev script
```

---

## Quick Start

### Prerequisites
- **Node.js** ≥ 20
- **npm** ≥ 9
- **MongoDB** — local instance or [MongoDB Atlas](https://cloud.mongodb.com) (free tier works)

### 1. Clone

```bash
git clone https://github.com/tumansutradhar/edu-manage.git
cd edu-manage
```

### 2. Install all dependencies

```bash
npm run install-all
```

### 3. Configure environment

Copy the template and fill in your values:

```bash
cp docs/ENVIRONMENT.md backend/.env   # reference guide — see below
```

Minimum required in `backend/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/edumanage_db
JWT_SECRET=your_long_random_secret_here
PORT=5000
CLIENT_URL=http://localhost:3000
```

See [docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md) for the full list.

### 4. Start development servers

```bash
npm run dev
```

This starts both the Express API on **http://localhost:5000** and the React app on **http://localhost:3000** concurrently.

### 5. Seed the admin user *(optional)*

```bash
cd backend && npm run create-admin
```

Default credentials are set via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in your `.env`.

---

## Environment Variables

See **[docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md)** for a full breakdown of every variable, which are required, and safe values for development.

---

## API Reference

See **[docs/API.md](./docs/API.md)** for the full REST API documentation including all endpoints, request/response shapes, and authentication requirements.

**Base URL (production):** `https://backend-mu-beige-26.vercel.app`  
**Health check:** `GET /api/health`

---

## Deployment

See **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** for:
- One-click Vercel deployment for both frontend and backend
- Self-hosted deployment (PM2 + Nginx)
- Docker Compose setup

---

## Contributing

We welcome all contributions — bug fixes, new features, documentation improvements, or translations.

Please read **[docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)** before opening a PR.

Quick steps:

```bash
# Fork, then clone your fork
git clone https://github.com/YOUR_USERNAME/edu-manage.git

# Create a feature branch
git checkout -b feature/my-feature

# Make changes, commit using conventional commits
git commit -m "feat: add my feature"

# Push and open a pull request
git push origin feature/my-feature
```

---

## Roadmap

- [x] Role-based authentication (Student / Instructor / Admin)
- [x] Course creation, approval and enrollment
- [x] Assignment submission and grading
- [x] Attendance tracking
- [x] Internal messaging
- [x] Vercel production deployment
- [x] Automated email notifications (nodemailer — welcome, enrollment, grades, instructor approval)
- [x] Unit + integration test suite (Jest / Supertest + mongodb-memory-server)
- [x] Cloudflare R2 for persistent file storage — free forever, S3-compatible (10 GB / zero egress)
- [x] Two-factor authentication (TOTP via speakeasy — setup, enable, verify, disable)
- [x] Mobile-responsive improvements (responsive header, sidebar, LanguageSwitcher)
- [x] Internationalisation (i18n) — English, Spanish, French via i18next + react-i18next
- [x] CI/CD pipeline (GitHub Actions — CI on push/PR, auto-deploy to Vercel on main)

---

## License

Distributed under the **MIT License**. See [LICENSE.md](./LICENSE.md) for full text.

---

## Contact

**Tuman Sutradhar**

- GitHub: [@tumansutradhar](https://github.com/tumansutradhar)
- Email: connect.tuman@gmail.com
- LinkedIn: [Tuman Sutradhar](https://www.linkedin.com/in/tumansutradhar/)

Project: [https://github.com/tumansutradhar/edu-manage](https://github.com/tumansutradhar/edu-manage)
