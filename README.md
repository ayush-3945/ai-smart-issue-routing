# ⚡ CoalDarpan — Smart Mining Governance & Statutory Compliance Platform

[![Live App](https://img.shields.io/badge/Live%20App-ai--smart--issue--routing--jbb8.vercel.app-0ea5e9?style=for-the-badge&logo=vercel)](https://ai-smart-issue-routing-jbb8.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Railway%20Live-0B0D0E?style=for-the-badge&logo=railway)](https://ai-smart-issue-routing-production.up.railway.app)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> 🌐 **Live Web Application:** [https://ai-smart-issue-routing-jbb8.vercel.app](https://ai-smart-issue-routing-jbb8.vercel.app)  

**CoalDarpan** is an enterprise-grade AI-powered smart governance and statutory compliance platform designed specifically for the Indian Coal Mining sector (DGMS & Ministry of Coal regulations). It replaces manual paper-based reporting with a robust digital ecosystem featuring **zero-network offline syncing**, **multilingual voice dictation**, **Haversine GPS geofencing**, and **autonomous hazard triage via Google Gemini AI**.

---

## 🖥️ Platform Showcase

*(Please update the `docs/screenshots/` folder with new screenshots of the CoalDarpan application)*

<div align="center">
  <p><strong>1. DGMS Central Command Center & Live Analytics Hub</strong></p>
  <!-- <img src="./docs/screenshots/admin-dashboard.png" alt="CoalDarpan Admin Dashboard" width="100%" style="border-radius: 12px; border: 1px solid #1e293b;" /> -->
  <p><em>[Admin Dashboard Screenshot Placeholder]</em></p>
  <br /><br />
  <p><strong>2. Field Miner Portal with Offline PWA & Voice Dictation</strong></p>
  <!-- <img src="./docs/screenshots/user-dashboard.png" alt="CoalDarpan Field Portal" width="100%" style="border-radius: 12px; border: 1px solid #1e293b;" /> -->
  <p><em>[Field Portal Screenshot Placeholder]</em></p>
  <br /><br />
  <p><strong>3. Contractor / Subsidiary Action Hub</strong></p>
  <!-- <img src="./docs/screenshots/contractor-hub.png" alt="CoalDarpan Contractor Hub" width="100%" style="border-radius: 12px; border: 1px solid #1e293b;" /> -->
  <p><em>[Contractor Hub Screenshot Placeholder]</em></p>
</div>

---

## 🌟 Key Technical Innovations

### 🤖 1. Gemini AI Autonomous Routing & Triage
- **Natural Language Processing (NLP)**: Analyzes unstructured field reports using Google Gemini 1.5 Flash.
- **Auto-Categorization**: Automatically classifies issues into `Machinery Failure`, `Gas Leak`, `Statutory Violation`, or `General Hazard`.
- **Intelligent Routing**: Instantly routes specific violations directly to outsourced contractors, mine management, or regulatory authorities to prevent blame-shifting.

### 📶 2. Offline-First PWA (Zero Network Support)
- **Local Storage Queue**: Deep underground mines have zero cellular connectivity. Form submissions are intercepted, serialized into Base64, and saved locally via `localStorage`.
- **Auto-Sync Mechanism**: The moment a miner returns to the surface and regains network access, background event listeners trigger sequential auto-dispatch to the REST API with zero data loss.

### 🎙️ 3. Accessibility & Field Usability
- **Multilingual Voice AI**: Integrated Web Speech API allows gloved miners to dictate field notes in Hindi/English, which the AI auto-translates and structures.
- **Logbook OCR**: Converts photographs of physical paper logbooks into digital text instantly.
- **Haversine GPS Geofencing**: Verifies attendance and hazard coordinates by calculating spherical geometry distances to prevent proxy reporting.

### 📊 4. Command Center & Real-Time Dashboards
- **Live Sockets**: Real-time Socket.io integration pushes alerts to the DGMS Admin Dashboard without requiring a page refresh.
- **Hierarchical Dropdowns**: Precise geospatial mapping routing data accurately by State and CIL Subsidiary.

---

## 🏗️ System Architecture Flow

```mermaid
graph TD;
    Miner[Miner / Field Officer] -->|No Internet| LocalStorage[Offline Local Storage Queue];
    LocalStorage -->|Auto-Sync when Online| Express[Express REST API];
    Miner -->|Online Submit| Express;
    Express -->|Token Check| AuthMiddleware[JWT Auth & RBAC];
    AuthMiddleware -->|Hazard Text Context| Gemini[Google Gemini AI Engine];
    Gemini -->|JSON Analysis & Routing| Express;
    Express -->|Persist Document| MongoDB[(MongoDB Atlas Database)];
    Express -->|Socket Alert| Admin[DGMS Command Center];
    Express -->|Socket Alert| Contractor[Contractor Hub];
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
| :--- | :--- | :--- |
| **Frontend** | React.js + Tailwind CSS | Industry standard, lightweight, responsive PWA |
| **Backend** | Node.js + Express.js | Fast & scalable non-blocking I/O processing |
| **Database** | MongoDB + Mongoose | Flexible NoSQL schema for unstructured mining reports |
| **AI Engine** | Google Gemini API | Modern LLM integration for contextual intelligence |
| **Authentication**| JWT + bcrypt | Highly secure token-based authentication |
| **Real-time** | Socket.io | Live hazard alerts & status updates |
| **Security** | Helmet.js + express-rate-limit | Production-grade security hardening |
| **Deployment** | Vercel (Frontend) + Railway/Render | Free, reliable, CI/CD automated deployment |

---

## 📡 Core API Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user (Miner, Admin, Contractor) & issue JWT | Public |
| `POST` | `/api/complaints` | Submit hazard for Gemini AI triage & routing | Protected (User) |
| `GET`  | `/api/complaints/my` | Fetch user's submitted logs | Protected (User) |
| `GET`  | `/api/complaints/all` | Fetch hierarchical logs for management | Protected (Admin) |
| `PATCH`| `/api/complaints/:id/status` | Update hazard resolution lifecycle | Protected (Admin/Contractor) |

---

*Created for Smart India Hackathon 2026 • The Bootloaders*