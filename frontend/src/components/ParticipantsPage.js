import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, AlertTriangle, Clock, CheckCircle, ExternalLink, Calendar } from 'lucide-react';
import './styles.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Term requirements - could come from backend in future
const TERM_REQUIREMENTS = {
  'spring-2026': 20,
  'fall-2025': 20,
  'summer-2026': 10
};

function ParticipantsPage({ selectedTerm, students, loading, onNavigateToActivities }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('risk_score');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const requiredHours = TERM_REQUIREMENTS[selectedTerm] || 20;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'risk_score' ? 'desc' : 'asc');
    }
  };

  const handleStudentClick = async (studentId) => {
    setLoadingDetails(true);
    setSelectedStudent(studentId);
    try {
      const response = await fetch(`${API_URL}/api/students/${studentId}`);
      const data = await response.json();
      setStudentDetails(data);
    } catch (error) {
      console.error('Error fetching student details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDetails = () => {
    setSelectedStudent(null);
    setStudentDetails(null);
  };

  // Enrich students with risk calculation
  const enrichedStudents = students.map(student => {
    const progress = (student.verified_hours / requiredHours) * 100;
    let riskStatus = 'on_track';
    let riskScore = 0;
    
    if (progress >= 75) {
      riskStatus = 'on_track';
      riskScore = 0;
    } else if (progress >= 50) {
      riskStatus = 'on_track';
      riskScore = 1;
    } else if (progress >= 25) {
      riskStatus = 'needs_attention';
      riskScore = 2;
    } else {
      riskStatus = 'at_risk';
      riskScore = 3;
    }
    
    return {
      ...student,
      progress,
      riskStatus,
      riskScore,
      requiredHours
    };
  });

  const filteredStudents = enrichedStudents
    .filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const getRiskBadge = (status) => {
    const badges = {
      on_track: { label: 'On Track', className: 'risk-on-track', icon: CheckCircle },
      needs_attention: { label: 'Needs Attention', className: 'risk-needs-attention', icon: Clock },
      at_risk: { label: 'At Risk', className: 'risk-at-risk', icon: AlertTriangle }
    };
    const badge = badges[status] || badges.at_risk;
    const Icon = badge.icon;
    return (
      <span className={`risk-badge ${badge.className}`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const atRiskCount = enrichedStudents.filter(s => s.riskStatus === 'at_risk').length;
  const needsAttentionCount = enrichedStudents.filter(s => s.riskStatus === 'needs_attention').length;
  const onTrackCount = enrichedStudents.filter(s => s.riskStatus === 'on_track').length;

  const getLastActivityDate = (student) => {
    // This would come from the student data ideally
    // For now we'll show a placeholder or computed value
    return student.last_activity || '—';
  };

  return (
    <div className="page participants-page" data-testid="participants-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Progress & Risk</h1>
          <p className="page-subtitle">
            Track student progress toward {requiredHours}h requirement
          </p>
        </div>
        <div className="header-stats">
          <div className="stat-item risk-stat at-risk">
            <AlertTriangle size={16} />
            <span className="stat-value">{atRiskCount}</span>
            <span className="stat-label">At Risk</span>
          </div>
          <div className="stat-item risk-stat needs-attention">
            <Clock size={16} />
            <span className="stat-value">{needsAttentionCount}</span>
            <span className="stat-label">Needs Attention</span>
          </div>
          <div className="stat-item risk-stat on-track">
            <CheckCircle size={16} />
            <span className="stat-value">{onTrackCount}</span>
            <span className="stat-label">On Track</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="participants-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="participants-search"
          />
        </div>
        <div className="requirement-badge">
          <Clock size={14} />
          <span>Requirement: {requiredHours}h per student</span>
        </div>
      </div>

      {/* Table */}
      <div className="participants-table-container">
        {loading ? (
          <div className="loading-state">Loading participants...</div>
        ) : (
          <table className="participants-table progress-table" data-testid="participants-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable">
                  Student <SortIcon field="name" />
                </th>
                <th>Programs</th>
                <th onClick={() => handleSort('progress')} className="sortable">
                  Progress <SortIcon field="progress" />
                </th>
                <th onClick={() => handleSort('verified_hours')} className="sortable">
                  Verified <SortIcon field="verified_hours" />
                </th>
                <th>Last Activity</th>
                <th onClick={() => handleSort('risk_score')} className="sortable">
                  Risk Status <SortIcon field="risk_score" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr 
                  key={student.student_id} 
                  onClick={() => handleStudentClick(student.student_id)}
                  className="clickable-row"
                  data-testid={`student-row-${student.student_id}`}
                >
                  <td>
                    <div className="student-cell">
                      <div className="student-avatar-small">{student.avatar}</div>
                      <div>
                        <div className="student-name">{student.name}</div>
                        <div className="student-email">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="program-tags">
                      {student.program_names?.map((name, i) => (
                        <span key={i} className="program-tag-small">{name}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="progress-cell-detailed">
                      <div className="progress-bar-container">
                        <div className="progress-bar-bg">
                          <div 
                            className={`progress-bar-fill ${student.riskStatus}`}
                            style={{ width: `${Math.min(student.progress, 100)}%` }}
                          />
                        </div>
                        <span className="progress-text">
                          {student.verified_hours}h / {requiredHours}h
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="verified-hours">{student.verified_hours}h</span>
                  </td>
                  <td className="last-activity-cell">
                    {getLastActivityDate(student)}
                  </td>
                  <td>{getRiskBadge(student.riskStatus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Student Profile Side Panel - Read Only */}
      {selectedStudent && (
        <div className="side-panel-overlay" onClick={closeDetails}>
          <div className="side-panel profile-panel" onClick={(e) => e.stopPropagation()} data-testid="student-profile-panel">
            <div className="side-panel-header">
              <h3>Student Profile</h3>
              <button className="close-btn" onClick={closeDetails}>
                <span>×</span>
              </button>
            </div>
            
            {loadingDetails ? (
              <div className="loading-state">Loading...</div>
            ) : studentDetails ? (
              <div className="side-panel-content">
                {/* Student Info */}
                <div className="profile-header">
                  <div className="profile-avatar-large">{studentDetails.avatar}</div>
                  <div className="profile-info">
                    <h4>{studentDetails.name}</h4>
                    <p>{studentDetails.email}</p>
                  </div>
                </div>

                {/* Progress Summary */}
                <div className="progress-summary">
                  <h5>Progress Summary</h5>
                  <div className="progress-visual">
                    <div className="progress-ring">
                      <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" className="progress-ring-bg" />
                        <circle 
                          cx="50" cy="50" r="45" 
                          className="progress-ring-fill"
                          style={{ 
                            strokeDasharray: `${Math.min((studentDetails.verified_hours / requiredHours) * 283, 283)} 283`
                          }}
                        />
                      </svg>
                      <div className="progress-ring-text">
                        <span className="ring-value">{Math.round((studentDetails.verified_hours / requiredHours) * 100)}%</span>
                        <span className="ring-label">Complete</span>
                      </div>
                    </div>
                    <div className="progress-breakdown">
                      <div className="breakdown-item">
                        <span className="breakdown-label">Verified Hours</span>
                        <span className="breakdown-value verified">{studentDetails.verified_hours}h</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">Pending Hours</span>
                        <span className="breakdown-value pending">{studentDetails.pending_hours || 0}h</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">Required</span>
                        <span className="breakdown-value">{requiredHours}h</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">Remaining</span>
                        <span className="breakdown-value remaining">
                          {Math.max(requiredHours - studentDetails.verified_hours, 0)}h
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Programs */}
                <div className="profile-section">
                  <h5>Enrolled Programs</h5>
                  <div className="program-chips">
                    {studentDetails.program_names?.map((name, i) => (
                      <span key={i} className="program-chip">{name}</span>
                    ))}
                  </div>
                </div>

                {/* Service Logs - Read Only */}
                <div className="profile-section">
                  <div className="section-header-row">
                    <h5>Service Logs</h5>
                    <span className="log-count">{studentDetails.logs?.length || 0} entries</span>
                  </div>
                  <div className="logs-list read-only">
                    {studentDetails.logs?.slice(0, 5).map((log) => (
                      <div key={log.log_id} className={`log-item-compact log-${log.status}`}>
                        <div className="log-item-header">
                          <span className="log-program">{log.program_name}</span>
                          <span className={`log-status-mini ${log.status}`}>{log.status}</span>
                        </div>
                        <div className="log-item-body">
                          <span className="log-description-mini">{log.description}</span>
                        </div>
                        <div className="log-item-footer">
                          <span className="log-date-mini">
                            <Calendar size={12} /> {log.date}
                          </span>
                          <span className="log-hours-mini">{log.hours}h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Link to Activities */}
                {studentDetails.logs?.some(l => l.status === 'pending') && (
                  <div className="profile-action">
                    <button 
                      className="link-to-activities"
                      onClick={() => {
                        closeDetails();
                        if (onNavigateToActivities) onNavigateToActivities();
                      }}
                      data-testid="view-pending-link"
                    >
                      <ExternalLink size={16} />
                      View pending logs in Activities
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default ParticipantsPage;
