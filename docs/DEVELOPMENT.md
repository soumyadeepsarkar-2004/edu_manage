# Local Development Guide

This guide walks you through setting up EduManage on your local machine for development.

---

## Prerequisites

| Tool | Minimum Version | Check |
|---|---|---|
| Node.js | 20 | `node -v` |
| npm | 9 | `npm -v` |
| Git | — | `git --version` |
| MongoDB | 6 (or Atlas) | `mongod --version` |

**MongoDB options:**
- **Local:** [Download Community Edition](https://www.mongodb.com/try/download/community)
- **Cloud (free):** [MongoDB Atlas](https://cloud.mongodb.com) — create a free M0 cluster in under 2 minutes
- **Docker:** `docker run -d -p 27017:27017 mongo:6`

---

## Setup

### 1. Fork & Clone

```bash
# Fork on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/edu-manage.git
cd edu-manage
```

### 2. Install Dependencies

```bash
npm run install-all
```

This runs `npm install` in both `backend/` and `frontend/` via the root `package.json`.

### 3. Configure Backend Environment

```bash
cd backend
cp .env.example .env   # if .env.example exists, otherwise create .env manually
```

Edit `backend/.env` with your values. Minimum required:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/edumanage_db
JWT_SECRET=dev_secret_replace_in_production_at_least_64_chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

See [docs/ENVIRONMENT.md](./ENVIRONMENT.md) for all variables.

### 4. (Optional) Seed Admin User

```bash
cd backend
npm run create-admin
```

This creates the initial admin account using `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env`.

### 5. Start Development Servers

From the **root** directory:

```bash
npm run dev
```

This uses `concurrently` to start:
- **Backend:** Express on `http://localhost:5000` (nodemon auto-restarts on file changes)
- **Frontend:** React on `http://localhost:3000` (hot-reloads on file changes)

Or start them separately in two terminals:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

---

## Available Scripts

### Root (`package.json`)

| Command | Description |
|---|---|
| `npm run dev` | Start both servers concurrently |
| `npm run server` | Start backend only |
| `npm run client` | Start frontend only |
| `npm run install-all` | Install dependencies for both backend and frontend |

### Backend (`backend/package.json`)

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-restart) |
| `npm start` | Start without nodemon (production mode) |
| `npm run create-admin` | Seed initial admin user |

### Frontend (`frontend/package.json`)

| Command | Description |
|---|---|
| `npm start` | Start dev server with hot reload |
| `npm run build` | Build optimised production bundle to `build/` |
| `npm test` | Run test suite |

---

## Project Conventions

### Adding a New Backend Route

1. Create a new file in `backend/routes/` (e.g. `notifications.js`)
2. Define your router using `express.Router()`
3. Register it in `server.js`: `app.use('/api/notifications', require('./routes/notifications'))`
4. Document the endpoints in [docs/API.md](./API.md)

### Adding a New Frontend Page

1. Create the component in the appropriate `src/components/` subfolder
2. Add the `<Route>` in `src/App.js`
3. If the page requires authentication, wrap it in the existing protected route pattern
4. Style exclusively with Tailwind CSS utility classes

### Environment Variables in Frontend

Prefix all custom variables with `REACT_APP_`:

```env
REACT_APP_MY_VAR=value
```

Access in code via `process.env.REACT_APP_MY_VAR`.

---

## Common Issues

### `ECONNREFUSED 127.0.0.1:27017`
MongoDB is not running. Start it:
- **macOS:** `brew services start mongodb-community`
- **Linux:** `sudo systemctl start mongod`
- **Windows:** `net start MongoDB`
- **Atlas:** Check your IP is whitelisted in Network Access

### `JWT_SECRET is undefined`
The `backend/.env` file is missing or not being loaded. Ensure it is in the `backend/` folder (not the project root) and contains a `JWT_SECRET` value.

### Port 3000 or 5000 already in use

```bash
# macOS / Linux — find and kill the process
lsof -ti :3000 | xargs kill
lsof -ti :5000 | xargs kill

# Windows
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

### Frontend shows a blank page after login
Open browser DevTools → Network tab. If API calls are going to `localhost:5000` but the backend isn't running, start it with `npm run server`.

---

## Useful Development URLs

| URL | Description |
|---|---|
| `http://localhost:3000` | React frontend |
| `http://localhost:5000/api/health` | Backend health check |
| `http://localhost:5000/uploads/` | Uploaded files (development only) |

---

## Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "mongodb.mongodb-vscode",
    "humao.rest-client",
    "christian-kohler.path-intellisense"
  ]
}
```

Save this as `.vscode/extensions.json` to get prompted on first open.
