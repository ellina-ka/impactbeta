from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from enum import Enum
import uuid
import csv
import io
import random
import os

app = FastAPI(title="MyImpact API", version="1.0.0")

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
    university_name: str = os.getenv("UNIVERSITY_NAME", "Columbia University")
    dashboard_title: str = os.getenv("DASHBOARD_TITLE", "Test Pilot Dashboard")

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
            Program(program_id="csc-001", name="Columbia Service Corps", type=ProgramType.campus, term_id="spring-2026", active_students_count=0, icon="heart"),
            Program(program_id="gi-002", name="Green Initiative", type=ProgramType.campus, term_id="spring-2026", active_students_count=0, icon="leaf"),
            Program(program_id="hno-003", name="Hope NYC Outreach", type=ProgramType.ngo_partner, term_id="spring-2026", active_students_count=0, icon="users"),
            # Fall 2025 programs
            Program(program_id="csc-fall", name="Columbia Service Corps", type=ProgramType.campus, term_id="fall-2025", active_students_count=0, icon="heart"),
            Program(program_id="gi-fall", name="Green Initiative", type=ProgramType.campus, term_id="fall-2025", active_students_count=0, icon="leaf"),
            # Summer 2026 programs
            Program(program_id="summer-prog", name="Summer Volunteer Program", type=ProgramType.campus, term_id="summer-2026", active_students_count=0, icon="sun"),
        ]
        for p in programs_data:
            self.programs[p.program_id] = p
        
        # Seed 25 realistic students
        first_names = ["Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "William",
                       "Mia", "James", "Charlotte", "Benjamin", "Amelia", "Lucas", "Harper", "Henry", "Evelyn", "Alexander",
                       "Lily", "Tai", "Sacha", "Maria", "Marcus"]
        last_names = ["Johnson", "Chen", "Williams", "Garcia", "Brown", "Martinez", "Davis", "Rodriguez", "Wilson", "Anderson",
                      "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris", "Robinson",
                      "Robbins", "Lewiner", "Park", "Kim", "Patel"]
        
        spring_programs = ["csc-001", "gi-002", "hno-003"]
        
        students_data = []
        for i in range(25):
            first = first_names[i]
            last = last_names[i]
            # Assign 1-2 programs to each student
            num_programs = random.randint(1, 2)
            assigned_programs = random.sample(spring_programs, num_programs)
            
            student = Student(
                student_id=f"std-{i+1:03d}",
                name=f"{first} {last}",
                email=f"{first.lower()}.{last.lower()}@columbia.edu",
                program_ids=assigned_programs,
                avatar=f"{first[0]}{last[0]}"
            )
            students_data.append(student)
        
        for s in students_data:
            self.students[s.student_id] = s
            # Update program active student counts
            for pid in s.program_ids:
                if pid in self.programs:
                    self.programs[pid].active_students_count += 1
        
        # Activity descriptions for realistic logs
        activities = {
            "csc-001": [
                ("Food bank volunteering at Community Kitchen", "Harlem Grown - Community Urban Farming"),
                ("Elderly care visit at Senior Center", "NYC Elder Care Network"),
                ("Youth mentoring session", "Columbia Youth Mentorship Program"),
                ("Community garden maintenance", "Harlem Grown - Urban Farm"),
                ("Soup kitchen service", "Holy Apostles Soup Kitchen"),
                ("Tutoring at local school", "PS 125 After-School Program"),
            ],
            "gi-002": [
                ("Tree planting at Central Park", "Central Park Conservancy"),
                ("Beach cleanup at Coney Island", "NYC Parks - Clean Shores"),
                ("Recycling education workshop", "GrowNYC"),
                ("Campus sustainability audit", "Columbia Sustainability Office"),
                ("River cleanup at Hudson", "Riverkeeper NYC"),
                ("Urban garden planting", "Brooklyn Botanic Garden"),
            ],
            "hno-003": [
                ("Homeless shelter meal service", "Bowery Mission"),
                ("After-school tutoring", "Chess Volunteers - Academic Support"),
                ("Clothing drive sorting", "Housing Works"),
                ("Job skills workshop facilitation", "Goodwill NYC"),
                ("Health fair volunteering", "NYC Health + Hospitals"),
                ("ESL class assistance", "Literacy Partners"),
            ]
        }
        
        now = datetime.now(timezone.utc)
        logs_data = []
        vr_data = []
        log_counter = 1
        vr_counter = 1
        
        # Generate 1-3 logs per student with varied statuses
        for student in students_data:
            num_logs = random.randint(1, 3)
            for _ in range(num_logs):
                program_id = random.choice(student.program_ids)
                activity = random.choice(activities.get(program_id, activities["csc-001"]))
                
                # Randomize date within Spring 2026
                days_ago = random.randint(1, 90)
                log_date = (now - timedelta(days=days_ago)).strftime("%Y-%m-%d")
                
                # Randomize hours (1-6 hours)
                hours = round(random.uniform(1.5, 6.0), 1)
                
                # Randomize status: 40% confirmed, 35% pending, 15% flagged, 10% rejected
                status_roll = random.random()
                if status_roll < 0.40:
                    status = LogStatus.confirmed
                    evidence = EvidenceTier.org_confirmed
                elif status_roll < 0.75:
                    status = LogStatus.pending
                    evidence = EvidenceTier.self_reported
                elif status_roll < 0.90:
                    status = LogStatus.flagged
                    evidence = EvidenceTier.self_reported
                else:
                    status = LogStatus.rejected
                    evidence = EvidenceTier.self_reported
                
                log = ServiceLog(
                    log_id=f"log-{log_counter:03d}",
                    student_id=student.student_id,
                    program_id=program_id,
                    date=log_date,
                    hours=hours,
                    description=activity[0],
                    evidence_tier=evidence,
                    status=status,
                    created_at=(now - timedelta(days=days_ago, hours=random.randint(1, 12))).isoformat(),
                    updated_at=now.isoformat()
                )
                logs_data.append(log)
                
                # Create verification request for pending logs
                if status == LogStatus.pending:
                    vr = VerificationRequest(
                        request_id=f"vr-{vr_counter:03d}",
                        log_id=log.log_id,
                        student_id=student.student_id,
                        program_id=program_id,
                        status=VerificationStatus.awaiting_confirmation,
                        ngo_name=activity[1],
                        action_description=f"{hours} hours - {activity[0][:30]}..."
                    )
                    vr_data.append(vr)
                    vr_counter += 1
                
                log_counter += 1
        
        for l in logs_data:
            self.service_logs[l.log_id] = l
        
        for vr in vr_data:
            self.verification_requests[vr.request_id] = vr

