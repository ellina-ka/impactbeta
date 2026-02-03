from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid
import csv
import io

app = FastAPI(title="MyImpact API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== ENUMS ==============
class ProgramType(str, Enum):
    campus = "campus"
    ngo_partner = "ngo_partner"

class EvidenceTier(str, Enum):
    self_reported = "self_reported"
    org_confirmed = "org_confirmed"

class LogStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    rejected = "rejected"
    flagged = "flagged"

class VerificationStatus(str, Enum):
    awaiting_confirmation = "awaiting_confirmation"
    ready_to_confirm = "ready_to_confirm"
    confirmed = "confirmed"
    rejected = "rejected"

class ActorRole(str, Enum):
    university_admin = "university_admin"
    ngo_partner = "ngo_partner"
    system = "system"

class EntityType(str, Enum):
    service_log = "service_log"
    verification_request = "verification_request"
    export = "export"

class AuditAction(str, Enum):
    confirm = "confirm"
    reject = "reject"
    flag = "flag"
    edit = "edit"
    export = "export"

class RejectionReason(str, Enum):
    not_eligible = "not_eligible"
    insufficient_evidence = "insufficient_evidence"
    suspicious = "suspicious"
    duplicate = "duplicate"

# ============== PYDANTIC MODELS ==============
class Term(BaseModel):
    term_id: str
    name: str
    start_date: str
    end_date: str

class Program(BaseModel):
    program_id: str
    name: str
    type: ProgramType
    term_id: str
    active_students_count: int
    icon: str = "users"

class Student(BaseModel):
    student_id: str
    name: str
    email: str
    program_ids: List[str]
    avatar: Optional[str] = None

class ServiceLog(BaseModel):
    log_id: str
    student_id: str
    program_id: str
    date: str
    hours: float
    description: str
    evidence_tier: EvidenceTier
    status: LogStatus
    created_at: str
    updated_at: str

class VerificationRequest(BaseModel):
    request_id: str
    log_id: str
    student_id: str
    program_id: str
    status: VerificationStatus
    assignee_admin_id: Optional[str] = None
    ngo_name: Optional[str] = None
    action_description: Optional[str] = None

class AuditEvent(BaseModel):
    event_id: str
    actor_id: str
    actor_role: ActorRole
    entity_type: EntityType
    entity_id: str
    action: AuditAction
    timestamp: str
    notes: str

class Settings(BaseModel):
    university_name: str = "Columbia University"

# ============== REQUEST/RESPONSE MODELS ==============
class ConfirmRequest(BaseModel):
    request_id: str

class RejectRequest(BaseModel):
    request_id: str
    reason: RejectionReason

class FlagRequest(BaseModel):
    request_id: str
    reason: str

class UpdateSettingsRequest(BaseModel):
    university_name: str

# ============== IN-MEMORY DATA STORE ==============
# TODO: Replace with MongoDB repository pattern
class DataStore:
    def __init__(self):
        self.terms: dict[str, Term] = {}
        self.programs: dict[str, Program] = {}
        self.students: dict[str, Student] = {}
        self.service_logs: dict[str, ServiceLog] = {}
        self.verification_requests: dict[str, VerificationRequest] = {}
        self.audit_events: List[AuditEvent] = []
        self.settings: Settings = Settings()
        self._seed_data()
    
    def _seed_data(self):
        # Seed Terms
        terms_data = [
            Term(term_id="fall-2025", name="Fall 2025", start_date="2025-09-01", end_date="2025-12-15"),
            Term(term_id="spring-2026", name="Spring 2026", start_date="2026-01-15", end_date="2026-05-15"),
            Term(term_id="summer-2026", name="Summer 2026", start_date="2026-06-01", end_date="2026-08-15"),
        ]
        for t in terms_data:
            self.terms[t.term_id] = t
        
        # Seed Programs (for Spring 2026)
        programs_data = [
            Program(program_id="csc-001", name="Columbia Service Corps", type=ProgramType.campus, term_id="spring-2026", active_students_count=420, icon="heart"),
            Program(program_id="gi-002", name="Green Initiative", type=ProgramType.campus, term_id="spring-2026", active_students_count=315, icon="leaf"),
            Program(program_id="hno-003", name="Hope NYC Outreach", type=ProgramType.ngo_partner, term_id="spring-2026", active_students_count=399, icon="hands-helping"),
            # Fall 2025 programs
            Program(program_id="csc-fall", name="Columbia Service Corps", type=ProgramType.campus, term_id="fall-2025", active_students_count=380, icon="heart"),
            Program(program_id="gi-fall", name="Green Initiative", type=ProgramType.campus, term_id="fall-2025", active_students_count=290, icon="leaf"),
            # Summer 2026 programs
            Program(program_id="summer-prog", name="Summer Volunteer Program", type=ProgramType.campus, term_id="summer-2026", active_students_count=150, icon="sun"),
        ]
        for p in programs_data:
            self.programs[p.program_id] = p
        
        # Seed Students
        students_data = [
            Student(student_id="std-001", name="Lily Robbins", email="lily.robbins@columbia.edu", program_ids=["csc-001"], avatar="LR"),
            Student(student_id="std-002", name="Tai Chen", email="tai.chen@columbia.edu", program_ids=["gi-002"], avatar="TC"),
            Student(student_id="std-003", name="Sacha Lewiner", email="sacha.lewiner@columbia.edu", program_ids=["hno-003"], avatar="SL"),
            Student(student_id="std-004", name="Maria Garcia", email="maria.garcia@columbia.edu", program_ids=["csc-001", "gi-002"], avatar="MG"),
            Student(student_id="std-005", name="James Wilson", email="james.wilson@columbia.edu", program_ids=["hno-003"], avatar="JW"),
        ]
        for s in students_data:
            self.students[s.student_id] = s
        
        # Seed Service Logs (mix of confirmed and pending)
        now = datetime.now(timezone.utc).isoformat()
        logs_data = [
            # Confirmed logs for KPI calculation (Spring 2026)
            ServiceLog(log_id="log-001", student_id="std-001", program_id="csc-001", date="2026-02-15", hours=4.0, description="Food bank volunteering", evidence_tier=EvidenceTier.org_confirmed, status=LogStatus.confirmed, created_at=now, updated_at=now),
            ServiceLog(log_id="log-002", student_id="std-002", program_id="gi-002", date="2026-02-20", hours=3.5, description="Tree planting at Central Park", evidence_tier=EvidenceTier.org_confirmed, status=LogStatus.confirmed, created_at=now, updated_at=now),
            ServiceLog(log_id="log-003", student_id="std-003", program_id="hno-003", date="2026-03-01", hours=5.0, description="Homeless shelter support", evidence_tier=EvidenceTier.org_confirmed, status=LogStatus.confirmed, created_at=now, updated_at=now),
            # Pending logs for verification
            ServiceLog(log_id="log-004", student_id="std-001", program_id="csc-001", date="2026-03-10", hours=3.0, description="Community Garden Training Program", evidence_tier=EvidenceTier.self_reported, status=LogStatus.pending, created_at=now, updated_at=now),
            ServiceLog(log_id="log-005", student_id="std-002", program_id="gi-002", date="2026-03-12", hours=2.5, description="Harlem Distribution Center volunteering", evidence_tier=EvidenceTier.self_reported, status=LogStatus.pending, created_at=now, updated_at=now),
            ServiceLog(log_id="log-006", student_id="std-003", program_id="hno-003", date="2026-03-14", hours=4.0, description="After-School Academic Support", evidence_tier=EvidenceTier.self_reported, status=LogStatus.pending, created_at=now, updated_at=now),
            # Fall 2025 logs
            ServiceLog(log_id="log-007", student_id="std-001", program_id="csc-fall", date="2025-10-15", hours=6.0, description="Fall community event", evidence_tier=EvidenceTier.org_confirmed, status=LogStatus.confirmed, created_at=now, updated_at=now),
        ]
        for l in logs_data:
            self.service_logs[l.log_id] = l
        
        # Seed Verification Requests (for pending logs)
        vr_data = [
            VerificationRequest(request_id="vr-001", log_id="log-004", student_id="std-001", program_id="csc-001", status=VerificationStatus.awaiting_confirmation, ngo_name="Harlem Grown - Community Urban Farming Program", action_description="M-S Sustainable Harvesting"),
            VerificationRequest(request_id="vr-002", log_id="log-005", student_id="std-002", program_id="gi-002", status=VerificationStatus.awaiting_confirmation, ngo_name="The Food Bank for New York City - Harlem Distribution Center", action_description="W-S Mobile Pantry"),
            VerificationRequest(request_id="vr-003", log_id="log-006", student_id="std-003", program_id="hno-003", status=VerificationStatus.awaiting_confirmation, ngo_name="Chess Volunteers - After-School Academic Support", action_description="Tutoring assistance"),
        ]
        for vr in vr_data:
            self.verification_requests[vr.request_id] = vr

# Global data store instance
db = DataStore()

# ============== AUTH SCAFFOLDING (TODO) ==============
# TODO: Implement real authentication
# - JWT tokens
# - Login/logout endpoints
# - Password hashing
# - Session management

class UserRole(str, Enum):
    """User roles for authorization"""
    university_admin = "university_admin"
    ngo_partner = "ngo_partner"
    student = "student"

def get_current_user():
    """TODO: Replace with real auth. Returns mock admin user."""
    return {
        "user_id": "admin-001",
        "name": "Admin User",
        "role": UserRole.university_admin,
        "email": "admin@columbia.edu"
    }

def require_role(allowed_roles: List[UserRole]):
    """TODO: Implement as dependency for route guards"""
    user = get_current_user()
    if user["role"] not in allowed_roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return user

# ============== API ENDPOINTS ==============

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "version": "0.1.0"}

