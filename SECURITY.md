# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 1.x (latest) | ✅ Yes |
| < 1.0 | ❌ No |

We only provide security fixes for the latest release. Please make sure you are running an up-to-date version before reporting.

---

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub Issues.**

If you discover a security vulnerability in EduManage, please disclose it responsibly:

1. **Email:** Send details to `connect.tuman@gmail.com` with the subject line `[SECURITY] EduManage Vulnerability`.
2. **Include:**
   - A description of the vulnerability and its potential impact
   - Steps to reproduce the issue
   - Any proof-of-concept code or screenshots
   - Your name/handle (for acknowledgement, if desired)
3. **Response time:** We will acknowledge receipt within **48 hours** and aim to provide a patch within **7 days** for critical issues.

Please give us a reasonable amount of time to address the issue before making any public disclosure.

---

## Scope

The following are in scope for security reports:

- Authentication bypass or privilege escalation
- Injection attacks (NoSQL injection, XSS, etc.)
- Sensitive data exposure (JWT secrets, user credentials, PII)
- Broken access control (accessing another user's data)
- Insecure file upload handling
- Denial-of-service via the API

The following are typically **out of scope:**

- Theoretical vulnerabilities without a proof of concept
- Issues in third-party dependencies (please report those to the respective maintainers)
- Social engineering attacks
- Physical security

---

## Security Practices in This Codebase

This is documented for transparency:

- **Passwords** are hashed with bcryptjs (10 salt rounds) before storage. Plain-text passwords are never stored or logged.
- **JWT tokens** are signed with a configurable secret (`JWT_SECRET`). Tokens expire after `JWT_EXPIRES_IN` (default 7 days).
- **Input validation** is applied on all POST/PUT endpoints using express-validator.
- **File uploads** are filtered by MIME type and file extension. File size is capped by Multer.
- **CORS** is restricted to known frontend origins. Wildcard CORS (`*`) is not used.
- **Environment variables** are never committed. The `.env` file is listed in `.gitignore`.
- **MongoDB connection strings** contain credentials and are stored only as encrypted environment variables on Vercel.

---

## Acknowledgements

We appreciate the security research community and thank everyone who helps keep EduManage safe.
