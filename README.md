<div align="center">
  <img src="./client/public/dietary-logo.png" alt="Dietary Logo" width="130" />
  <h1>🥗 Dietary</h1>
  <p><strong>Next-Gen AI-Powered Nutrition, Calorie Tracking & Real-Time Dietary Coaching</strong></p>

  <p>
    <a href="https://app.muhammadyuzzaf.com/"><strong>Explore Live Demo »</strong></a>
    &nbsp;•&nbsp;
    <a href="./api_docs.md"><strong>Explore API Docs »</strong></a>
    &nbsp;•&nbsp;
    <a href="#-quick-start-with-docker"><strong>Quick Start »</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Google_Gemini-AI_Vision_%26_Chat-8E75C2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
    <img src="https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
    <img src="https://img.shields.io/badge/Docker-Compose_Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
    <img src="https://img.shields.io/badge/Jest-131_Tests_Passing-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest Tests" />
    <img src="https://img.shields.io/badge/PWA-Installable-FF6C37?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA" />
  </p>
</div>

---

## 🌟 Overview

**Dietary** is an intelligent, full-stack health companion designed to make nutrition tracking seamless, interactive, and actionable. Powered by **Google Gemini AI**, Dietary transforms raw meals into granular macronutrient breakdowns from a single photo, delivers real-time conversational dietary coaching over **Socket.io**, and dynamically tracks daily caloric surplus or deficit against your personalized biological parameters.

Whether you're **cutting**, **bulking**, or **maintaining**, Dietary adapts to your lifestyle with automated weekly PDF progress reports, multi-provider OAuth, and an offline-capable Progressive Web App (PWA).

---

## ✨ Key Features

<table>
  <tr>
    <td width="50%">
      <h3>📸 AI Vision Food Recognition</h3>
      <p>Simply take or upload a photo of your meal. Google Gemini Vision scans the image, identifies dishes, and estimates calories, protein, fat, and carbohydrates automatically.</p>
    </td>
    <td width="50%">
      <h3>🤖 Real-Time Streaming AI Coach</h3>
      <p>Interactive 24/7 nutrition chatbot with instantaneous typing effects streamed via <strong>Socket.io</strong>. Features a 3-tier cascade fallback mechanism (<code>gemini-2.5-flash-lite</code> → <code>gemini-3.5-flash-lite</code> → <code>gemini-3.1-flash-lite</code>) ensuring zero downtime.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📊 Smart Analytics & Daily Insights</h3>
      <p>Automatic daily evaluations comparing your logged calories against calculated BMR/TDEE targets. Identifies deficit, maintenance, or surplus with actionable advice.</p>
    </td>
    <td width="50%">
      <h3>📄 One-Click Weekly PDF Reports</h3>
      <p>Generate professional, beautifully formatted 7-day nutritional progress digests on-the-fly using <strong>PDFKit</strong>, complete with caloric averages and dietary trends.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🔍 Multi-Source Food Database</h3>
      <p>Instant search powered by the <strong>FatSecret Platform API</strong> with internal PostgreSQL caching, guaranteeing rapid queries and reduced external API overhead.</p>
    </td>
    <td width="50%">
      <h3>📱 Installable PWA & Offline Support</h3>
      <p>Add Dietary straight to your iOS or Android home screen with full fullscreen immersion, app icons, splash screens, and Workbox caching.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🔐 Multi-Provider Authentication</h3>
      <p>Frictionless onboarding with <strong>Google OAuth</strong> and <strong>GitHub OAuth</strong>, alongside traditional email/password auth protected by bcrypt, JWT, and email password reset via Nodemailer.</p>
    </td>
    <td width="50%">
      <h3>🌐 Bilingual Experience (EN / ID)</h3>
      <p>Full internationalization support allowing effortless switching between English and Bahasa Indonesia across the entire UI and AI interactions.</p>
    </td>
  </tr>
</table>

---

## 🏗️ Architecture & Data Flow