# Terms
@app.get("/api/terms")
def get_terms():
    return list(db.terms.values())

@app.get("/api/terms/{term_id}")
def get_term(term_id: str):
    if term_id not in db.terms:
        raise HTTPException(status_code=404, detail="Term not found")
    return db.terms[term_id]

# Programs
@app.get("/api/programs")
def get_programs(term_id: Optional[str] = None):
    programs = list(db.programs.values())
    if term_id:
        programs = [p for p in programs if p.term_id == term_id]
    return programs

# Students
@app.get("/api/students")
def get_students():
    return list(db.students.values())

@app.get("/api/students/{student_id}")
def get_student(student_id: str):
    if student_id not in db.students:
        raise HTTPException(status_code=404, detail="Student not found")
    return db.students[student_id]

# Service Logs
@app.get("/api/service-logs")
def get_service_logs(term_id: Optional[str] = None, status: Optional[LogStatus] = None):
    logs = list(db.service_logs.values())
    if term_id:
        term_program_ids = [p.program_id for p in db.programs.values() if p.term_id == term_id]
        logs = [l for l in logs if l.program_id in term_program_ids]
    if status:
        logs = [l for l in logs if l.status == status]
    return logs

# Verification Requests
@app.get("/api/verification-requests")
def get_verification_requests(term_id: Optional[str] = None, status: Optional[VerificationStatus] = None):
    requests = list(db.verification_requests.values())
    if term_id:
        term_program_ids = [p.program_id for p in db.programs.values() if p.term_id == term_id]
        requests = [r for r in requests if r.program_id in term_program_ids]
    if status:
        requests = [r for r in requests if r.status == status]
    # Enrich with student data
    enriched = []
    for req in requests:
        student = db.students.get(req.student_id)
        program = db.programs.get(req.program_id)
        enriched.append({
            **req.model_dump(),
            "student_name": student.name if student else "Unknown",
            "student_avatar": student.avatar if student else "?",
            "program_name": program.name if program else "Unknown"
        })
    return enriched

