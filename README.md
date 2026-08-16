# ⚡ SmartIssue AI — Autonomous Issue Classification & Real-Time Resolution Ops

[![Deploy with Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![Deployed on Railway](https://img.shields.io/badge/Backend-Railway-0B0D0E?style=for-the-badge&logo=railway)](https://railway.app/)
[![Powered by Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini%201.5-8E75FF?style=for-the-badge&logo=googlegemini)](https://ai.google.dev/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **SmartIssue AI** is an enterprise-grade, full-stack autonomous issue routing platform powered by **Google Gemini AI**. It eliminates manual triage by automatically analyzing incoming user complaints, classifying them into departments (IT, HR, Finance, Operations, General), assigning priority ratings, calculating confidence scores, and providing executive AI summaries in real-time.

---

## 🌟 Key Features

### 🤖 1. Gemini AI Autonomous Routing
- **Instant Natural Language Processing**: Analyzes incoming issues using Google Gemini 1.5 Flash.
- **Categorization**: Automatically routes to `IT`, `HR`, `Finance`, `Operations`, or `General`.
- **Urgency & Priority Scoring**: Assigns `Critical`, `High`, `Medium`, or `Low` priority badges based on contextual urgency.
- **Confidence Rating & Executive Summaries**: Generates high-level summaries and confidence scores (up to 98%+) to speed up administrative decision-making.

### 📊 2. Admin Command Center & Analytics
- **Live Recharts Dashboard**: Interactive visual breakdown using Donut Charts (Categories), Bar Charts (Priorities), and 7-Day Ingestion Velocity Line Charts.
- **Human-in-the-Loop AI Feedback Loop**: Admins can manually re-classify categories or override AI priority assignments, improving model alignment over time.
- **Lifecycle Management**: Track and update complaint lifecycles (`Pending` ➔ `In Progress` ➔ `Resolved` ➔ `Closed`).
- **Live Search & Filter Pills**: Instant real-time filtering by text search or department badges.

### 🛡️ 3. Security & Architecture
- **Stateless JWT Authentication**: Secure Access Token & Refresh Token rotation workflow.
- **Role-Based Access Control (RBAC)**: Strict separation of User and Admin permissions.
- **Security Hardening**: Protected with `Helmet`, Rate Limiting (`express-rate-limit`), CORS controls, and `express-mongo-sanitize` for NoSQL injection prevention.

### 🎨 4. Premium Modern UI/UX
- **Glassmorphic Dark Theme**: Ultra-sleek UI designed with Tailwind-inspired custom CSS tokens & smooth micro-interactions.
- **Real-time UX**: Custom sliding Toast notifications, shimmer loading skeletons, animated counter badges, and responsive desktop/mobile layouts.

---

## 🏗️ System Architecture

```mermaid
graph TD;
    User[📱 User / Client Portal] -->|HTTP POST + Image| Express[⚡ Express REST API];
    Express -->|Token Check| AuthMiddleware[🔒 JWT Auth & RBAC];
    AuthMiddleware -->|Text Context| Gemini[🧠 Google Gemini AI Service];
    Gemini -->|JSON Analysis: Category, Priority, Summary| Express;
    Express -->|Media Stream| Cloudinary[☁️ Cloudinary Storage];
    Express -->|Persist Document| MongoDB[(🍃 MongoDB Atlas Database)];
    Express -->|Async Notification| Email[📧 Nodemailer Email Service];
    Express -->|Socket Event| Admin[👑 Admin Command Center];


    
---

## 🛠️ Tech Stack

| Domain | Technology / Library |
| :--- | :--- |
| **Frontend** | React 18, React Router v6, Recharts, Axios, Pure Vanilla CSS |
| **Backend** | Node.js, Express.js, Socket.io |
| **Artificial Intelligence** | Google Generative AI SDK (`@google/generative-ai` - Gemini 1.5 Flash) |
| **Database & Storage** | MongoDB Atlas, Mongoose ODM, Cloudinary API |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **Security** | Helmet, Express Rate Limit, Mongo Sanitize |
| **Deployment** | Vercel (Frontend SPA), Railway (Node.js API Engine) |

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user/admin | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT tokens | Public |
| `POST` | `/api/complaints` | Submit issue for Gemini AI analysis & routing | Protected (User) |
| `GET` | `/api/complaints/my` | Fetch user's submitted issues | Protected (User) |
| `GET` | `/api/complaints/all` | Fetch all system issues for management | Protected (Admin) |
| `PATCH` | `/api/complaints/:id/status` | Update issue lifecycle status | Protected (Admin) |
| `PATCH` | `/api/complaints/:id/category`| Human-in-the-loop AI category reclassification | Protected (Admin) |
| `GET` | `/api/analytics/dashboard` | Fetch aggregated metrics & trend stats | Protected (Admin) |

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="center">
  Designed & Built with ❤️ by <strong>Ayush Pandey</strong>
</p>