# 🏫 Shanti Gurukul — Residential School Management System

A high-fidelity ERP and Student Care Management platform designed specifically for residential boarding schools (Gurukuls). Built for **Shanti Gurukul, Bachani (Tal. Kagal, Dist. Kolhapur)**.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Axios, Lucide Icons, Modern Glassmorphism UI
- **Backend**: Node.js, Express, JWT Authentication, CORS
- **Database**: MongoDB (with in-memory fallback store for offline development)

---

## 📦 Project Structure

```
Residential School System/
├── backend/                  # Node.js + Express API server
│   ├── config/               # Database connection
│   ├── data/                 # In-memory store & seed data
│   ├── middleware/           # Auth & Role-based Access Control
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API endpoints
│   └── index.js              # Server entry point (Port 5001)
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── api/              # Axios client with JWT interceptor
│   │   ├── components/       # Layout, Navigation, Modals
│   │   ├── context/          # Auth & Language (English, Marathi, Hindi)
│   │   ├── pages/            # 16+ ERP & Hostel modules
│   │   └── App.jsx           # App routing
│   └── vite.config.js        # Vite config with API proxy
└── README.md
```

---

## ⚡ Getting Started

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd "Residential School System"
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run start
```
*Backend runs on `http://localhost:5001`.*

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🔑 Default Login Credentials

| Role | Username / Email | Password | Landed View |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | System Administrator Dashboard |
| **Principal** | `principal` | `admin123` | Executive Academic Overview |
| **Teacher** | `teacher1` | `teacher123` | Teacher & Timetable Portal |
| **Residential Mentor** | `mentor@gmail.com` | `mentor@123` | Residential Mentor Command Center |
| **Parent / Guardian** | `parent1` | `parent123` | Parent Student Monitoring Portal |

---

## ✨ Key Modules

1. **Dashboard & KPIs**: Real-time demographics (120 Students: 60 Residential Boys, 60 Day Scholar Girls), 11 Working Faculty, 4 Residential Mentors, 2 Peons, 15 Boys Hostel Rooms.
2. **Attendance Management**: Period-wise lecture attendance, daily whole-school register, and monthly subject attendance reports with printable sheets.
3. **Residential Mentor Management**: Night roll-call for 60 hostel boys across 4 wings (Rooms 201–215), room inspection cards, and official report generation.
4. **Student Pocket Money & Expenses**: Parent deposits, itemized disbursements (stationery, toiletries, medical, haircut) and individual statement ledger.
5. **Medical & Sickbay**: Clinic escort logs (Bachani Clinic & Kagal Civil Hospital) and automated parent notifications.
6. **Hostel & Mess Management**: Room allocations, dietary restrictions, and weekly meal schedule.
