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
 ┃ ┗ 📜 vite.config.js       # Vite + PWA configurations
 ┣ 📂 server                 # Backend Node/Express Application
 ┃ ┣ 📂 bin                  # HTTP & Socket.io Server Entry Point (www)
 ┃ ┣ 📂 controllers          # Application Business Logic (AI, Auth, Logs, etc.)
 ┃ ┣ 📂 middlewares          # Rate Limiters, JWT Verification, Authorization
 ┃ ┣ 📂 models               # Sequelize Database Models
 ┃ ┣ 📂 services             # Third-party Services (Gemini AI, Fatsecret)
 ┃ ┗ 📂 __tests__            # Comprehensive Jest Test Suites (90+ Tests)
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
