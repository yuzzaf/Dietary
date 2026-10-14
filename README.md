<div align="center">
  <img src="./client/public/dietary-logo.png" alt="Dietary Logo" width="120" />
  <h1>Dietary 🌱</h1>
  <p><strong>Your Ultimate AI-Powered Nutrition & Calorie Tracking Companion</strong></p>

[![Dietary App CI](https://github.com/yuzzaf/ip-yuzzaf/actions/workflows/ci.yml/badge.svg)](https://github.com/yuzzaf/ip-yuzzaf/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

---

**Dietary** is an intelligent, modern Web Application engineered to revolutionize how you track your dietary habits. By fusing a beautifully crafted interface with state-of-the-art **Google Gemini AI**, users can maintain their diet, log calories effortlessly, and receive personalized nutrition coaching in real-time.

## 📋 Table of Contents

- [✨ Key Features](#-key-features)
- [🚀 Tech Stack](#-tech-stack)
- [🏗️ Project Structure](#-project-structure)
- [⚙️ Installation & Setup](#-installation--setup)
- [🐳 Docker Deployment](#-docker-deployment)
- [🔐 Environment Variables](#-environment-variables)
- [📖 Usage Documentation](#-usage-documentation)
- [📡 API Documentation](#-api-documentation)

---

## ✨ Key Features

- 📸 **Intelligent Food Recognition:** Don't know how many calories are in your meal? Simply snap a photo. Our integrated AI Vision (Google Gemini) will analyze the image, detect the food, and estimate its nutritional breakdown instantly.
- 🤖 **AI Nutritionist Chatbot:** Chat with a responsive, context-aware AI Coach 24/7. Built using **Socket.io** for real-time text streaming, providing a stunning native typewriter effect.
- 📊 **Smart Analytics & PDF Export:** Get automated daily feedback indicating whether you are on track, in a deficit, or surplus. Export a comprehensive **7-day Weekly Dietary Report PDF** with a single click.
- 📱 **Progressive Web App (PWA):** Fully installable on your Android and iOS homescreens without passing through the App Store. Experience native-like fullscreen immersion.
- 🍔 **Extensive Food Database:** Reliable search mechanism backed by the **FatSecret API**, granting access to thousands of generic and branded nutritional food items.
- 🔒 **OAuth Integrations:** Secure, frictionless one-click registration and login using **Google OAuth** and **GitHub OAuth**.

---

## 🚀 Tech Stack

### Frontend (Client)

- **Framework**: React (Vite)
- **Styling**: TailwindCSS v4
- **State Management**: Redux Toolkit & React Query (TanStack Query)
- **Routing**: React Router
- **Realtime**: Socket.io-client
- **PWA**: vite-plugin-pwa
- **Alerts**: SweetAlert2 & React-Hot-Toast

### Backend (Server)

- **Runtime Engine**: Node.js & Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JSON Web Tokens (JWT), Google Auth Library, Axios (Github OAuth), Bcryptjs
- **AI Integration**: `@google/generative-ai`
- **Realtime**: Socket.io
- **Utilities**: PDFKit (Report Generation), Multer (Image Uploads)

---

## 🏗️ Project Structure

This repository is designed as a Fullstack Monorepo structure containing both the Express.js Backend and React.js Frontend.

```text
📦 ip-yuzzaf
 ┣ 📂 client                 # Frontend React Application
 ┃ ┣ 📂 public               # PWA Icons & Manifest mappings
 ┃ ┣ 📂 src                  # UI Components, Pages, Redux Slices, and Services
 ┃ ┣ 📜 Dockerfile           # Multi-stage build -> nginx static + reverse proxy
 ┃ ┣ 📜 nginx.conf           # SPA fallback, /api and /socket.io proxy rules
 ┃ ┗ 📜 vite.config.js       # Vite + PWA configurations
 ┣ 📂 server                 # Backend Node/Express Application
 ┃ ┣ 📂 bin                  # HTTP & Socket.io Server Entry Point (www)
 ┃ ┣ 📂 controllers          # Application Business Logic (AI, Auth, Logs, etc.)
 ┃ ┣ 📂 middlewares          # Rate Limiters, JWT Verification, Authorization
 ┃ ┣ 📂 models               # Sequelize Database Models
 ┃ ┣ 📂 services             # Third-party Services (Gemini AI, Fatsecret)
 ┃ ┣ 📜 Dockerfile           # Node runtime, runs migrations then ./bin/www
 ┃ ┗ 📂 __tests__            # Comprehensive Jest Test Suites (90+ Tests)
 ┣ 📜 docker-compose.yml     # db + server + client orchestration
 ┣ 📜 .env.docker.example    # Environment template for compose
 ┗ 📂 .github/workflows      # CI/CD GitHub Actions Configuration
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- PostgreSQL running locally or via remote cloud URL.

### 1. Clone the repository

```bash
git clone https://github.com/yuzzaf/ip-yuzzaf.git
cd ip-yuzzaf
```

### 2. Backend Setup

Navigate into the backend and install all required standard packages:

```bash
cd server
npm install
```

Setup your PosgreSQL database and seed the initial dummy data:

```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

Run the backend Express server:

```bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal, navigate to the `client` directory:

```bash
cd client
npm install
```

Run the frontend Vite server:

```bash
npm run dev
```

---

## 🐳 Docker Deployment

The whole stack (PostgreSQL + Express/Socket.io API + React PWA served by nginx) can be run with a single command — nothing but Docker has to be installed, no local Node.js or PostgreSQL.

```text
┌───────────────┐   :80   ┌──────────────────────────┐   :3000   ┌───────────────┐
│   Browser     │ ──────▶ │  client (nginx)          │ ────────▶ │  server       │
│  (PWA / SPA)  │         │  static build + /api,    │           │  Express +    │
└───────────────┘         │  /socket.io reverse proxy│           │  Socket.io    │
                          └──────────────────────────┘           └───────┬───────┘
                                                                   :5432 │
                                                          ┌──────────────▼─────────┐
                                                          │  db (postgres:16-alpine)│
                                                          │  volume: dietary_db_data│
                                                          └────────────────────────┘
```

### Files added

| File | Purpose |
| --- | --- |
| `docker-compose.yml` | Orchestrates `db`, `server`, `client` on a private bridge network |
| `.env.docker.example` | Template for every variable compose needs |
| `server/Dockerfile` | Node 22 alpine, multi-stage, runs as non-root, applies migrations on boot |
| `server/config/config.docker.json` | DB config mounted over the container's copy to drop the hardcoded `ssl.require` (see caveats) |
| `server/.dockerignore` | Keeps `node_modules`, `coverage`, `__tests__`, `.env` out of the image |
| `client/Dockerfile` | Vite build → nginx alpine |
| `client/nginx.conf` | SPA fallback + `proxy_pass` for `/api` and `/socket.io` |
| `client/.dockerignore` | Keeps `node_modules`, `dist`, `.env` out of the build context |

### 1. Configure the environment

```bash
cd ip-yuzzaf
cp .env.docker.example .env
```

Edit `.env`. The three values that actually matter for a first boot:

```env
POSTGRES_PASSWORD=<strong_password>
JWT_SECRET=<strong_random_secret>
CORS_ORIGIN=http://<your-oracle-public-ip>   # or https://yourdomain.com
```

Everything else (Gemini, FatSecret, Cloudinary, OAuth, SMTP) can stay empty — the API boots and the database still migrates; only the features using those keys will fail.

> **Why `VITE_API_URL=/api`?** The browser talks to nginx on the same origin, and nginx proxies to the API container. No hardcoded IP, no CORS preflight, and Socket.io works through the same port. Vite bakes this in at **build time**, so changing it requires `docker compose up -d --build`.

### 2. Build & start

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f server   # watch "sequelize-cli db:migrate" then the boot log
```

| URL | What |
| --- | --- |
| `http://<host>/` | React PWA |
| `http://<host>/api` | REST API root — returns `{"message":"API is ready!"}` |

(No `/api/health` endpoint exists; the container healthchecks use `GET /` on the API and `GET /` on nginx.)

The `server` container runs `sequelize-cli db:migrate` automatically before starting `bin/www` (set `RUN_MIGRATIONS=false` to skip it, e.g. when scaling to several replicas).

### 3. Common operations

```bash
docker compose logs -f server          # tail API logs
docker compose restart server          # restart after a .env change
docker compose up -d --build           # rebuild after code changes
docker compose exec server sh          # shell inside the API container
docker compose exec db psql -U postgres -d Dietary   # psql prompt
docker compose down                    # stop (keeps the db volume)
docker compose down -v                 # stop AND delete all data
```

---

## ☁️ Deploying to Oracle Cloud

Tested shape: a free-tier **VM.Standard.A1.Flex** (Ampere ARM64) or **VM.Standard.E2.1.Micro** (AMD64) running Ubuntu 22.04/24.04. Both architectures work — every image used here is multi-arch and Node/npm installs the right native bindings for ARM.

### 1. Install Docker on the VM

Ubuntu:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER      # log out and back in for this to apply
docker --version && docker compose version
```

Oracle Linux 8/9 (`dnf`, needs the repo first):

```bash
sudo dnf install -y dnf-utils git
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

### 2. Open the port — two firewalls must both allow it

1. **Oracle VCN Security List / Network Security Group**: add an *Ingress* rule, source `0.0.0.0/0`, TCP destination port `80` (and `443` for TLS). This is the step people forget — the VM is unreachable from outside until it's done.
2. **Firewall on the VM**:

```bash
# Ubuntu (Oracle images ship iptables rules that block everything but SSH)
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo netfilter-persistent save

# If ufw is in use instead
sudo ufw allow 80/tcp

# Oracle Linux
sudo firewall-cmd --permanent --add-service=http && sudo firewall-cmd --reload
```

### 3. Ship the code and start it

```bash
git clone https://github.com/yuzzaf/Dietary.git   # or: git fetch && git checkout feat/docker-deployment
cd Dietary
cp .env.docker.example .env
nano .env                      # POSTGRES_PASSWORD, JWT_SECRET, CORS_ORIGIN=http://<public-ip>
docker compose up -d --build
```

The first build takes a few minutes (npm install + Vite build). When `docker compose ps` shows `db (healthy)`, `server (healthy)` and `client (healthy)`, open `http://<public-ip>`.

### 4. Restart on reboot

`restart: unless-stopped` is set on every service, so the stack comes back by itself as long as the Docker daemon is enabled (`sudo systemctl enable docker`). To verify:

```bash
sudo reboot
# after the VM is back:
docker compose ps
```

### 5. Optional: HTTPS with a domain

Point an A record at the VM's public IP, then either terminate TLS in front of this stack:

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

…and reverse-proxy `443` → `http://127.0.0.1:80`, or add Caddy/Traefik as a fourth compose service. Afterwards update `CORS_ORIGIN` to the `https://` URL and re-run `docker compose up -d`.

### Deployment notes & caveats

- **TLS / the one gotcha in this repo.** `server/config/config.json` hardcodes `dialectOptions.ssl.require = true` for the `production` block, and the container runs with `NODE_ENV=production`. A stock `postgres` image serves **no TLS** (its entrypoint never generates certificates), so node-postgres sends an `SSLRequest`, gets a single `N` byte back, and aborts with `The server does not support SSL connections` — the API would never connect. `docker-compose.yml` therefore mounts `server/config/config.docker.json` (identical config, minus the `ssl` block) over `/app/config/config.json` inside the container. **No application code was modified.** If you delete that mount, the API dies at boot with the message above.
- **Switching to a managed database that requires TLS:** append `?sslmode=require` to `DATABASE_URL` in `docker-compose.yml` and *replace* `config.docker.json` with one that has `"dialectOptions": { "ssl": { "require": true, "rejectUnauthorized": false } }`. Do not remove the mount while `DATABASE_URL` points at the internal `db` service.
- **Uploads:** Multer uses `memoryStorage()` and images go to Cloudinary, so the API container is stateless — safe to rebuild, restart and eventually scale.
- **Secrets** live only in `./.env` on the VM (git-ignored). Never commit it; rotate `POSTGRES_PASSWORD`/`JWT_SECRET` before exposing the app publicly.
- **Do not map port 5432** to the host — Postgres is reachable only on the internal `dietary_net` network.
- **`server/coverage/` is committed to the repo** but excluded from the image by `server/.dockerignore`. Consider dropping it from git (it is generated by `npm test`).
- **Rollback:** `docker compose down && git checkout main && docker compose up -d --build`.

---

## 🔐 Environment Variables

Create a `.env` file inside both the `server/` and `client/` directories based on the configurations below:

### Server (`server/.env`)

```env
PORT=3000
DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/dietary_db
JWT_SECRET=super_secret_jwt_key
CORS_ORIGIN=http://localhost:5173

# Third-party AI & API Keys
GEMINI_API_KEY=your_google_gemini_api_key
FATSECRET_CLIENT_ID=your_fatsecret_id
FATSECRET_CLIENT_SECRET=your_fatsecret_secret

# OAuth Configurations
GOOGLE_CLIENT_ID=your_google_client_id
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 📖 Usage Documentation

1.  **Onboarding**: Start by creating an account. You can register manually or use the Instant Login buttons (Google/GitHub).
2.  **Calibrate Your Profile**: Head to the _Profile_ page. Fill in your biological statistics (Weight, Height, Age, Gender) so our algorithms can perfectly calculate your baseline calories. Choose your goal (Cutting, Bulking, Maintaining).
3.  **Log Your Activities**: Go to the _Search_ or _Detect_ page. Search manual food via the database or just **Upload an Image** of your food and let the AI Vision analyze its calories.
4.  **AI Interactive Coach**: Tap the floating blue button on the bottom right anywhere inside the app to awaken the AI Nutritionist. Ask questions regarding your daily limits!
5.  **Analytics & PDF Export**: Review your History logs. At the end of the week, go to your Dashboard and tap **"Download Weekly Report"** to export your journey into a premium formatted PDF.

---

## 📡 API Documentation

The Backend server exposes a RESTful API containing endpoints for Authentication, Food Management, Daily Logs, Goals, and AI Interactions. For full documentation regarding error codes (`429 Rate Limits`, `401 Unauthorized`), edge cases, Socket.io Streaming protocols, and payload bodies, please refer directly to the source code or Postman collections.
