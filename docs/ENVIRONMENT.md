# Environment Variables

This document describes every environment variable used by the backend. Create a file called `.env` inside the `backend/` directory before starting the server.

---

## Quick Copy — Development

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/edumanage_db
JWT_SECRET=change_this_to_a_long_random_string_at_least_64_chars
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@edumanage.com
ADMIN_PASSWORD=SecureAdminPassword123!
ADMIN_FIRST_NAME=System
ADMIN_LAST_NAME=Administrator
EMAIL_FROM=noreply@edumanage.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
CLIENT_URL=http://localhost:3000
```

---

## Variable Reference

### Server

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | `development` | Runtime environment. Set to `production` on deployment hosts. |
| `PORT` | No | `5000` | Port the Express server listens on. |

### Database

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | **Yes** | — | Full MongoDB connection string. Use `mongodb://127.0.0.1:27017/edumanage_db` for a local instance or a MongoDB Atlas SRV string for cloud. |

**Atlas URI format:**
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

### Authentication

| Variable | Required | Default | Description |
|---|---|---|---|
| `JWT_SECRET` | **Yes** | — | Secret key used to sign JWT tokens. Must be long (≥ 64 characters) and random. Never commit this value. |
| `JWT_EXPIRES_IN` | No | `7d` | JWT expiry duration. Accepts any value supported by the [ms](https://github.com/vercel/ms) library (e.g. `1d`, `12h`, `7d`). |

**Generate a secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Admin Seeding

These variables are only used by `npm run create-admin` (the seed script). They are not used at runtime.

| Variable | Required for seeding | Description |
|---|---|---|
| `ADMIN_EMAIL` | Yes | Email address for the initial admin account. |
| `ADMIN_PASSWORD` | Yes | Password for the initial admin account. Min 8 characters. |
| `ADMIN_FIRST_NAME` | No | Admin's first name (defaults to `System`). |
| `ADMIN_LAST_NAME` | No | Admin's last name (defaults to `Administrator`). |

### Email (Nodemailer)

Email sending is used for notifications and password resets. If not configured, those features will silently skip sending.

| Variable | Required | Description |
|---|---|---|
| `EMAIL_FROM` | No | The `From:` address on outgoing emails. |
| `EMAIL_HOST` | No | SMTP host. Gmail: `smtp.gmail.com` |
| `EMAIL_PORT` | No | SMTP port. Gmail TLS: `587`, Gmail SSL: `465` |
| `EMAIL_USER` | No | SMTP login username (your email address). |
| `EMAIL_PASS` | No | SMTP login password. For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your account password. |

### File Uploads

| Variable | Required | Default | Description |
|---|---|---|---|
| `MAX_FILE_SIZE` | No | `10485760` | Maximum file upload size in bytes. Default is 10 MB. |
| `UPLOAD_PATH` | No | `./uploads` | Directory for file storage in development. **Note:** On Vercel, files are written to `/tmp` automatically regardless of this value. |

### CORS

| Variable | Required | Default | Description |
|---|---|---|---|
| `CLIENT_URL` | No | `http://localhost:3000` | The frontend origin that is allowed by the CORS policy. In production, set this to your deployed frontend URL. Any `*.vercel.app` subdomain is also automatically allowed. |

---

## Production Checklist

Before going live, verify the following:

- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI` points to a production database with authentication enabled
- [ ] `JWT_SECRET` is a unique, cryptographically random string (not shared with dev)
- [ ] `CLIENT_URL` is your production frontend domain
- [ ] Email credentials are set if you want notifications to send
- [ ] Secrets are stored in your platform's secrets manager (Vercel Environment Variables, AWS Secrets Manager, etc.) — **never in a committed file**

---

## Frontend Environment

The React frontend uses a single environment variable for production builds:

| Variable | File | Description |
|---|---|---|
| `REACT_APP_API_URL` | `frontend/.env.production` | Base URL of the deployed backend API. |

```env
# frontend/.env.production
REACT_APP_API_URL=https://your-backend.vercel.app
```

For local development, the frontend defaults to `http://localhost:5000` (set in `AuthContext.js`).
