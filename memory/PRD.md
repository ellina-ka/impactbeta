# MyImpact - University Admin Dashboard PRD

## Overview
**Project**: MyImpact — University Admin Dashboard (v1)
**Goal**: A living admin system that makes student service-hour participation visible, verifiable, and exportable for semester reporting.

## Primary User
**Persona**: University administrator / program manager
**Jobs-to-be-done**:
- See a term snapshot with real, derived KPIs
- Review verification queue and take action
- Track student progress and identify at-risk students
- Export audit-ready records for compliance

## What's Been Implemented (Feb 3, 2026)

### v0 → v1 Sprint Complete

#### 1. Identity & Defaults ✅
- Dashboard title: "Columbia University – Test Pilot Dashboard"
- Default term: Spring 2026
- University name configurable in Admin settings

#### 2. Realistic Seed Data ✅
- **25 students** with names, emails, avatars, program associations
- **3 programs**: Columbia Service Corps, Green Initiative, Hope NYC Outreach
- **50+ service logs** with varied statuses (confirmed, pending, flagged, rejected)
- Data powers all KPIs, verification requests, and exports

#### 3. Verification Workflow ✅
- **10+ pending requests** displayed with:
  - Student avatar + name
  - Program tag
  - Hours logged + date
  - Evidence tier (Self-reported / Org confirmed)
- **Actions**:
  - ✅ Confirm participation → Updates KPIs instantly, shows toast
  - ❌ Reject → Modal with required reason selection
  - 🚩 Flag for Review → Modal with text input
- All actions create AuditEvents

#### 4. Participants Page ✅
- Real table with 25 students
- Columns: Student (avatar + name + email), Program, Total Hours, % Verified, Status
- Status badges: On Track, Needs Attention, At Risk
- **Click student** → Side panel with:
  - Student profile
  - Total/Verified hours
  - Program list
  - Service logs with status per log
  - Verification history

#### 5. Programs Panel ✅
- Shows student count per program
- **Click program** → Modal with:
  - Number of students
  - Total hours logged
  - % verified
  - Pending verification requests
  - Active student list

#### 6. Data-Driven KPIs ✅
- **Verified Hours**: Sum of confirmed log hours
- **Active Students**: Students with logs in term
- **Active Programs**: Programs in selected term
- **Completion Rate**: Students with verified hours / total
- All update instantly on confirm/reject actions

#### 7. Reports & Exports ✅
- **Export Verified Logs CSV**: Full audit-ready columns
- **Export Audit Trail CSV**: All verification events
- Success toast on download
- All exports create AuditEvent

#### 8. Admin Avatars ✅
- Two avatars in top-right
- Tooltips on hover:
  - "Ellina – Program Admin"
  - "Lio – Platform Admin"

### Technical Architecture

```
/app
├── backend/
│   └── server.py          # FastAPI with 15+ endpoints, realistic seed data
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main app with state management
│   │   └── components/
│   │       ├── Dashboard.js
│   │       ├── KPICard.js
│   │       ├── ProgramsPanel.js
│   │       ├── ProgramModal.js
│   │       ├── VerificationPanel.js
│   │       ├── ParticipantsPage.js
│   │       ├── ReportsPage.js
│   │       ├── AdminPage.js
│   │       ├── Topbar.js
│   │       ├── Sidebar.js
│   │       ├── Toast.js
│   │       └── styles.css
│   └── package.json
└── memory/
    └── PRD.md
```

### API Endpoints (All Functional)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/terms` | GET | List terms |
| `/api/programs` | GET | List programs (filter by term) |
| `/api/programs/{id}` | GET | Program details with stats |
| `/api/students` | GET | List students with computed stats |
| `/api/students/{id}` | GET | Student detail with logs |
| `/api/service-logs` | GET | List service logs |
| `/api/verification-requests` | GET | List pending requests |
| `/api/verification-requests/confirm` | POST | Confirm hours |
| `/api/verification-requests/reject` | POST | Reject with reason |
| `/api/verification-requests/flag` | POST | Flag for review |
| `/api/kpis` | GET | KPIs derived from data |
| `/api/settings` | GET/PUT | Tenant settings |
| `/api/export/verified-logs` | GET | CSV export |
| `/api/export/audit-trail` | GET | Audit trail CSV |

## Definition of Done ✅

- ✅ No dead-end pages
- ✅ Every main page shows real data
- ✅ Full workflow: student logs hours → admin verifies → KPI updates → export works
- ✅ Dashboard feels pilot-ready

## Data Notes

⚠️ **IN-MEMORY DATA**: All data is stored in-memory. Server restart resets data.

## Next Sprint (P1)

- [ ] Persist data to MongoDB
- [ ] Real authentication with JWT
- [ ] Notification system
- [ ] Email alerts for at-risk students
- [ ] PDF export option
- [ ] Bulk verification actions
