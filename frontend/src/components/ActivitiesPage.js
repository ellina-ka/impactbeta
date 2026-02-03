import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Eye, Check, X, Flag, Filter } from 'lucide-react';
import './styles.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

function ActivitiesPage({ selectedTerm, onRefresh }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedLog, setSelectedLog] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [flagReason, setFlagReason] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [selectedTerm]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/service-logs?term_id=${selectedTerm}`);
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleVerify = async (logId) => {
    try {
      // Find the verification request for this log
      const vrResponse = await fetch(`${API_URL}/api/verification-requests?term_id=${selectedTerm}`);
      const vrs = await vrResponse.json();
      const vr = vrs.find(v => v.log_id === logId);
      
      if (vr) {
        await fetch(`${API_URL}/api/verification-requests/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: vr.request_id })
        });
        fetchLogs();
      }
    } catch (error) {
      console.error('Error verifying:', error);
    }
  };

  const handleReject = async (logId) => {
    if (!rejectReason) return;
    try {
      const vrResponse = await fetch(`${API_URL}/api/verification-requests?term_id=${selectedTerm}`);
      const vrs = await vrResponse.json();
      const vr = vrs.find(v => v.log_id === logId);
      
      if (vr) {
        await fetch(`${API_URL}/api/verification-requests/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: vr.request_id, reason: rejectReason })
        });
        setActionModal(null);
        setRejectReason('');
        fetchLogs();
      }
    } catch (error) {
      console.error('Error rejecting:', error);
    }
  };

  const handleFlag = async (logId) => {
    if (!flagReason) return;
    try {
      const vrResponse = await fetch(`${API_URL}/api/verification-requests?term_id=${selectedTerm}`);
      const vrs = await vrResponse.json();
      const vr = vrs.find(v => v.log_id === logId);
      
      if (vr) {
        await fetch(`${API_URL}/api/verification-requests/flag`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: vr.request_id, reason: flagReason })
        });
        setActionModal(null);
        setFlagReason('');
        fetchLogs();
      }
    } catch (error) {
      console.error('Error flagging:', error);
    }
  };

  const filteredLogs = logs
    .filter(log => {
      const matchesSearch = 
        log.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.program_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: { label: 'Confirmed', className: 'status-confirmed' },
      pending: { label: 'Pending', className: 'status-pending' },
      rejected: { label: 'Rejected', className: 'status-rejected' },
      flagged: { label: 'Flagged', className: 'status-flagged' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`activity-status-badge ${badge.className}`}>{badge.label}</span>;
  };

  const getEvidenceBadge = (tier) => {
    if (tier === 'org_confirmed') {
      return <span className="evidence-badge org">Org-confirmed</span>;
    }
    return <span className="evidence-badge self">Self-reported</span>;
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const statusCounts = {
    all: logs.length,
    pending: logs.filter(l => l.status === 'pending').length,
    confirmed: logs.filter(l => l.status === 'confirmed').length,
    rejected: logs.filter(l => l.status === 'rejected').length,
    flagged: logs.filter(l => l.status === 'flagged').length
  };

  return (
    <div className="page activities-page" data-testid="activities-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Activities</h1>
          <p className="page-subtitle">Manage and verify all service hour logs</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{logs.length}</span>
            <span className="stat-label">Total Logs</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{statusCounts.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{statusCounts.confirmed}</span>
            <span className="stat-label">Confirmed</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="activities-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by student, program, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="activities-search"
          />
        </div>
        
        <div className="filter-group">
          <Filter size={16} />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            data-testid="status-filter"
          >
            <option value="all">All Status ({statusCounts.all})</option>
            <option value="pending">Pending ({statusCounts.pending})</option>
            <option value="confirmed">Confirmed ({statusCounts.confirmed})</option>
            <option value="rejected">Rejected ({statusCounts.rejected})</option>
            <option value="flagged">Flagged ({statusCounts.flagged})</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="activities-table-container">
        {loading ? (
          <div className="loading-state">Loading activities...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="empty-state">No activities found matching your criteria</div>
        ) : (
          <table className="activities-table" data-testid="activities-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('student_name')} className="sortable">
                  Student <SortIcon field="student_name" />
                </th>
                <th onClick={() => handleSort('program_name')} className="sortable">
                  Program <SortIcon field="program_name" />
                </th>
                <th onClick={() => handleSort('date')} className="sortable">
                  Date <SortIcon field="date" />
                </th>
                <th onClick={() => handleSort('hours')} className="sortable">
                  Hours <SortIcon field="hours" />
                </th>
                <th>Evidence</th>
                <th onClick={() => handleSort('status')} className="sortable">
                  Status <SortIcon field="status" />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.log_id} data-testid={`activity-row-${log.log_id}`}>
                  <td>
                    <div className="student-cell">
                      <div className="student-avatar-small">
                        {log.student_name?.split(' ').map(n => n[0]).join('') || '?'}
                      </div>
                      <div>
                        <div className="student-name">{log.student_name}</div>
                        <div className="student-email">{log.student_email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="program-tag-small">{log.program_name}</span>
                  </td>
                  <td className="date-cell">{log.date}</td>
                  <td className="hours-cell">{log.hours}h</td>
                  <td>{getEvidenceBadge(log.evidence_tier)}</td>
                  <td>{getStatusBadge(log.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view"
                        onClick={() => setSelectedLog(log)}
                        title="View Details"
                        data-testid={`view-btn-${log.log_id}`}
                      >
                        <Eye size={14} />
                      </button>
                      {log.status === 'pending' && (
                        <>
                          <button 
                            className="action-btn verify"
                            onClick={() => handleVerify(log.log_id)}
                            title="Verify"
                            data-testid={`verify-btn-${log.log_id}`}
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            className="action-btn reject"
                            onClick={() => setActionModal({ type: 'reject', log })}
                            title="Reject"
                            data-testid={`reject-btn-${log.log_id}`}
                          >
                            <X size={14} />
                          </button>
                          <button 
                            className="action-btn flag"
                            onClick={() => setActionModal({ type: 'flag', log })}
                            title="Flag"
                            data-testid={`flag-btn-${log.log_id}`}
                          >
                            <Flag size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View Log Modal */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="modal log-modal" onClick={(e) => e.stopPropagation()} data-testid="log-detail-modal">
            <div className="modal-header">
              <h3>Activity Details</h3>
              <button className="close-btn" onClick={() => setSelectedLog(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="log-detail-grid">
                <div className="log-detail-item">
                  <label>Student</label>
                  <p>{selectedLog.student_name}</p>
                </div>
                <div className="log-detail-item">
                  <label>Email</label>
                  <p>{selectedLog.student_email}</p>
                </div>
                <div className="log-detail-item">
                  <label>Program</label>
                  <p>{selectedLog.program_name}</p>
                </div>
                <div className="log-detail-item">
                  <label>Date</label>
                  <p>{selectedLog.date}</p>
                </div>
                <div className="log-detail-item">
                  <label>Hours</label>
                  <p>{selectedLog.hours} hours</p>
                </div>
                <div className="log-detail-item">
                  <label>Status</label>
                  <p>{getStatusBadge(selectedLog.status)}</p>
                </div>
                <div className="log-detail-item full-width">
                  <label>Description</label>
                  <p>{selectedLog.description}</p>
                </div>
                <div className="log-detail-item">
                  <label>Evidence Tier</label>
                  <p>{getEvidenceBadge(selectedLog.evidence_tier)}</p>
                </div>
                <div className="log-detail-item">
                  <label>Created</label>
                  <p>{new Date(selectedLog.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {actionModal?.type === 'reject' && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} data-testid="reject-activity-modal">
            <div className="modal-header">
              <h3>Reject Activity</h3>
              <button className="close-btn" onClick={() => setActionModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-context">
                Rejecting activity for <strong>{actionModal.log.student_name}</strong> - {actionModal.log.hours}h on {actionModal.log.date}
              </p>
              <label>Select a reason for rejection:</label>
              <select 
                value={rejectReason} 
                onChange={(e) => setRejectReason(e.target.value)}
                data-testid="reject-reason-select"
              >
                <option value="">Select reason...</option>
                <option value="not_eligible">Not Eligible</option>
                <option value="insufficient_evidence">Insufficient Evidence</option>
                <option value="suspicious">Suspicious Activity</option>
                <option value="duplicate">Duplicate Entry</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setActionModal(null)}>Cancel</button>
              <button 
                className="submit-btn reject" 
                onClick={() => handleReject(actionModal.log.log_id)}
                disabled={!rejectReason}
                data-testid="confirm-reject-btn"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Modal */}
      {actionModal?.type === 'flag' && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} data-testid="flag-activity-modal">
            <div className="modal-header">
              <h3>Flag for Review</h3>
              <button className="close-btn" onClick={() => setActionModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-context">
                Flagging activity for <strong>{actionModal.log.student_name}</strong> - {actionModal.log.hours}h on {actionModal.log.date}
              </p>
              <label>Enter reason for flagging:</label>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Describe why this activity needs review..."
                rows={3}
                data-testid="flag-reason-input"
              />
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setActionModal(null)}>Cancel</button>
              <button 
                className="submit-btn flag" 
                onClick={() => handleFlag(actionModal.log.log_id)}
                disabled={!flagReason}
                data-testid="confirm-flag-btn"
              >
                Flag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivitiesPage;