# KPIs
@app.get("/api/kpis")
def get_kpis(term_id: str = "spring-2026"):
    # Get programs for this term
    term_programs = [p for p in db.programs.values() if p.term_id == term_id]
    term_program_ids = [p.program_id for p in term_programs]
    
    # Get confirmed logs for this term
    confirmed_logs = [l for l in db.service_logs.values() 
                      if l.program_id in term_program_ids and l.status == LogStatus.confirmed]
    
    # Calculate KPIs
    verified_hours = sum(l.hours for l in confirmed_logs)
    
    # Get unique students with confirmed hours in this term
    active_student_ids = set(l.student_id for l in confirmed_logs)
    active_students = len(active_student_ids)
    
    # Active programs count
    active_programs = len(term_programs)
    
    # Mock retention rate (would be calculated from historical data)
    retention_rate = 78
    
    # For display, we'll use the mock values from the design for Spring 2026
    # but calculate real values from data
    if term_id == "spring-2026":
        return {
            "verified_hours": {"value": 8420 + int(verified_hours), "delta": "+16% vs last semester"},
            "active_students": {"value": 1134 + active_students, "delta": "+20% vs last semester"},
            "active_programs": {"value": len(term_programs), "delta": "+1 new since Mar 2024"},
            "retention_rate": {"value": 78, "delta": "+5% vs last semester"}
        }
    elif term_id == "fall-2025":
        return {
            "verified_hours": {"value": 7260 + int(verified_hours), "delta": "+12% vs previous"},
            "active_students": {"value": 945 + active_students, "delta": "+15% vs previous"},
            "active_programs": {"value": len(term_programs), "delta": "Baseline term"},
            "retention_rate": {"value": 73, "delta": "Baseline term"}
        }
    else:
        return {
            "verified_hours": {"value": int(verified_hours), "delta": "New term"},
            "active_students": {"value": active_students, "delta": "New term"},
            "active_programs": {"value": len(term_programs), "delta": "New term"},
            "retention_rate": {"value": 0, "delta": "New term"}
        }

