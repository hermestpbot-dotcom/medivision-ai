# MediVision AI — Deployment Guide

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel        │     │   Oracle Cloud  │     │   MongoDB       │
│   (Frontend)    │────▶│   VPS (Backend) │────▶│   Atlas (DB)    │
│   Next.js 14    │     │   FastAPI       │     │   Free Tier     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                        ┌─────┴─────┐
                        │   Redis   │
                        │  (Cache)  │
                        └───────────┘
```

## Prerequisites

- [Node.js 22+](https://nodejs.org/)
- [Python 3.11+](https://python.org)
- [Docker](https://docker.com) (optional)
- [Oracle Cloud](https://cloud.oracle.com) account (free tier)
- [MongoDB Atlas](https://cloud.mongodb.com) account (free tier)
- [Vercel](https://vercel.com) account (free tier)

---

## Step 1: MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Create a database user (save username + password)
4. Add your IP to Network Access (or `0.0.0.0/0` for all)
5. Get the connection string:
   ```
   mongodb+srv://<user>:<password>@cluster.xxxxx.mongodb.net/medivision?retryWrites=true&w=majority
   ```

---

## Step 2: Backend Deployment (Oracle Cloud Free VPS)

### Option A: Automated (Recommended)

1. Sign up at [cloud.oracle.com](https://cloud.oracle.com)
2. Create an **Always Free** ARM VM (4 cores, 24GB RAM)
3. SSH into the VM:
   ```bash
   ssh ubuntu@<your-vm-ip>
   ```
4. Run the deploy script:
   ```bash
   git clone https://github.com/hermestpbot-dotcom/medivision-ai.git
   cd medivision-ai/backend
   cp .env.example .env
   nano .env  # Add your MongoDB URL and JWT secrets
   bash deploy-vps.sh
   ```

### Option B: Docker (Any VPS)

```bash
cd medivision-ai/backend
cp .env.example .env
# Edit .env with your values
docker compose up -d
```

### Option C: Render (Manual)

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo: `hermestpbot-dotcom/medivision-ai`
4. Set root directory: `backend`
5. Build command: `pip install -r requirements.txt`
6. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Add environment variables (see `.env.example`)

### Required Environment Variables

```env
MONGODB_URL=mongodb+srv://user:***@cluster.mongodb.net/medivision
JWT_SECRET=<generate-with-python-secrets-token-urlsafe-64>
JWT_REFRESH_SECRET=<generate-another-one>
CORS_ORIGINS=["https://your-frontend.vercel.app"]
DEBUG=false
```

Generate secrets:
```python
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

---

## Step 3: Frontend Deployment (Vercel)

### Automatic (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repo: `hermestpbot-dotcom/medivision-ai`
3. Set root directory: `frontend`
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```
5. Deploy

### Manual

```bash
cd medivision-ai/frontend
npm install -g vercel
vercel --prod
```

---

## Step 4: Connect Frontend to Backend

1. In Vercel dashboard → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com`
3. Redeploy

---

## Step 5: Verify

```bash
# Health check
curl https://your-backend-url.com/api/v1/health

# API docs
open https://your-backend-url.com/api/v1/docs

# Frontend
open https://your-frontend.vercel.app
```

---

## SSL/HTTPS (Production)

### With Nginx + Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### With Cloudflare Tunnel

```bash
# Install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# Authenticate and create tunnel
cloudflared tunnel login
cloudflared tunnel create medivision
cloudflared tunnel route dns medivision api.yourdomain.com
```

---

## Monitoring

```bash
# View logs
docker compose logs -f backend

# Health check
curl http://localhost:8000/api/v1/health

# Check Redis
docker compose exec redis redis-cli ping
```

---

## Updating

```bash
cd medivision-ai
git pull origin main
docker compose up -d --build
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Check `CORS_ORIGINS` in backend `.env` |
| MongoDB connection fail | Whitelist IP in Atlas Network Access |
| WebSocket not working | Ensure port 8000 is open, check token |
| Build fails on Vercel | Check `NEXT_PUBLIC_API_URL` is set |
| Rate limit (429) | Wait 60s or increase limit in `main.py` |
