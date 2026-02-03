# MyImpact - University Admin Dashboard PRD

## Overview
**Project**: MyImpact — University Admin Dashboard (v0)
**Goal**: Build a mobile-first but desktop-optimized University Admin Dashboard that makes student service-hour participation visible, verifiable, and exportable for semester reporting.

## Primary User
**Persona**: University administrator / program manager
**Jobs-to-be-done**:
- See a term snapshot (verified hours, active students, active programs, retention)
- Review a queue of pending verification requests
- Confirm / reject / flag requests with reasons and an audit trail
- Export audit-ready records for reporting/compliance

## Core Requirements (Static)

### Dashboard Layout
- Left fixed sidebar navigation (deep teal #1D4648)
- Top bar (search + icons + avatar + term selector)
- Main header with university name (tenant-configurable)
- KPI row (4 stat cards)
- Two side-by-side panels: Programs list + Verification Requests queue

### Verification Workflow
- One-click "Confirm participation" updates status and KPIs instantly
- Reject requires reason selection (not_eligible, insufficient_evidence, suspicious, duplicate)
- Flag for Review requires custom reason
- All actions create immutable AuditEvent

### Term-based Filtering
- Dashboard scoped to one "Term" (Fall 2025, Spring 2026, Summer 2026)
- KPIs, programs, and verification requests filtered by active term
- Term selection persists in localStorage

### Exports (CSV)
- Verified logs by term
- Verification audit trail by term
- All exports log AuditEvent

## What's Been Implemented (Feb 3, 2026)

### Backend (FastAPI)
- ✅ Health check endpoint
- ✅ Terms CRUD (`/api/terms`)
- ✅ Programs filtered by term (`/api/programs`)
- ✅ Students (`/api/students`)
- ✅ Service Logs (`/api/service-logs`)
- ✅ Verification Requests with enriched data (`/api/verification-requests`)
- ✅ KPIs calculated by term (`/api/kpis`)
- ✅ Confirm/Reject/Flag workflows with AuditEvent
- ✅ Settings management (`/api/settings`)
- ✅ CSV Exports (`/api/export/verified-logs`, `/api/export/audit-trail`)

### Frontend (React + Tailwind)
- ✅ Sidebar navigation
- ✅ Topbar with search, term selector, notifications
- ✅ Dashboard with KPI cards (pixel-faithful to mock)
- ✅ Programs panel with icons
- ✅ Verification Requests panel with confirm/reject/flag
- ✅ Reports page with export buttons
- ✅ Admin page for university name configuration
- ✅ Activities page (placeholder)
- ✅ Participants page (placeholder)

### Data Layer
- ✅ In-memory data store (abstracted for future MongoDB swap)
- ✅ Seeded 3 terms: Fall 2025, Spring 2026, Summer 2026
- ✅ Seeded programs, students, service logs, verification requests

### Auth Scaffolding (TODO)
- ✅ Mock admin auto-logged in
- ✅ UserRole enum and route guard scaffolding
- ⏳ JWT authentication (future)
- ⏳ Login/logout endpoints (future)

## Prioritized Backlog

### P0 - Done
- [x] Dashboard UI matching mock
- [x] Verification workflow (confirm/reject/flag)
- [x] Term filtering
- [x] CSV exports with audit logging
- [x] University name configuration

### P1 - Next Sprint
- [ ] Activities page - full activity management
- [ ] Participants page - student roster with service history
- [ ] Real-time search functionality
- [ ] Notification system

### P2 - Future
- [ ] JWT authentication with login page
- [ ] Role-based access control (NGO partners, students)
- [ ] PDF export option
- [ ] Email notifications for verification status
- [ ] Dashboard analytics/charts
- [ ] MongoDB integration

## Technical Architecture

```
/app
├── backend/
│   ├── server.py          # FastAPI app with all endpoints
│   ├── requirements.txt   # Python dependencies
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main app with routing/state
│   │   ├── components/
│   │   │   ├── Sidebar.js
│   │   │   ├── Topbar.js
│   │   │   ├── Dashboard.js
│   │   │   ├── KPICard.js
│   │   │   ├── ProgramsPanel.js
│   │   │   ├── VerificationPanel.js
│   │   │   ├── ReportsPage.js
│   │   │   ├── AdminPage.js
│   │   │   └── styles.css
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
└── memory/
    └── PRD.md
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/terms` | GET | List all terms |
| `/api/programs` | GET | List programs (filter by term_id) |
| `/api/students` | GET | List all students |
| `/api/service-logs` | GET | List service logs |
| `/api/verification-requests` | GET | List verification requests |
| `/api/kpis` | GET | Get KPIs for term |
| `/api/verification-requests/confirm` | POST | Confirm a request |
| `/api/verification-requests/reject` | POST | Reject with reason |
| `/api/verification-requests/flag` | POST | Flag for review |
| `/api/settings` | GET/PUT | Tenant settings |
| `/api/export/verified-logs` | GET | Export CSV |
| `/api/export/audit-trail` | GET | Export audit CSV |

## Design Tokens
- Deep teal (sidebar): #1D4648
- Primary teal (buttons): #3B7073
- KPI green: #628C84
- KPI blue: #D8E7F3
- KPI cream: #FBF6EE
- App background: #F7F8FA
- Text primary: #111827
- Text secondary: #6B7280
