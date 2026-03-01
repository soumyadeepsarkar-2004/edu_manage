# Changelog

All notable changes to EduManage are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [1.2.0] — 2026-03-02

### Added
- **Two-factor authentication (2FA)** — TOTP-based via `speakeasy` + `qrcode`
  - `POST /api/auth/2fa/setup` — generate QR code and secret
  - `POST /api/auth/2fa/enable` — verify TOTP and activate 2FA
  - `POST /api/auth/2fa/verify` — complete login when 2FA is enabled (returns temp token flow)
  - `DELETE /api/auth/2fa/disable` — disable 2FA (requires current TOTP)
  - `GET /api/auth/2fa/status` — query 2FA state for current user
  - Frontend: `TwoFactorSetup.js`, `TwoFactorVerify.js`, `/settings/2fa` and `/2fa/verify` routes
  - Login flow updated — returns `{ requiresTwoFactor: true, tempToken }` when 2FA is active
- **Automated email notifications** — `backend/services/emailService.js`
  - `sendWelcomeEmail` on registration (student + instructor)
  - `sendEnrollmentConfirmation` on course enrollment
  - `sendGradeNotification` on grade creation / update
  - `sendPasswordResetEmail` helper ready for password reset flow
  - `sendInstructorApprovedEmail` when admin approves an instructor
- **Cloudflare R2 persistent file storage** — `backend/services/cloudinaryService.js`
  - Free forever: 10 GB storage, 1M writes/month, 10M reads/month, zero egress fees
  - S3-compatible via `@aws-sdk/client-s3` + `@aws-sdk/lib-storage` + `multer-s3`
  - Zero-config fallback: uses local `/tmp` (Vercel) or `uploads/` when R2 env vars are absent
  - `getR2Storage()` — drop-in Multer storage engine for R2
  - `uploadBuffer()` + `deleteFile()` + `getPublicUrl()` utilities for programmatic use
- **Internationalisation (i18n)** — English, Spanish (Español), French (Français)
  - `frontend/src/i18n.js` — i18next + react-i18next + browser language detector
  - `frontend/src/locales/{en,es,fr}/translation.json` — full UI string coverage
  - `LanguageSwitcher` component in the app header
- **GitHub Actions CI/CD**
  - `.github/workflows/ci.yml` — runs backend tests + frontend build on every push/PR
  - `.github/workflows/deploy.yml` — auto-deploys backend then frontend to Vercel on `main` push
- **Unit + integration test suite** — Jest + Supertest + mongodb-memory-server (in-memory DB)
  - `backend/tests/auth.test.js` — register, login, /me endpoint tests
  - `backend/tests/courses.test.js` — RBAC course access tests
  - `backend/tests/setup.js` — global test setup with in-memory MongoDB lifecycle hooks
  - `backend/jest.config.js` — Jest config with coverage reporting
  - `npm test` and `npm run test:coverage` scripts added to `backend/package.json`
- **User model 2FA fields** — `twoFactorEnabled`, `twoFactorSecret` (excluded from default selects)
- **`/settings/2fa` frontend route** — accessible from user menu under "Security (2FA)"
- **Mobile-responsive header** — compressed icon/label spacing on small screens, language switcher responsive

### Changed
- Login route returns HTTP 401 (was 400) for invalid credentials — better security semantics
- Header user menu now includes "Security (2FA)" link before Sign out
- README Live Demo badge updated to link to GitHub repository
- All roadmap items marked complete in README

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

[Unreleased]: https://github.com/tumansutradhar/edu-manage/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/tumansutradhar/edu-manage/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/tumansutradhar/edu-manage/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/tumansutradhar/edu-manage/releases/tag/v1.0.0
