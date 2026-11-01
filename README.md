# 🏫 Shanti Gurukul — Residential School (Gurukul) Management System

> **A Comprehensive 24/7 ERP, Hostel Care & Academic Governance Platform**  
> **Institution:** Shanti Gurukul, Bachani, Tal. Kagal, Dist. Kolhapur, Maharashtra — 416234  
> **Motto:** *ज्ञानं परमं बलम् (Knowledge is the Supreme Strength)*

---

## 📌 Table of Contents

1. [Executive Summary & Problem Statement](#-executive-summary--problem-statement)
2. [Key Objectives & Innovations](#-key-objectives--innovations)
3. [System Architecture & Technology Stack](#-system-architecture--technology-stack)
4. [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
5. [End-to-End Functional Modules](#-end-to-end-functional-modules)
   - [1. Executive Overview & Real-Time Dashboard](#1-executive-overview--real-time-dashboard)
   - [2. Multi-Mode Attendance Management](#2-multi-mode-attendance-management)
   - [3. Residential Mentor & Night Roll-Call System](#3-residential-mentor--night-roll-call-system)
   - [4. Student Pocket Money & Safe Custody Ledger](#4-student-pocket-money--safe-custody-ledger)
   - [5. Medical, Clinic Escort & Health Protocols](#5-medical-clinic-escort--health-protocols)
   - [6. Hostel Room Inventory & Boarder Allocation](#6-hostel-room-inventory--boarder-allocation)
   - [7. Mess & Weekly Nutrition Planning](#7-mess--weekly-nutrition-planning)
   - [8. Academic Timetable & Conflict-Free Scheduling](#8-academic-timetable--conflict-free-scheduling)
   - [9. Exams, Continuous Evaluation & Report Cards](#9-exams-continuous-evaluation--report-cards)
   - [10. Fee Collection & Itemized Official Receipts](#10-fee-collection--itemized-official-receipts)
   - [11. Parent Portal & Guardian Synchronization](#11-parent-portal--guardian-synchronization)
   - [12. Tri-Lingual Localization (English, Marathi, Hindi)](#12-tri-lingual-localization-english-marathi-hindi)
6. [Institutional Data Specifications (Seed Roster)](#-institutional-data-specifications-seed-roster)
7. [RESTful API Endpoint Documentation](#-restful-api-endpoint-documentation)
8. [Database Schema & Data Model](#-database-schema--data-model)
9. [Installation & Deployment Guide](#-installation--deployment-guide)
10. [Default Login Credentials](#-default-login-credentials)
11. [Project Report Reference & Academic Highlights](#-project-report-reference--academic-highlights)

---

## 📖 Executive Summary & Problem Statement

### The Problem
Conventional School Management Systems (SMS) are designed solely for **day schools**, operating only from 9:00 AM to 4:00 PM. They manage standard attendance, report cards, and tuition fees, but completely ignore the **24/7 custodial responsibilities** of a Residential Boarding School (Gurukul).

In a residential Gurukul:
- Students live away from home; faculty and mentors act *in loco parentis* (in place of parents).
- **Night Roll-Call:** Roll calls must happen room-by-room every night at 9:30 PM with zero margin for error.
- **Cash Management:** Boarding students cannot carry cash; parents deposit petty cash into school custody, disbursed only with teacher/mentor approval for toiletries, haircuts, and stationery.
- **Medical Emergencies:** On-campus clinics cannot replace qualified hospital care. When a boarder falls ill, a mentor must escort them to a nearby hospital/clinic, log prescriptions, administer doses, and notify parents immediately.
- **Hostel vs. Day Scholar Demographics:** A mixed school requires strict categorization between day scholars (academics-only) and hostel residents (24/7 care, mess, bed allocation).

### The Solution
**Shanti Gurukul ERP** is a full-stack, purpose-built institutional platform that unifies academic rigor with 24/7 residential care governance. It provides dedicated role-based dashboards, automated reporting, isolated printable audit trails, and instant parent visibility.

---

## 🎯 Key Objectives & Innovations

- **24/7 Holistic Governance:** Seamlessly bridges morning classroom lectures with evening hostel life, dining nutrition, health checks, and night curfew.
- **Zero-Trust Accountability:** Strict role-based permissions ensuring mentors, teachers, principals, and accounts personnel only access sanctioned data.
- **Safe Petty Cash Custody:** Itemized debit/credit ledger tracking every rupee spent by residential boarders.
- **Isolated Print Infrastructure:** Clean, printable official rosters, salary slips, fee receipts, and monthly attendance registers with authorized signatures.
- **Tri-Lingual Cultural Heritage:** Real-time localized interface in **English**, **Marathi (मराठी)**, and **Hindi (हिंदी)** honoring the Gurukul ethos.

---

## 🏗️ System Architecture & Technology Stack

The application follows a decoupled **Client-Server-Database Architecture**:

```
+--------------------------------------------------------------------------+
|                               Client Tier                                |
|   React 18 • Vite 8 • React Router v6 • Context API • CSS Glassmorphism  |
+--------------------------------------------------------------------------+
                                    │  ▲
                    HTTPS / JSON    │  │  Axios Client (Bearer JWT)
                                    ▼  │
+--------------------------------------------------------------------------+
|                             Application Tier                             |
|       Node.js (v20+) • Express.js • JWT Middleware • CORS Handler        |
+--------------------------------------------------------------------------+
                                    │  ▲
                     Mongoose / BSON│  │  In-Memory High-Speed Store
                                    ▼  │
+--------------------------------------------------------------------------+
|                               Database Tier                              |
|          MongoDB Community Edition • Indexed Collections • BSON          |
+--------------------------------------------------------------------------+
```

### Technology Breakdown

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18** (Vite bundler) | Fast virtual DOM diffing, component modularity, instant HMR |
| **Styling & UI** | **Custom Glassmorphism CSS** | Deep twilight `#040915` & `#0b162c` palette with royal gold `#F59E0B` |
| **State Management** | **React Context API** | Global `AuthContext` (JWT session) and `LanguageContext` (i18n) |
| **Backend Runtime** | **Node.js + Express** | Non-blocking asynchronous I/O, lightweight REST API architecture |
| **Authentication** | **JSON Web Tokens (JWT)** | Stateless authorization with 8-hour token expiration |
| **Persistence** | **MongoDB + In-Memory Fallback** | Flexible document schema with automatic fallback for offline development |

---

## 🔐 Role-Based Access Control (RBAC)

The system enforces granular authorization across 5 key roles:

```
                  ┌───────────────────────┐
                  │    Administrator      │ Full System Access & Config
                  └──────────┬────────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
   ┌─────────────────┐┌──────────────┐┌──────────────────────┐
   │    Principal    ││   Teacher    ││  Residential Mentor  │
   │  Academic Head  ││  Classroom   ││  Hostel Wings Care   │
   └─────────────────┘└──────────────┘└──────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Parent / Guardian   │ Read-Only Ward View
                  └──────────────────────┘
```

| Module | Admin | Principal | Teacher | Residential Mentor | Parent |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Dashboard** | Full | Full | Read | Mentor Command Center | — |
| **Student Directory** | Read/Write | Read/Write | Read | Read | Ward Only |
| **Class Attendance** | Full | Full | Mark / Edit | Read | Ward Only |
| **Hostel Roll-Call** | Full | Full | — | Full (Wings A–D) | Ward Only |
| **Pocket Money Custody**| Full | Read | Disburse | Full Disburse/Log | Ward View |
| **Medical & Escorts** | Full | Full | Log / Escort | Full Log / Escort | Ward Alerts |
| **Timetable** | Full | Full | View Class | View Duty | Ward Schedule |
| **Mess Menu** | Full | Full | Read | Special Diets | Read |
| **Fee Management** | Full | Full | — | — | Ward Dues |
| **Parent Portal** | — | — | — | — | Full Access |

---

## ⚙️ End-to-End Functional Modules

### 1. Executive Overview & Real-Time Dashboard
- **Demographic KPIs (Row 1):** Real-time counters showing **120 Total Students**, **60 Boys (50%)**, **60 Girls (50%)**, **60 Residential Boarders (50%)**, and **60 Day Scholars (50%)**.
- **Staff & Infrastructure KPIs (Row 2):** Real-time monitoring of **11 Working Faculty**, **4 Dedicated Residential Mentors**, **2 Campus Peons/Support Staff**, **60 Boarders**, and **15 Boys Hostel Rooms**.
- **Student Distribution Donut:** Real-time visual split between Day Scholars (Girls) and Residential Boarders (Boys).
- **Today's Attendance Gauge:** Radial gauge tracking campus presence (`95%`, 114 present, 5 absent, 1 on leave).
- **Boys Hostel Occupancy:** Progress tracking showing 15/15 rooms occupied (100%) and 60/60 residential boys accommodated.
- **Residential Mentor Command Center:** Prominently surfaced when a mentor logs in, providing one-click access to roll calls, pocket money vouchers, and clinic escort logs.

---

### 2. Multi-Mode Attendance Management
Attendance in a Gurukul requires multiple operational modes:
1. **Period-Wise Class Attendance:** Teachers mark attendance across **8 distinct periods** (08:00 AM to 03:20 PM) with subject and room auto-detection.
2. **Daily Attendance Register:** Whole-school class register tracking overall daily reporting.
3. **Monthly Subject Attendance Report:** Computes working days, conducted lectures, percentage presence, and flags defaulters (<75%) with an isolated, print-ready format.

---

### 3. Residential Mentor & Night Roll-Call System
- **Supervision Structure:** 4 male Residential Mentors supervise 60 boys housed in 15 hostel rooms:
  - **Wing A (Class 5–6):** *Mr. Sanjay Bhosale* (Rooms 201–204 • 16 Boys)
  - **Wing B (Class 6–7):** *Mr. Ramesh Shinde* (Rooms 205–208 • 16 Boys)
  - **Wing C (Class 8–9):** *Mr. Suresh Jadhav* (Rooms 209–212 • 16 Boys)
  - **Wing D (Class 9–10):** *Mr. Deepak Kadam* (Rooms 213–215 • 12 Boys)
- **Night Roll-Call Verification:** Conducted room-by-room every night at 09:30 PM. Statuses: *Present in Bed*, *In Sickbay*, *On Approved Leave*, or *Missing Alert*.
- **Printable Night Roll-Call Roster:** Generates an official roster signed exclusively by the **Residential Mentor** with zero UI distractions.
- **Monthly Hostel Audit:** Generates 30-day cumulative overnight compliance reports for school records.

---

### 4. Student Pocket Money & Safe Custody Ledger
Residential students are barred from carrying personal cash. The school maintains a digital safe custody ledger:
- **Parent Top-Ups:** Parents credit money via UPI, NetBanking, or cash at the hostel office.
- **Categorized Disbursements:** Verified debits across 6 sanctioned categories:
  - 📚 *Stationery & Textbooks*
  - 🧼 *Toiletries & Personal Hygiene*
  - ✂️ *Monthly Haircut & Grooming*
  - 💊 *Prescription Medicines & ORS*
  - 🚌 *Emergency Travel & Bus Fare*
  - 👔 *School Uniform & Shoe Repair*
- **Disbursing Authority:** Recorded under the supervising Residential Mentor or Class In-Charge.
- **Live Balances:** Real-time computation of individual student balances with automated receipt generation.

---

### 5. Medical, Clinic Escort & Health Protocols
Because the school is located in Bachani village with no full-fledged on-campus hospital:
- **Escort Workflow:** When a boarder falls ill (fever, sprain, stomach infection), an assigned mentor or teacher escorts the student to **Dr. M. K. Kulkarni Clinic (Bachani)** or **Kagal Civil Hospital**.
- **Incident Profiling:** Records diagnosis, temperature, attending physician, medical expenses, and prescribed medicines.
- **Hostel Custody Administration:** Prescribed medications are kept in the mentor's custody and administered per schedule.
- **Automated Parent Notification:** Real-time SMS and portal notification dispatched to the student's guardian.

---

### 6. Hostel Room Inventory & Boarder Allocation
- **15 Rooms Inventory:** Rooms 201 to 215 in the Boys Hostel Wing.
- **Fixed Occupancy:** Exactly 4 boys per room (60 boys total).
- **Room Profiles:** Lists bed numbers, emergency contacts, ward mentors, and room cleanliness audit logs.

---

### 7. Mess & Weekly Nutrition Planning
- **4 Meal Cycles Daily:**
  - *Pratah-Kal Nashta* (07:00 AM – 08:00 AM): Poha, Upma, Idli, Boiled Eggs/Sprouts, Cow Milk.
  - *Madhyanha Bhojan* (12:30 PM – 01:30 PM): Chapati, Rice, Dal Tadka, Seasonal Sabzi, Salad, Buttermilk.
  - *Sayam Alpa-Ahar* (05:00 PM – 05:40 PM): Herbal Kadha, Poha/Chivda, Seasonal Fruit.
  - *Ratri Bhojan* (08:00 PM – 09:00 PM): Bhakri/Roti, Dal Khichdi, Sabzi, Curd.
- **Special Dietary Flags:** Tracks Ekadashi fasting requirements and soft khichdi diets for sickbay students.

---

### 8. Academic Timetable & Conflict-Free Scheduling
- Full weekly schedules for **Classes 5 to 10 (Divisions A)** across 6 days (Monday to Saturday).
- Automated conflict validation: ensures no teacher is scheduled in two classrooms in the same period.
- Dedicated slots for morning yoga, sports, self-study (*Swadhyaya*), and night reading.

---

### 9. Exams, Continuous Evaluation & Report Cards
- Support for Unit Tests (20 Marks), Mid-Terms (50 Marks), and Annual Board Examinations (100 Marks).
- Automated GPA, percentage, and rank calculation.
- Printable report cards featuring Gurukul grading remarks.

---

### 10. Fee Collection & Itemized Official Receipts
- **Fixed Annual Structure:**
  - **Day Scholars (Girls):** ₹10,000 / year (Tuition & Exams).
  - **Residential Boarders (Boys):** ₹50,000 / year (Covers Tuition, Hostel Room, 3 Meals + Snacks, Exams, Library & Sports).
- **Itemized Receipts:** Official receipts detailing fee coverage breakdown and authorized seal.

---

### 11. Parent Portal & Guardian Synchronization
Parents log in using their registered mobile number or ward roll number to inspect:
- Ward's academic progress & unit test marks.
- Live pocket money ledger with remaining balance.
- Medical incident records & doctor prescriptions.
- Night roll-call status and hostel leave pass history.

---

### 12. Tri-Lingual Localization (English, Marathi, Hindi)
A dedicated `LanguageContext` allows dynamic language toggling with persistent locale memory:
- **English:** Default administrative format.
- **Marathi (मराठी):** Native state language for teachers, parents, and local staff.
- **Hindi (हिंदी):** Traditional national Gurukul language.

---

## 📊 Institutional Data Specifications (Seed Roster)

| Parameter | Metric | Details |
| :--- | :--- | :--- |
| **Total Student Enrollment** | **120 Students** | Classes 5, 6, 7, 8, 9, and 10 |
| **Gender Breakdown** | **60 Boys • 60 Girls** | Exactly 10 boys and 10 girls per class |
| **Residential Status** | **60 Residential • 60 Day** | All 60 boys are Residential; all 60 girls are Day Scholars |
| **Hostel Infrastructure** | **15 Rooms (Rooms 201–215)** | 4 boys per room; 100% occupancy |
| **Teaching Faculty** | **11 Active Teachers** | Covering Mathematics, Science, English, Marathi, Hindi, etc. |
| **Residential Mentors** | **4 Male Mentors** | Dedicated wing supervision (Wings A, B, C, D) |
| **Campus Support Staff** | **2 Peons** | Mr. Dnyaneshwar More & Mr. Babanrao Gaikwad |

---

## 🔌 RESTful API Endpoint Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user (returns JWT token and profile payload) |
| `GET` | `/api/auth/me` | Retrieve currently authenticated user profile |
| `POST` | `/api/auth/logout` | Discard authentication session |

### Dashboard & Analytics (`/api/dashboard`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Retrieve complete KPI metrics, demographics, and hostel occupancy |

### Attendance (`/api/attendance`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/attendance` | Fetch attendance records by date, class, section, and period |
| `POST` | `/api/attendance` | Save or update lecture attendance records |
| `GET` | `/api/attendance/monthly`| Generate comprehensive monthly attendance reports |

### Mentor & Hostel Roll-Call (`/api/mentor`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/mentor` | Retrieve 4 residential mentors and wing assignments |
| `POST` | `/api/mentor/rollcall` | Save 60-boy night roll-call roster |
| `GET` | `/api/mentor/report` | Fetch monthly hostel attendance audit report |

### Student Pocket Money (`/api/expenses`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/expenses` | Fetch transaction ledger and student balances |
| `POST` | `/api/expenses` | Disburse pocket money or log parent deposit |

### Medical & Sickbay (`/api/medical`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/medical` | Fetch health incidents and clinic consultation history |
| `POST` | `/api/medical` | Log medical incident, clinic escort, and prescription |

---

## 🗄️ Database Schema & Data Model

```
+-------------------------------------------------------------+
|                           Students                          |
|  id (PK) • rollNo • name • class • section • type (res/day) |
|  gender • hostelRoom • parentName • parentPhone • balance   |
+-------------------------------------------------------------+
                             │ 1
                             ▼ N
+-------------------------------------------------------------+
|                           Expenses                          |
|  id (PK) • studentId (FK) • date • txnType (Deposit/Debit)  |
|  category • amount • description • incharge • balanceAfter  |
+-------------------------------------------------------------+
                             │ 1
                             ▼ N
+-------------------------------------------------------------+
|                           Medical                           |
|  id (PK) • studentId (FK) • date • symptoms • doctorName    |
|  escortStaff • medicineGiven • medicineIncharge • status    |
+-------------------------------------------------------------+
```

---

## 💻 Installation & Deployment Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: v6.0 or higher (Optional — built-in in-memory fallback included)

### Step 1: Clone the Repository
```bash
git clone https://github.com/prathmesh4001/residential-school-system-or-shanti-gurukul.git
cd "Residential School System"
```

### Step 2: Configure Environment Variables
Copy the example environment file in `backend`:
```bash
cp backend/.env.example backend/.env
```

Default `backend/.env` contents:
```env
PORT=5001
JWT_SECRET=shanti-gurukul-secret-key-2024
CLIENT_URL=http://localhost:5173
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/shanti_gurukul
```

### Step 3: Start Backend API Server
```bash
cd backend
npm install
npm run start
```
*Backend API server will run at `http://localhost:5001`.*

### Step 4: Start Frontend Client
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend application will run at `http://localhost:5173`.*

---

## 🔑 Default Login Credentials

| Role | Username / Email | Password | Assigned Persona / Access |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin` | `admin123` | Full ERP configuration & user administration |
| **Principal** | `principal` | `admin123` | Dr. Ramesh Pawar (Executive Academic Overview) |
| **Subject Teacher** | `teacher1` | `teacher123` | Mr. Ramesh Gupta (Mathematics • Class Teacher 10-A) |
| **Residential Mentor** | `mentor@gmail.com` | `mentor@123` | Mr. Sanjay Bhosale (Residential Mentor — Wing A) |
| **Mentor 2** | `mentor2@gmail.com` | `mentor@123` | Mr. Ramesh Shinde (Residential Mentor — Wing B) |
| **Mentor 3** | `mentor3@gmail.com` | `mentor@123` | Mr. Suresh Jadhav (Residential Mentor — Wing C) |
| **Mentor 4** | `mentor4@gmail.com` | `mentor@123` | Mr. Deepak Kadam (Residential Mentor — Wing D) |
| **Parent / Guardian**| `parent1` | `parent123` | Mr. Rajesh Sharma (Guardian of Aarav Sharma, 10-A) |

*(Clicking any role button on the login screen automatically fills in test credentials).*

---

## 🎓 Project Report Reference & Academic Highlights

When compiling your **Academic Project Report / Final Year Thesis**, this repository provides ready-made source material:

1. **Novelty & USP:** Discuss how this system specifically solves the **24/7 custodial challenge** of boarding schools, contrasting it against commercial day-school products (like Google Classroom or standard ERPs).
2. **Security & Data Integrity:** Detail the stateless **JWT authentication**, HTTP-only practices, sanitized request payloads, and granular role authorization tables.
3. **Engineering Rigor:** Highlight the **fail-safe dual storage architecture** (MongoDB Mongoose driver with automatic failover to the structured in-memory data store).
4. **UI/UX Case Study:** Elaborate on the **Gurukul glassmorphism design language**, low-contrast eye comfort for night roll-call operations, and high-DPI printable official reports.
5. **Localization:** Document the implementation of tri-lingual dictionary keys and dynamic locale switching without page refreshes.

---

*Designed and Developed with dedication for Shanti Gurukul, Bachani.*  
*ज्ञानं परमं बलम् • Knowledge is the Supreme Strength.*