# Verification Actions
@app.post("/api/verification-requests/confirm")
def confirm_verification(request: ConfirmRequest):
    user = get_current_user()
    
    if request.request_id not in db.verification_requests:
        raise HTTPException(status_code=404, detail="Verification request not found")
    
    vr = db.verification_requests[request.request_id]
    log = db.service_logs.get(vr.log_id)
    
    if not log:
        raise HTTPException(status_code=404, detail="Associated service log not found")
    
    # Update service log
    now = datetime.now(timezone.utc).isoformat()
    log.status = LogStatus.confirmed
    log.evidence_tier = EvidenceTier.org_confirmed
    log.updated_at = now
    db.service_logs[log.log_id] = log
    
    # Update verification request
    vr.status = VerificationStatus.confirmed
    db.verification_requests[vr.request_id] = vr
    
    # Create audit event
    audit = AuditEvent(
        event_id=str(uuid.uuid4()),
        actor_id=user["user_id"],
        actor_role=ActorRole.university_admin,
        entity_type=EntityType.verification_request,
        entity_id=vr.request_id,
        action=AuditAction.confirm,
        timestamp=now,
        notes=f"Confirmed by admin {user['name']}. Log ID: {log.log_id}, Hours: {log.hours}"
    )
    db.audit_events.append(audit)
    
    return {"success": True, "message": "Verification confirmed", "audit_event_id": audit.event_id}

@app.post("/api/verification-requests/reject")
def reject_verification(request: RejectRequest):
    user = get_current_user()
    
    if request.request_id not in db.verification_requests:
        raise HTTPException(status_code=404, detail="Verification request not found")
    
    vr = db.verification_requests[request.request_id]
    log = db.service_logs.get(vr.log_id)
    
    if not log:
        raise HTTPException(status_code=404, detail="Associated service log not found")
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Update service log
    log.status = LogStatus.rejected
    log.updated_at = now
    db.service_logs[log.log_id] = log
    
    # Update verification request
    vr.status = VerificationStatus.rejected
    db.verification_requests[vr.request_id] = vr
    
    # Create audit event
    audit = AuditEvent(
        event_id=str(uuid.uuid4()),
        actor_id=user["user_id"],
        actor_role=ActorRole.university_admin,
        entity_type=EntityType.verification_request,
        entity_id=vr.request_id,
        action=AuditAction.reject,
        timestamp=now,
        notes=f"Rejected by admin {user['name']}. Reason: {request.reason.value}. Log ID: {log.log_id}"
    )
    db.audit_events.append(audit)
    
    return {"success": True, "message": "Verification rejected", "reason": request.reason.value}

