# Deployment Guide

This guide covers three deployment options:
1. **Vercel** (recommended, zero-config, what production currently uses)
2. **Self-hosted** with PM2 + Nginx
3. **Docker Compose** (coming soon)

---

## Option 1: Vercel (Recommended)

The project ships with `vercel.json` files for both backend and frontend.

### Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier is sufficient)
- [Vercel CLI](https://vercel.com/docs/cli): `npm install -g vercel`
- A MongoDB Atlas connection string

---

### Step 1 — Deploy the Backend

```bash
cd backend
vercel --prod
```

Vercel auto-detects `vercel.json` and deploys `server.js` as a serverless Node.js function.

After the first deploy, set your environment variables:

```bash
# From the backend/ directory
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add NODE_ENV production        # value: production
vercel env add CLIENT_URL production      # value: your frontend Vercel URL
vercel env add JWT_EXPIRES_IN production  # value: 7d
vercel env add ADMIN_EMAIL production
vercel env add ADMIN_PASSWORD production
vercel env add ADMIN_FIRST_NAME production
vercel env add ADMIN_LAST_NAME production
vercel env add EMAIL_HOST production
vercel env add EMAIL_PORT production
vercel env add EMAIL_USER production
vercel env add EMAIL_PASS production
vercel env add EMAIL_FROM production
vercel env add MAX_FILE_SIZE production   # value: 10485760
```

Then redeploy to apply the env vars:

```bash
vercel --prod
```

✅ Verify: `curl https://your-backend.vercel.app/api/health`

---

### Step 2 — Deploy the Frontend

Update `frontend/.env.production` with your backend URL:

```env
REACT_APP_API_URL=https://your-backend.vercel.app
```

Then deploy:

```bash
cd ../frontend
vercel --prod
```

Vercel will run `npm run build` and serve the static output. The `vercel.json` included in the frontend configures SPA routing fallbacks so React Router works correctly.

✅ Visit your frontend URL — the app should be fully functional.

---

### Connecting a Custom Domain

1. Go to your Vercel dashboard → Project → **Domains**
2. Add your custom domain (e.g. `edumanage.example.com`)
3. Update `CLIENT_URL` on the backend project to match the new frontend domain
4. Redeploy the backend: `vercel --prod`

---

### Automatic Deployments (Git Integration)

For continuous deployment on every push to `main`:

1. Push your code to GitHub
2. In the Vercel dashboard, click **"Add New Project"** and import your GitHub repo
3. Configure two separate Vercel projects — one with root dir `backend/`, one with root dir `frontend/`
4. Every push to `main` will trigger a new production deployment automatically

---

## Option 2: Self-Hosted (PM2 + Nginx)

Use this for VPS deployments (e.g. DigitalOcean Droplet, AWS EC2, Hetzner).

### Prerequisites

- A Linux server with Node.js ≥ 20 and npm
- Nginx installed
- PM2: `npm install -g pm2`
- MongoDB running locally or accessible remotely
- (Optional) A domain + SSL via Let's Encrypt

---

### Backend

```bash
# On the server
git clone https://github.com/tumansutradhar/edu-manage.git
cd edu-manage/backend

npm install --production
cp .env.example .env
nano .env   # fill in all variables, set NODE_ENV=production

# Start with PM2
pm2 start server.js --name edu-manage-api
pm2 save
pm2 startup   # follow the printed command to enable auto-restart
```

**Nginx config** — `/etc/nginx/sites-available/edumanage-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/edumanage-api /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Add SSL
certbot --nginx -d api.yourdomain.com
```

---

### Frontend

```bash
cd edu-manage/frontend

# Set your backend URL
echo "REACT_APP_API_URL=https://api.yourdomain.com" > .env.production

npm install
npm run build   # outputs to build/
```

Copy the `build/` folder to your web root:

```bash
cp -r build/* /var/www/edumanage/
```

**Nginx config** — `/etc/nginx/sites-available/edumanage`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/edumanage;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;   # SPA fallback
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
ln -s /etc/nginx/sites-available/edumanage /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Persistent File Storage

> The app already includes **Cloudflare R2** support. When the `R2_*` env vars are set, uploads go to R2 automatically. Without them the app falls back to disk (`uploads/` in dev, `/tmp` on Vercel — ephemeral).

### Cloudflare R2 Setup (Free — Recommended)

R2 is free forever: 10 GB storage, 1M writes/month, 10M reads/month, zero egress fees.

**Step 1 — Create a bucket**
1. [dash.cloudflare.com](https://dash.cloudflare.com) → **R2** → **Create bucket**
2. Bucket → **Settings → Public access** → Enable (for public file URLs)

**Step 2 — Create an API token**
1. **R2 → Manage R2 API Tokens → Create token**
2. Permissions: *Object Read & Write*
3. Copy **Account ID**, **Access Key ID**, **Secret Access Key**

**Step 3 — Set env vars on Vercel**

```
R2_ACCOUNT_ID        <your Cloudflare account ID>
R2_ACCESS_KEY_ID     <R2 token Access Key ID>
R2_SECRET_ACCESS_KEY <R2 token Secret Access Key>
R2_BUCKET_NAME       <bucket name>
R2_PUBLIC_URL        https://pub-xxx.r2.dev   (optional — enables public links)
```

That's it. Redeploy and uploads will land in R2.

---

## Environment Variable Summary for Production

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas SRV string |
| `JWT_SECRET` | 64+ char random string |
| `CLIENT_URL` | Your frontend domain (e.g. `https://app.yourdomain.com`) |

See [docs/ENVIRONMENT.md](./ENVIRONMENT.md) for the full list.