# Global data store instance
db = DataStore()

# ============== AUTH SCAFFOLDING (TODO) ==============
class UserRole(str, Enum):
    university_admin = "university_admin"
    ngo_partner = "ngo_partner"
    student = "student"

def get_current_user():
    """TODO: Replace with real auth. Returns mock admin user."""
    return {
        "user_id": "admin-001",
        "name": "Ellina Khrais-Azibi",
        "role": UserRole.university_admin,
        "email": "ellina@columbia.edu"
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
    return {"status": "healthy", "version": "1.0.0"}

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

@app.get("/api/programs/{program_id}")
def get_program(program_id: str):
    if program_id not in db.programs:
        raise HTTPException(status_code=404, detail="Program not found")
    
    program = db.programs[program_id]
    
    # Calculate stats from logs
    program_logs = [l for l in db.service_logs.values() if l.program_id == program_id]
    total_hours = sum(l.hours for l in program_logs)
    verified_hours = sum(l.hours for l in program_logs if l.status == LogStatus.confirmed)
    pending_requests = len([vr for vr in db.verification_requests.values() 
                           if vr.program_id == program_id and vr.status == VerificationStatus.awaiting_confirmation])
    
    # Get students in this program
    students_in_program = [s for s in db.students.values() if program_id in s.program_ids]
    
    return {
        **program.model_dump(),
        "total_hours": round(total_hours, 1),
        "verified_hours": round(verified_hours, 1),
        "percent_verified": round((verified_hours / total_hours * 100) if total_hours > 0 else 0, 1),
        "pending_requests": pending_requests,
        "student_count": len(students_in_program),
        "students": [{"student_id": s.student_id, "name": s.name, "avatar": s.avatar} for s in students_in_program[:10]]
    }

# Students
@app.get("/api/students")
def get_students(term_id: Optional[str] = None):
    students = list(db.students.values())
    
    # Enrich with stats
    enriched = []
    for student in students:
        # Filter by term if specified
        if term_id:
            term_program_ids = [p.program_id for p in db.programs.values() if p.term_id == term_id]
            student_logs = [l for l in db.service_logs.values() 
                          if l.student_id == student.student_id and l.program_id in term_program_ids]
        else:
            student_logs = [l for l in db.service_logs.values() if l.student_id == student.student_id]
        
        total_hours = sum(l.hours for l in student_logs)
        verified_hours = sum(l.hours for l in student_logs if l.status == LogStatus.confirmed)
        pending_hours = sum(l.hours for l in student_logs if l.status == LogStatus.pending)
        
        # Get program names
        program_names = [db.programs[pid].name for pid in student.program_ids if pid in db.programs]
        
        # Determine status (on track if >= 10 verified hours for the term)
        required_hours = 20  # Semester requirement
        progress = (verified_hours / required_hours * 100) if required_hours > 0 else 0
        if progress >= 50:
            status = "on_track"
        elif progress >= 25:
            status = "needs_attention"
        else:
            status = "at_risk"
        
        enriched.append({
            **student.model_dump(),
            "total_hours": round(total_hours, 1),
            "verified_hours": round(verified_hours, 1),
            "pending_hours": round(pending_hours, 1),
            "percent_verified": round((verified_hours / total_hours * 100) if total_hours > 0 else 0, 1),
            "program_names": program_names,
            "status": status,
            "progress": round(progress, 1)
        })
    
    return enriched

@app.get("/api/students/{student_id}")
def get_student(student_id: str):
    if student_id not in db.students:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student = db.students[student_id]
    student_logs = [l for l in db.service_logs.values() if l.student_id == student_id]
    
    # Enrich logs with program names
    enriched_logs = []
    for log in sorted(student_logs, key=lambda x: x.date, reverse=True):
        program = db.programs.get(log.program_id)
        enriched_logs.append({
            **log.model_dump(),
            "program_name": program.name if program else "Unknown"
        })
    
    total_hours = sum(l.hours for l in student_logs)
    verified_hours = sum(l.hours for l in student_logs if l.status == LogStatus.confirmed)
    program_names = [db.programs[pid].name for pid in student.program_ids if pid in db.programs]
    
    # Get audit events for this student's logs
    log_ids = [l.log_id for l in student_logs]
    vr_ids = [vr.request_id for vr in db.verification_requests.values() if vr.student_id == student_id]
    relevant_audits = [e for e in db.audit_events if e.entity_id in vr_ids]
    
    return {
        **student.model_dump(),
        "total_hours": round(total_hours, 1),
        "verified_hours": round(verified_hours, 1),
        "percent_verified": round((verified_hours / total_hours * 100) if total_hours > 0 else 0, 1),
        "program_names": program_names,
        "logs": enriched_logs,
        "audit_history": relevant_audits[-10:]  # Last 10 events
    }

# Service Logs
@app.get("/api/service-logs")
def get_service_logs(term_id: Optional[str] = None, status: Optional[LogStatus] = None, student_id: Optional[str] = None):
    logs = list(db.service_logs.values())
    if term_id:
        term_program_ids = [p.program_id for p in db.programs.values() if p.term_id == term_id]
        logs = [l for l in logs if l.program_id in term_program_ids]
    if status:
        logs = [l for l in logs if l.status == status]
    if student_id:
        logs = [l for l in logs if l.student_id == student_id]
    
    # Enrich with student and program data
    enriched = []
    for log in logs:
        student = db.students.get(log.student_id)
        program = db.programs.get(log.program_id)
        enriched.append({
            **log.model_dump(),
            "student_name": student.name if student else "Unknown",
            "student_email": student.email if student else "",
            "program_name": program.name if program else "Unknown"
        })
    
    return enriched

# Verification Requests
@app.get("/api/verification-requests")
def get_verification_requests(term_id: Optional[str] = None, status: Optional[VerificationStatus] = None):
    requests = list(db.verification_requests.values())
    if term_id:
        term_program_ids = [p.program_id for p in db.programs.values() if p.term_id == term_id]
        requests = [r for r in requests if r.program_id in term_program_ids]
    if status:
        requests = [r for r in requests if r.status == status]
    
    # Enrich with student and log data
    enriched = []
    for req in requests:
        student = db.students.get(req.student_id)
        program = db.programs.get(req.program_id)
        log = db.service_logs.get(req.log_id)
        enriched.append({
            **req.model_dump(),
            "student_name": student.name if student else "Unknown",
            "student_email": student.email if student else "",
            "student_avatar": student.avatar if student else "?",
            "program_name": program.name if program else "Unknown",
            "hours": log.hours if log else 0,
            "log_date": log.date if log else "",
            "evidence_tier": log.evidence_tier.value if log else "self_reported",
            "description": log.description if log else ""
        })
    
    return enriched

# KPIs - Now fully derived from data
@app.get("/api/kpis")
def get_kpis(term_id: str = "spring-2026"):
    # Get programs for this term
    term_programs = [p for p in db.programs.values() if p.term_id == term_id]
    term_program_ids = [p.program_id for p in term_programs]
    
    # Get all logs for this term
    term_logs = [l for l in db.service_logs.values() if l.program_id in term_program_ids]
    
    # Calculate verified hours
    confirmed_logs = [l for l in term_logs if l.status == LogStatus.confirmed]
    verified_hours = sum(l.hours for l in confirmed_logs)
    
    # Get unique students with any logs in this term
    all_student_ids = set(l.student_id for l in term_logs)
    active_students = len(all_student_ids)
    
    # Active programs count
    active_programs = len(term_programs)
    
    # Calculate retention rate (students with verified hours / total students)
    students_with_verified = set(l.student_id for l in confirmed_logs)
    retention_rate = round((len(students_with_verified) / active_students * 100) if active_students > 0 else 0)
    
    # Calculate deltas (comparing to baseline or previous term)
    if term_id == "spring-2026":
        # Compare to fall-2025
        fall_programs = [p.program_id for p in db.programs.values() if p.term_id == "fall-2025"]
        fall_logs = [l for l in db.service_logs.values() if l.program_id in fall_programs and l.status == LogStatus.confirmed]
        fall_hours = sum(l.hours for l in fall_logs)
        hours_delta = f"+{round((verified_hours - fall_hours) / fall_hours * 100) if fall_hours > 0 else 0}% vs last semester"
        students_delta = f"+{active_students} active this term"
        programs_delta = f"{active_programs} programs running"
        retention_delta = f"{retention_rate}% completion rate"
    else:
        hours_delta = "Current term"
        students_delta = f"{active_students} active"
        programs_delta = f"{active_programs} programs"
        retention_delta = f"{retention_rate}% rate"
    
    return {
        "verified_hours": {"value": round(verified_hours, 1), "delta": hours_delta},
        "active_students": {"value": active_students, "delta": students_delta},
        "active_programs": {"value": active_programs, "delta": programs_delta},
        "retention_rate": {"value": retention_rate, "delta": retention_delta}
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
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Update service log
    log.status = LogStatus.confirmed
    log.evidence_tier = EvidenceTier.org_confirmed
    log.updated_at = now
    db.service_logs[log.log_id] = log
    
    # Update verification request
    vr.status = VerificationStatus.confirmed
    db.verification_requests[vr.request_id] = vr
    
    # Create audit event
    student = db.students.get(vr.student_id)
    audit = AuditEvent(
        event_id=str(uuid.uuid4()),
        actor_id=user["user_id"],
        actor_role=ActorRole.university_admin,
        entity_type=EntityType.verification_request,
        entity_id=vr.request_id,
        action=AuditAction.confirm,
        timestamp=now,
        notes=f"Confirmed by {user['name']}. Student: {student.name if student else 'Unknown'}. Hours: {log.hours}"
    )
    db.audit_events.append(audit)
    
    return {"success": True, "message": "Verification confirmed", "hours_added": log.hours, "audit_event_id": audit.event_id}

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
    student = db.students.get(vr.student_id)
    audit = AuditEvent(
        event_id=str(uuid.uuid4()),
        actor_id=user["user_id"],
        actor_role=ActorRole.university_admin,
        entity_type=EntityType.verification_request,
        entity_id=vr.request_id,
        action=AuditAction.reject,
        timestamp=now,
        notes=f"Rejected by {user['name']}. Reason: {request.reason.value}. Student: {student.name if student else 'Unknown'}"
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
    
    # Keep request but mark as flagged (doesn't disappear, but status changes)
    vr.status = VerificationStatus.rejected  # Using rejected to remove from queue
    db.verification_requests[vr.request_id] = vr
    
    # Create audit event
    student = db.students.get(vr.student_id)
    audit = AuditEvent(
        event_id=str(uuid.uuid4()),
        actor_id=user["user_id"],
        actor_role=ActorRole.university_admin,
        entity_type=EntityType.verification_request,
        entity_id=vr.request_id,
        action=AuditAction.flag,
        timestamp=now,
        notes=f"Flagged by {user['name']}. Reason: {request.reason}. Student: {student.name if student else 'Unknown'}"
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
    
    audit = AuditEvent(
        event_id=str(uuid.uuid4()),
        actor_id=user["user_id"],
        actor_role=ActorRole.university_admin,
        entity_type=EntityType.service_log,
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
    
    term_program_ids = [p.program_id for p in db.programs.values() if p.term_id == term_id]
    logs = [l for l in db.service_logs.values() 
            if l.program_id in term_program_ids and l.status == LogStatus.confirmed]
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Full audit-ready headers
    writer.writerow([
        "student_name", "student_email", "program_name", "term_name",
        "log_date", "hours", "evidence_tier", "status", "description",
        "verifier", "verification_timestamp", "rejection_reason"
    ])
    
    for log in logs:
        student = db.students.get(log.student_id)
        program = db.programs.get(log.program_id)
        
        # Find verification event for this log
        vr = next((v for v in db.verification_requests.values() if v.log_id == log.log_id), None)
        audit = None
        if vr:
            audit = next((e for e in db.audit_events if e.entity_id == vr.request_id and e.action == AuditAction.confirm), None)
        
        writer.writerow([
            student.name if student else "Unknown",
            student.email if student else "",
            program.name if program else "Unknown",
            term.name if term else term_id,
            log.date,
            log.hours,
            log.evidence_tier.value,
            log.status.value,
            log.description,
            audit.actor_id if audit else "system",
            audit.timestamp if audit else log.updated_at,
            ""  # No rejection reason for confirmed logs
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
    
    events = db.audit_events
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "event_id", "actor_id", "actor_role", "entity_type",
        "entity_id", "action", "timestamp", "notes"
    ])
    
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