```text
  ┌─────────────────────────────────────────────────────────┐
  │                 React 19 PWA Client                     │
  │     (Tailwind CSS v4 • Redux Toolkit • React Query)     │
  └───────────────┬─────────────────────────┬───────────────┘
                  │ HTTP REST               │ WebSockets
                  │ (JWT Bearer)            │ (Socket.io)
                  ▼                         ▼
  ┌─────────────────────────────────────────────────────────┐
  │                  Express.js API Server                  │
  │     (Rate Limiters • Multer • PDFKit • Winston)         │
  └───────┬───────────────┬─────────────────┬───────────────┘
          │               │                 │
          ▼               ▼                 ▼
   ┌─────────────┐ ┌─────────────┐   ┌───────────────────────────┐
   │ PostgreSQL  │ │ Cloudinary  │   │     Google Gemini AI      │
   │  (Sequelize │ │ (Avatar CDN)│   │   • Vision Food Detector  │
   │   ORM 16)   │ └─────────────┘   │   • Streaming Chat Coach  │
   └─────────────┘                   │   • Daily Insight Engine  │
          ▲                          └───────────────────────────┘
          │ Cache Fallback
   ┌───────────────┐
   │ FatSecret API │ (Food & Macro Database)
   └───────────────┘
```

---

## 🛠️ Tech Stack

### Client (Frontend)
- **Framework & Tooling:** React 19, Vite, React Router v7
- **Styling:** Tailwind CSS v4, Lucide React Icons
- **State & Data Fetching:** Redux Toolkit, TanStack Query (React Query)
- **Real-Time Communication:** `socket.io-client`
- **PWA Capabilities:** `vite-plugin-pwa`, Workbox
- **Feedback & Notifications:** SweetAlert2, React Hot Toast

### Server (Backend)
- **Runtime & Framework:** Node.js 22, Express.js
- **Database & Persistence:** PostgreSQL 16, Sequelize ORM
- **Artificial Intelligence:** `@google/generative-ai` (Gemini 2.5 Flash Lite, 3.5 Flash Lite, 3.1 Flash Lite)
- **Authentication & Security:** JWT, Google Auth Library, Axios (GitHub OAuth), Bcryptjs, Express Rate Limit
- **Media & File Handling:** Multer, Cloudinary SDK, PDFKit
- **Real-Time Duplex:** Socket.io
- **Testing Suite:** Jest, Supertest (131 test cases across 16 test suites)

---

## 📂 Repository Structure

```text
ip-yuzzaf/
├── client/                     # Frontend Application
│   ├── public/                 # PWA icons, manifest, logos
│   ├── src/
│   │   ├── components/         # Reusable UI widgets & Chatbot
│   │   ├── pages/              # Views (Dashboard, Search, Detect, Profile, Logs)
│   │   ├── services/           # Axios API services & socket clients
│   │   └── store/              # Redux slices & state management
│   ├── Dockerfile              # Multi-stage production build
│   └── vite.config.js          # Vite & PWA configuration
├── server/                     # Backend API & Socket Server
│   ├── bin/www                 # Server entry point (HTTP & Socket.io)
│   ├── controllers/            # Controller layer (AI, Auth, Food, Goal, Log, User)
│   ├── middlewares/            # Auth, authorization, multer, rate limiter, error handler
│   ├── models/                 # Sequelize database models
│   ├── routes/                 # Express REST route definitions
│   ├── services/               # Gemini AI, FatSecret, and Nutrition services
│   ├── __tests__/              # Jest test suites (131 tests)
│   └── Dockerfile              # Node.js production image with auto-migration
├── docker-compose.yml          # Production multi-container orchestration
├── .env.docker.example         # Environment template for Docker Compose
├── api_docs.md                 # Complete REST API & WebSocket specifications
└── README.md                   # Project overview & guide
```

---

## 🚀 Quick Start with Docker

The fastest way to spin up the entire backend ecosystem (PostgreSQL + Express API + Socket.io):

### 1. Clone & Setup Environment
```bash
git clone https://github.com/yuzzaf/ip-yuzzaf.git
cd ip-yuzzaf
cp .env.docker.example .env
```

### 2. Configure Essential Secrets
Edit `.env` and fill in your keys:
```env
POSTGRES_PASSWORD=your_strong_db_password
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
CORS_ORIGIN=http://localhost:5173
```

### 3. Launch Containers
```bash
docker compose up -d --build
```
The server will automatically run database migrations and start listening on port `3000`.

Check running services:
```bash
docker compose ps
docker compose logs -f server
```

---

## 💻 Manual Local Development