@app.post("/api/verification-requests/flag")
def flag_verification(request: FlagRequest):
    user = get_current_user()
    
    if request.request_id not in db.verification_requests:
        raise HTTPException(status_code=404, detail="Verification request not found")
    
    vr = db.verification_requests[request.request_id]
    log = db.service_logs.get(vr.log_id)
    
    if not log:
        raise HTTPException(status_code=404, detail="Associated service log not found")
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Update service log
    log.status = LogStatus.flagged
    log.updated_at = now
    db.service_logs[log.log_id] = log
    
    # Create audit event
    audit = AuditEvent(
        event_id=str(uuid.uuid4()),
        actor_id=user["user_id"],
        actor_role=ActorRole.university_admin,
        entity_type=EntityType.verification_request,
        entity_id=vr.request_id,
        action=AuditAction.flag,
        timestamp=now,
        notes=f"Flagged by admin {user['name']}. Reason: {request.reason}. Log ID: {log.log_id}"
    )
    db.audit_events.append(audit)
    
    return {"success": True, "message": "Verification flagged for review"}

# Audit Events
@app.get("/api/audit-events")
def get_audit_events(term_id: Optional[str] = None, limit: int = 100):
    events = db.audit_events[-limit:]
    return list(reversed(events))

# Settings
@app.get("/api/settings")
def get_settings():
    return db.settings

@app.put("/api/settings")
def update_settings(request: UpdateSettingsRequest):
    user = get_current_user()
    db.settings.university_name = request.university_name
    
    # Audit the settings change
    audit = AuditEvent(
        event_id=str(uuid.uuid4()),
        actor_id=user["user_id"],
        actor_role=ActorRole.university_admin,
        entity_type=EntityType.service_log,  # reusing for settings
        entity_id="settings",
        action=AuditAction.edit,
        timestamp=datetime.now(timezone.utc).isoformat(),
        notes=f"University name changed to: {request.university_name}"
    )
    db.audit_events.append(audit)
    
    return db.settings

# Export Endpoints
@app.get("/api/export/verified-logs")
def export_verified_logs(term_id: str = "spring-2026"):
    user = get_current_user()
    term = db.terms.get(term_id)
    
    # Get programs for this term
    term_program_ids = [p.program_id for p in db.programs.values() if p.term_id == term_id]
    
    # Get confirmed logs for this term
    logs = [l for l in db.service_logs.values() 
            if l.program_id in term_program_ids and l.status == LogStatus.confirmed]
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "student_name", "student_email", "program_name", "term_name",
        "log_date", "hours", "evidence_tier", "status", "description"
    ])
    
    # Data rows
    for log in logs:
        student = db.students.get(log.student_id)
        program = db.programs.get(log.program_id)
        writer.writerow([
            student.name if student else "Unknown",
            student.email if student else "",
            program.name if program else "Unknown",
            term.name if term else term_id,
            log.date,
            log.hours,
            log.evidence_tier.value,
            log.status.value,
            log.description
        ])
    
    # Create audit event for export
    audit = AuditEvent(
        event_id=str(uuid.uuid4()),
        actor_id=user["user_id"],
        actor_role=ActorRole.university_admin,
        entity_type=EntityType.export,
        entity_id=f"verified-logs-{term_id}",
        action=AuditAction.export,
        timestamp=datetime.now(timezone.utc).isoformat(),
        notes=f"Exported verified logs for {term.name if term else term_id}. {len(logs)} records."
    )
    db.audit_events.append(audit)
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=verified_logs_{term_id}.csv"}
    )

@app.get("/api/export/audit-trail")
def export_audit_trail(term_id: str = "spring-2026"):
    user = get_current_user()
    term = db.terms.get(term_id)
    
    # Get all audit events (in real app, filter by term date range)
    events = db.audit_events
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "event_id", "actor_id", "actor_role", "entity_type",
        "entity_id", "action", "timestamp", "notes"
    ])
    
    # Data rows
    for event in events:
        writer.writerow([
            event.event_id,
            event.actor_id,
            event.actor_role.value,
            event.entity_type.value,
            event.entity_id,
            event.action.value,
            event.timestamp,
            event.notes
        ])
    
    # Create audit event for this export
    audit = AuditEvent(
        event_id=str(uuid.uuid4()),
        actor_id=user["user_id"],
        actor_role=ActorRole.university_admin,
        entity_type=EntityType.export,
        entity_id=f"audit-trail-{term_id}",
        action=AuditAction.export,
        timestamp=datetime.now(timezone.utc).isoformat(),
        notes=f"Exported audit trail for {term.name if term else term_id}. {len(events)} events."
    )
    db.audit_events.append(audit)
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=audit_trail_{term_id}.csv"}
    )
