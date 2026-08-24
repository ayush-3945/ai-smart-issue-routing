# ⛏️ CoalDarpan OS — Complete Tech Stack & Architecture Specification
**Smart India Hackathon (SIH) 2026 • Ministry of Coal / DGMS**  
*AI-Powered Smart Governance, Hazard Triage & Statutory Compliance Monitoring System for Coal Mines*

---

## 📑 Table of Contents
1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [End-to-End System Architecture](#2-end-to-end-system-architecture)
3. [Frontend Engineering (Client-Side)](#3-frontend-engineering-client-side)
4. [Backend Engineering (Server-Side)](#4-backend-engineering-server-side)
5. [Database & Cloud Asset Pipeline](#5-database--cloud-asset-pipeline)
6. [AI Engine & Machine Learning Pipeline](#6-ai-engine--machine-learning-pipeline)
7. [Hardware & IoT Sensor Ingestion Architecture](#7-hardware--iot-sensor-ingestion-architecture)
8. [Statutory Compliance & DGMS Standard Mappings](#8-statutory-compliance--dgms-standard-mappings)
9. [Team Study Guide & Hackathon Pitch Viva Checklist](#9-team-study-guide--hackathon-pitch-viva-checklist)

---

## 1. Executive Summary & Problem Statement

### 🎯 The Challenge
Traditional coal mining operations across Indian coalfields (e.g., Jharia, Bokaro, Korba, Raniganj) struggle with:
* **Paper-based & Delayed Inspections:** Hazardous gas breaches or machine breakdowns take hours to escalate to safety managers.
* **Underground Zero-Connectivity:** Deep seam pits lack internet, causing lost or delayed incident logs.
* **Language & Literacy Barriers:** Heavy-gear workers in dust environments cannot easily type long reports.
* **Lack of Predictive Governance:** Regulators and mine managers react *after* accidents rather than preemptively predicting risk surges.

### 💡 The Solution: CoalDarpan OS
CoalDarpan OS is an enterprise industrial platform that digitizes statutory compliance (DGMS & Coal Mines Regulations 2017), introduces **zero-network offline sync**, **multilingual voice-to-text reporting**, **real-time IoT gas transducers**, and **Google Gemini 1.5 Flash autonomous hazard triage** with instant step-by-step containment SOPs.

---

## 2. End-to-End System Architecture

```
+---------------------------------------------------------------------------------------------------+
|                                      COALDARPAN OS ARCHITECTURE                                     |
+---------------------------------------------------------------------------------------------------+

 [ FIELD LEVEL: Ground Miners / Inspectors ]           [ COMMAND LEVEL: DGMS General Managers / Audit ]
    |                                                         |
    |-- 🎤 Native Hindi/English Voice Dictation               |-- 📊 Real-Time Analytics & Recharts
    |-- 🔴 Underground Offline-First Queue                    |-- 📡 Live 3s IoT Telemetry Transducers
    |-- 📍 Geo-Tagged GPS Pit Location                       |-- 👷 Contractor Compliance Scorecard
    |-- 📎 Multi-Evidence Photos / Gas Logs                   |-- 🚜 Fleet Maintenance Lifecycle Predictor
    |                                                         |-- 🔮 7-Day Predictive Risk Surge AI
    \___________________________                              ___________________________/
                                \                            /
                                 v                          v
                     +--------------------------------------------------+
                     |         REACT 19 + VITE SINGLE PAGE APP          |
                     |  - React Router Dom v7, Context APIs (Theme/i18n)|
                     |  - Glassmorphism Industrial UI, Service Worker   |
                     +--------------------------------------------------+
                                         |         ^
                       HTTP/REST Requests|         |Socket.io WebSockets
                         (Multipart Form)|         |(Real-time Events)
                                         v         |
                     +--------------------------------------------------+
                     |          NODE.JS + EXPRESS.JS API SERVER         |
                     |  - JWT Role-Based Access Control (Admin/Inspector)|
                     |  - Multer Multi-file Stream Parsing              |
                     |  - Statutory Audit CSV Exporter                  |
                     +--------------------------------------------------+
                              /                  |                 \
                             /                   |                  \
                            v                    v                   v
            +--------------------+   +---------------------+   +----------------------+
            |   MONGODB ATLAS    |   |    CLOUDINARY CDN   |   | GOOGLE GEMINI 1.5 AI |
            | - Incidents Schema |   | - Inspection Photos |   | - Statutory Triage   |
            | - User Credentials |   | - Gas Log Evidence  |   | - 3-Step SOP Engine  |
            | - Geolocation Tags |   | - Compressed PDFs   |   | - 7-Day Surge Model  |
            +--------------------+   +---------------------+   +----------------------+
```

---

## 3. Frontend Engineering (Client-Side)

### 🛠️ Core Technologies
* **React 19 (`react` ^19.0.0, `react-dom` ^19.0.0):** Leverages modern concurrent rendering, hooks (`useState`, `useEffect`, `useRef`, `useContext`, `useCallback`), and sub-millisecond DOM reconciliation.
* **Vite (`vite` ^8.1.5):** Ultra-fast compilation using ES modules and LightningCSS minification.
* **React Router Dom (`react-router-dom` ^7.1.5):** Handles client-side navigation between Landing Page (`/`), Field Portal (`/dashboard`), Admin Command Center (`/admin`), and Auth (`/login`, `/register`).
* **Recharts (`recharts` ^2.15.1):** High-performance SVG visualization library for category distribution pie charts, priority breakdown bar charts, and 7-day velocity line charts.

### 🌐 Specialized Web APIs & Custom Engines
1. **Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`):**
   * Enables continuous Hindi (`hi-IN`) and Indian English (`en-IN`) speech-to-text dictation directly into technical fields.
2. **Geolocation API (`navigator.geolocation`):**
   * Acquires GPS latitude, longitude, and accuracy coordinates at the mine pit and generates Google Satellite Map links.
3. **Offline-First Synchronization Engine (`localStorage`):**
   * Underground coal seams have zero cellular connectivity. Reports, metadata, and Base64-encoded inspection photos are serialized into `coaldarpan_offline_queue`.
   * Automatically dispatches all queued reports sequentially via `FormData` when `window.addEventListener('online')` triggers.
4. **Bilingual i18n Engine (`LanguageContext`):**
   * Zero-dependency dynamic dictionary supporting instant switching between English and Native Hindi across all pages, modals, and charts.
5. **Theme Engine (`ThemeContext`):**
   * Industrial Mission Control Dark Mode featuring deep coal slates (`#07090e`, `#0b0f19`) with high-contrast amber/gold accents (`#f59e0b`, `#fbbf24`).

---

## 4. Backend Engineering (Server-Side)

### 🛠️ Core Technologies
* **Node.js (LTS):** Non-blocking, event-driven asynchronous JavaScript runtime.
* **Express.js (`express` ^5.2.1):** Web framework exposing modular REST endpoints:
  * `/api/auth` — Registration, login, JWT issuance, password hashing.
  * `/api/complaints` — Incident creation, status transition, lead assignment, and live thread messages.
  * `/api/analytics` — Dashboard metrics, statutory aggregations, and predictive risk forecasts.
* **Socket.io (`socket.io` ^4.8.3):** Full-duplex WebSocket communication broadcasting real-time incident creation, status changes, and chat messages to all connected command center clients.
* **Security Middleware:**
  * `jsonwebtoken` (^9.0.3) for stateless RBAC token verification.
  * `bcryptjs` (^3.0.3) with 10 salt rounds for secure password storage.
  * `helmet` (^8.3.0) for HTTP header hardening.
  * `cors` (^2.8.6) for restricted cross-origin access control.

---

## 5. Database & Cloud Asset Pipeline

### 🍃 MongoDB Atlas & Mongoose ODM (`mongoose` ^9.7.4)
* **High-Availability Cloud Cluster:** Cloud database with automatic sharding and replication.
* **Complaint Document Schema (`Complaint.js`):**
  * `title`: String (Required, trimmed)
  * `description`: String (Detailed technical observation)
  * `mineSite`: String (e.g. Jharia Colliery - Pit 4)
  * `contractor`: String (e.g. BGR Mining, VPR Enterprises)
  * `category`: Enum `['Safety', 'Environment', 'Equipment', 'Labour', 'Production', 'General']`
  * `priority`: Enum `['Critical', 'High', 'Medium', 'Low']`
  * `aiSummary`: String (Gemini-generated executive brief)
  * `aiPlan`: Array of Strings (3-step immediate containment SOP)
  * `aiConfidence`: Number (Statutory classification confidence score 0.0 - 1.0)
  * `location`: Geo-Object `{ latitude, longitude, accuracy, address }`
  * `files`: Array of Object `{ url, public_id, originalName, fileType }`
  * `status`: Enum `['Pending', 'In Progress', 'Resolved', 'Closed']`
  * `assignedTo`: String (DGMS Safety Controller)

### ☁️ Cloudinary CDN (`cloudinary` ^2.10.0 + `multer` ^2.2.0)
* High-volume image and PDF document uploads are buffered in memory and streamed directly to Cloudinary CDN with automatic WebP compression.

---

## 6. AI Engine & Machine Learning Pipeline

### 🧠 Google Gemini 1.5 Flash (`@google/genai` ^2.17.1)
The system leverages Google's Gemini multimodal generative model with strict prompt-engineered system instructions:

1. **Autonomous Statutory Classification:**
   * Reads raw miner descriptions (even in colloquial Hindi/English) and maps them to statutory categories and severity levels according to **Coal Mines Regulations (CMR) 2017**.
2. **Immediate Containment SOP Generator:**
   * Dynamically constructs actionable 3-step protocols (e.g., *"1. Cut power to auxiliary transformer. 2. Erect danger barricades at 15m perimeter. 3. Engage secondary ventilation fan."*).
3. **7-Day Predictive Risk Surge Forecaster:**
   * In-memory analytical model that analyzes historical 30-day incident velocity, shift patterns, and machinery age to predict upcoming hazard spikes and staff allocations across mining pits.
4. **Contextual Semantic Duplicate Detection:**
   * Evaluates newly submitted titles against active open incidents in the same pit zone to prevent duplicate dispatching.

---

## 7. Hardware & IoT Sensor Ingestion Architecture

| Sensor Transducer | Statutory Norm (DGMS CMR 2017) | Telemetry Ingestion Logic |
| :--- | :--- | :--- |
| **Methane (CH4) Sensor** | Normal: `<0.75%` \| Limit: `1.25%` \| Evac: `>1.40%` | Continuous 3s sampling. Automated zero-human incident file if `CH4 > 1.25%`. |
| **Carbon Monoxide (CO)** | Normal: `<25 PPM` \| Warning: `>50 PPM` | Spontaneous combustion early warning transducer in coal haulage seams. |
| **Intake Ventilation Airflow** | Statutory Minimum: `>2.5 m/s` | Velocity sensor; alerts if auxiliary ventilation fan CFM drops below threshold. |
| **Strata Stress Vibrometer** | Safe Convergence: `<20 MPa` | Acoustic emission and roof convergence monitoring at active longwall faces. |

---

## 8. Statutory Compliance & DGMS Standard Mappings

* **CMR 2017 Regulation 153:** Strict monitoring and automatic ventilation bypass for inflammable and noxious gases.
* **Mines Act 1952 Section 22:** Powers to prohibit employment in cases of imminent danger and issue contractor show-cause audits.
* **DGMS Tech Circular 04 (2021):** Continuous real-time multi-gas monitoring and mandatory digital inspection records.
* **MoEFCC Air & Water Acts:** Statutory compliance for dust suppression, PM10 monitoring, and mine water drainage.

---

## 9. Team Study Guide & Hackathon Pitch Viva Checklist

### 🎓 5-Minute Crash Course for Teammates

#### Q1: "What makes this project different from a standard Helpdesk?"
> *"CoalDarpan OS is purpose-built for the hazardous mining domain. Unlike standard IT ticket tools, it implements underground zero-connectivity offline synchronization, Web Speech API for gloved miners in Hindi/English, real-time IoT multi-gas sensor autonomous dispatching, contractor compliance scoreboards, and DGMS CMR 2017 statute enforcement via Gemini AI."*

#### Q2: "How does Offline Sync work when a miner is 300 meters underground?"
> *"When `navigator.onLine` is false, the form submission is intercepted. All data and attached images are converted into serialized Base64 and placed into `localStorage` (`coaldarpan_offline_queue`). When the inspector returns to the surface and network connectivity is restored, a background event triggers sequential auto-dispatch to the REST API with zero data loss."*

#### Q3: "How is Google Gemini integrated?"
> *"The backend passes the raw incident title and description to `@google/genai` (Gemini 1.5 Flash) with an engineered system prompt acting as a DGMS Chief Safety Auditor. Gemini returns a structured JSON response containing the category, priority, confidence score, executive brief, assigned lead, and 3-step immediate containment SOP."*

---
*Created for Smart India Hackathon 2026 • CoalDarpan OS Team*