### Prerequisites
- **Node.js**: v18.x or v22.x LTS
- **PostgreSQL**: v14+ running locally
- **Google Gemini API Key**: [Google AI Studio](https://aistudio.google.com/)

### 1. Server Setup
```bash
cd server
npm install

# Setup database & migrations
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

# Start backend dev server
npm run dev
```
> Server runs at `http://localhost:3000`

### 2. Client Setup
Open a separate terminal:
```bash
cd client
npm install
npm run dev
```
> Client runs at `http://localhost:5173`

---

## 🧪 Testing & Quality Assurance

The backend includes a comprehensive automated test suite powered by Jest and Supertest, covering authentication, data validation, rate-limiting, authorization, and Gemini AI multi-model cascades.

```bash
cd server
npm test
```

### Test Coverage Highlights:
- **16 Test Suites**: 100% passing (`131 of 131 tests`)
- **Controllers & Middlewares**: 90%+ branch and statement coverage
- **Resilient AI Mocking**: Verified failover between primary and secondary Gemini models

---

## 🔐 Environment Variables Reference

### Backend (`server/.env`)
| Variable | Description | Required | Example |
| :--- | :--- | :---: | :--- |
| `PORT` | API Port | Yes | `3000` |
| `DATABASE_URL` | PostgreSQL connection URI | Yes | `postgres://user:pass@localhost:5432/dietary_db` |
| `JWT_SECRET` | Secret key for signing auth tokens | Yes | `super_secure_random_key` |
| `CORS_ORIGIN` | Allowed Frontend Origin | Yes | `http://localhost:5173` |
| `GEMINI_API_KEY` | Google Generative AI API Key | Yes | `AIzaSy...` |
| `FATSECRET_CLIENT_ID` | FatSecret Platform Client ID | Optional | `your_client_id` |
| `FATSECRET_CLIENT_SECRET` | FatSecret Platform Secret | Optional | `your_client_secret` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Optional | `123456...apps.googleusercontent.com` |
| `GITHUB_CLIENT_ID` | GitHub OAuth App ID | Optional | `Ov23...` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret | Optional | `your_github_secret` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Storage Account | Optional | `dietary-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | Optional | `1234567890` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | Optional | `your_cloudinary_secret` |
| `EMAIL_USER` | Gmail address for password reset | Optional | `support@dietary.app` |
| `EMAIL_PASS` | Gmail App Password | Optional | `xxxx xxxx xxxx xxxx` |

### Frontend (`client/.env`)
| Variable | Description | Required | Example |
| :--- | :--- | :---: | :--- |
| `VITE_API_URL` | Base Backend REST API URL | Yes | `http://localhost:3000/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | Optional | `123456...apps.googleusercontent.com` |

---

## 📡 API & WebSocket Reference

Comprehensive documentation for all endpoints, payload schemas, error formats, and WebSocket streaming events is available in [**`api_docs.md`**](./api_docs.md).

### Quick Endpoint Cheatsheet:
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Sign in & obtain JWT
- `POST /api/auth/google-login` / `github-login` — OAuth single sign-on
- `GET  /api/users/profile` — Fetch user metrics & BMR data
- `PATCH /api/users/profile-picture` — Upload avatar to Cloudinary
- `GET  /api/foods/search?q={query}` — Search nutrition database
- `POST /api/foods/detect` — AI Vision food recognition
- `GET  /api/logs/today` — Current day's food log & calories
- `POST /api/logs` — Log meal entry
- `GET  /api/ai/insight` — Get AI daily nutritional recommendation
- `GET  /api/ai/insight/export` — Download weekly PDF report
- `POST /api/ai/chat` — AI conversational coach with Socket.io streaming

---

## ☁️ Cloud & Production Deployment

The project is structured for easy deployment across modern cloud providers:
- **Frontend (Client)**: Deployed on [Vercel](https://vercel.com) with global edge distribution at `https://app.muhammadyuzzaf.com/`.
- **Backend & Database**: Containerized with Docker Compose on an **Oracle Cloud Infrastructure (OCI) Always-Free VM** (Ubuntu 24.04 / Ampere ARM64 or AMD64) behind an Nginx reverse proxy with automated Let's Encrypt SSL/TLS certificates.

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute with attribution.

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/yuzzaf"><strong>Muhammad Yuzzaf</strong></a></p>
  <p>🌱 <em>Empowering healthier lives through intelligent technology.</em></p>
</div>
