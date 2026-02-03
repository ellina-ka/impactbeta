import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, X, Clock, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import './styles.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

function ParticipantsPage({ selectedTerm, students, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
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

  const filteredStudents = students
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

  const getStatusBadge = (status) => {
    const badges = {
      on_track: { label: 'On Track', className: 'status-on-track' },
      needs_attention: { label: 'Needs Attention', className: 'status-needs-attention' },
      at_risk: { label: 'At Risk', className: 'status-at-risk' }
    };
    const badge = badges[status] || badges.at_risk;
    return <span className={`status-badge ${badge.className}`}>{badge.label}</span>;
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="page participants-page" data-testid="participants-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Participants</h1>
          <p className="page-subtitle">Track student progress and service hours</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{students.length}</span>
            <span className="stat-label">Total Students</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{students.filter(s => s.status === 'on_track').length}</span>
            <span className="stat-label">On Track</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{students.filter(s => s.status === 'at_risk').length}</span>
            <span className="stat-label">At Risk</span>
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
      </div>

      {/* Table */}
      <div className="participants-table-container">
        {loading ? (
          <div className="loading-state">Loading participants...</div>
        ) : (
          <table className="participants-table" data-testid="participants-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable">
                  Student <SortIcon field="name" />
                </th>
                <th>Program</th>
                <th onClick={() => handleSort('total_hours')} className="sortable">
                  Total Hours <SortIcon field="total_hours" />
                </th>
                <th onClick={() => handleSort('percent_verified')} className="sortable">
                  % Verified <SortIcon field="percent_verified" />
                </th>
                <th onClick={() => handleSort('status')} className="sortable">
                  Status <SortIcon field="status" />
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
                      {student.program_names.map((name, i) => (
                        <span key={i} className="program-tag-small">{name}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="hours-display">{student.total_hours}h</span>
                  </td>
                  <td>
                    <div className="progress-cell">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${Math.min(student.percent_verified, 100)}%` }}
                        />
                      </div>
                      <span>{student.percent_verified}%</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(student.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Student Details Side Panel */}
      {selectedStudent && (
        <div className="side-panel-overlay" onClick={closeDetails}>
          <div className="side-panel" onClick={(e) => e.stopPropagation()} data-testid="student-details-panel">
            <div className="side-panel-header">
              <h3>Student Details</h3>
              <button className="close-btn" onClick={closeDetails}>
                <X size={20} />
              </button>
            </div>
            
            {loadingDetails ? (
              <div className="loading-state">Loading...</div>
            ) : studentDetails ? (
              <div className="side-panel-content">
                {/* Student Info */}
                <div className="student-profile">
                  <div className="profile-avatar">{studentDetails.avatar}</div>
                  <div className="profile-info">
                    <h4>{studentDetails.name}</h4>
                    <p>{studentDetails.email}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="detail-stats">
                  <div className="detail-stat">
                    <Clock size={18} />
                    <div>
                      <span className="stat-value">{studentDetails.total_hours}h</span>
                      <span className="stat-label">Total Hours</span>
                    </div>
                  </div>
                  <div className="detail-stat">
                    <CheckCircle size={18} />
                    <div>
                      <span className="stat-value">{studentDetails.verified_hours}h</span>
                      <span className="stat-label">Verified</span>
                    </div>
                  </div>
                </div>

                {/* Programs */}
                <div className="detail-section">
                  <h5>Programs</h5>
                  <div className="program-list">
                    {studentDetails.program_names.map((name, i) => (
                      <span key={i} className="program-chip">{name}</span>
                    ))}
                  </div>
                </div>

                {/* Service Logs */}
                <div className="detail-section">
                  <h5>Service Logs</h5>
                  <div className="logs-list">
                    {studentDetails.logs && studentDetails.logs.map((log) => (
                      <div key={log.log_id} className={`log-item log-${log.status}`}>
                        <div className="log-header">
                          <span className="log-date">{log.date}</span>
                          <span className={`log-status ${log.status}`}>{log.status}</span>
                        </div>
                        <div className="log-description">{log.description}</div>
                        <div className="log-meta">
                          <span>{log.hours}h</span>
                          <span>{log.program_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default ParticipantsPage;
