# Changelog

All notable changes to EduManage are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Automated email notifications (nodemailer fully wired)
- Unit + integration test suite (Jest / Supertest / React Testing Library)
- AWS S3 / Cloudinary persistent file storage
- Two-factor authentication
- CI/CD pipeline with GitHub Actions
- Internationalisation (i18n)

---

## [1.1.0] — 2026-03-02

### Added
- Production deployment to Vercel (backend + frontend)
- Serverless-compatible `server.js`: lazy MongoDB connection, `module.exports = app`
- `backend/vercel.json` — Node.js serverless function configuration
- `frontend/vercel.json` — SPA fallback rewrites for React Router
- Dynamic CORS origin allowing any `*.vercel.app` subdomain
- `/tmp`-based file storage for uploads in serverless environment
- `frontend/.env.production` with `REACT_APP_API_URL`
- Full open-source documentation (`docs/` folder)
  - `API.md` — complete REST API reference
  - `ARCHITECTURE.md` — system design and design decisions
  - `CONTRIBUTING.md` — contributor guide
  - `DEPLOYMENT.md` — Vercel + self-host + Docker guide
  - `DEVELOPMENT.md` — local dev setup guide
  - `ENVIRONMENT.md` — all environment variables documented
- `.github/` issue and PR templates
- `SECURITY.md` — vulnerability disclosure policy
- `CODE_OF_CONDUCT.md` — Contributor Covenant v2.1
- `CHANGELOG.md` (this file)

### Changed
- `frontend/package.json` build script uses `CI=false` to prevent ESLint warnings from failing the production build
- `middleware/upload.js` — uses `UPLOAD_BASE` resolved to `/tmp` in production
- `routes/upload.js` — same `/tmp` fix applied
- README.md completely rewritten with structured sections, badges, full project structure, and app screenshot

### Fixed
- `FUNCTION_INVOCATION_FAILED` on Vercel caused by `app.listen()` being called in serverless context
- Directory creation crash on Vercel caused by writing to read-only filesystem outside `/tmp`
- `MONGODB_URI undefined` error caused by missing `.env` file

---

## [1.0.0] — 2026-03-01

### Added
- **Authentication** — JWT-based register / login / profile with role-based middleware
- **Roles** — Student, Instructor, Admin with full RBAC on all routes
- **Instructor Verification** — Document upload workflow, admin approval required before course creation
- **Courses** — Create, approve, enroll with capacity enforcement; course materials (videos, PDFs, documents)
- **Assignments** — Create assignments, file + text submissions, grading with score and feedback
- **Attendance** — Per-session tracking (present / absent / late), instructor-managed
- **Grades** — Per-course gradebook, GPA view for students
- **Messaging** — Internal inbox between students and instructors
- **Notifications** — Event-driven in-app notification system
- **Dashboards** — Role-specific dashboards with Chart.js visualisations
- **Analytics** — Admin platform overview (user count, course stats, enrollment metrics)
- **File Uploads** — Multer-based, validated by MIME type and file extension, 100 MB limit for course materials
- **MongoDB Models** — User, Course, Enrollment, Assignment, Submission, Attendance, Grade, Message, Notification
- **Frontend** — React 18 SPA with Tailwind CSS, Headless UI, Framer Motion, React Router v6
- **Backend** — Express.js API with express-validator, bcryptjs, jsonwebtoken, socket.io
- **Root dev script** — `concurrently` to run frontend + backend in one command

[Unreleased]: https://github.com/tumansutradhar/edu-manage/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/tumansutradhar/edu-manage/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/tumansutradhar/edu-manage/releases/tag/v1.0.0
