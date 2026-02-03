import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Flag, Clock, MapPin, FileText, Calendar, User } from 'lucide-react';
import './styles.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const REJECTION_REASONS = [
  { value: 'not_eligible', label: 'Not Eligible' },
  { value: 'insufficient_evidence', label: 'Insufficient Evidence' },
  { value: 'suspicious', label: 'Suspicious Activity' },
  { value: 'duplicate', label: 'Duplicate Entry' },
];

function ActivitiesPage({ selectedTerm, onActionComplete }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all verification requests (pending + we'll also get flagged logs)
      const [vrRes, logsRes] = await Promise.all([
        fetch(`${API_URL}/api/verification-requests?term_id=${selectedTerm}`),
        fetch(`${API_URL}/api/service-logs?term_id=${selectedTerm}`)
      ]);
      
      const vrData = await vrRes.json();
      const logsData = await logsRes.json();
      
      // Filter to pending requests only (awaiting_confirmation)
      const pendingRequests = vrData.filter(vr => vr.status === 'awaiting_confirmation');
      
      // Also get flagged logs that don't have pending VRs
      const flaggedLogs = logsData.filter(log => log.status === 'flagged');
      
      // Combine and format
      const combined = [
        ...pendingRequests.map(vr => ({
          ...vr,
          type: 'pending',
          sortPriority: 1
        })),
        ...flaggedLogs.map(log => ({
          request_id: `flagged-${log.log_id}`,
          log_id: log.log_id,
          student_id: log.student_id,
          program_id: log.program_id,
          student_name: log.student_name,
          student_email: log.student_email,
          student_avatar: log.student_name?.split(' ').map(n => n[0]).join('') || '?',
          program_name: log.program_name,
          hours: log.hours,
          log_date: log.date,
          evidence_tier: log.evidence_tier,
          description: log.description,
          ngo_name: log.description,
          status: 'flagged',
          type: 'flagged',
          sortPriority: 0,
          created_at: log.created_at
        }))
      ].sort((a, b) => a.sortPriority - b.sortPriority);
      
      setRequests(combined);
      
      // Auto-select first if none selected
      if (combined.length > 0 && !selectedRequest) {
        setSelectedRequest(combined[0]);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTerm, selectedRequest]);

  useEffect(() => {
    fetchRequests();
  }, [selectedTerm]);

  const handleConfirm = async (request) => {
    if (request.type === 'flagged') return; // Can't confirm flagged items directly
    
    setProcessing(true);
    try {
      const response = await fetch(`${API_URL}/api/verification-requests/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: request.request_id })
      });
      
      if (response.ok) {
        // Remove from list and select next
        const newRequests = requests.filter(r => r.request_id !== request.request_id);
        setRequests(newRequests);
        setSelectedRequest(newRequests[0] || null);
        if (onActionComplete) onActionComplete('confirm', request.hours);
      }
    } catch (error) {
      console.error('Error confirming:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason || !selectedRequest) return;
    
    setProcessing(true);
    try {
      const response = await fetch(`${API_URL}/api/verification-requests/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: selectedRequest.request_id, reason: rejectReason })
      });
      
      if (response.ok) {
        const newRequests = requests.filter(r => r.request_id !== selectedRequest.request_id);
        setRequests(newRequests);
        setSelectedRequest(newRequests[0] || null);
        setActionModal(null);
        setRejectReason('');
        if (onActionComplete) onActionComplete('reject');
      }
    } catch (error) {
      console.error('Error rejecting:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleFlag = async () => {
    if (!flagReason || !selectedRequest) return;
    
    setProcessing(true);
    try {
      const response = await fetch(`${API_URL}/api/verification-requests/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: selectedRequest.request_id, reason: flagReason })
      });
      
      if (response.ok) {
        const newRequests = requests.filter(r => r.request_id !== selectedRequest.request_id);
        setRequests(newRequests);
        setSelectedRequest(newRequests[0] || null);
        setActionModal(null);
        setFlagReason('');
        if (onActionComplete) onActionComplete('flag');
      }
    } catch (error) {
      console.error('Error flagging:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status, type) => {
    if (type === 'flagged' || status === 'flagged') {
      return <span className="inbox-status-badge flagged">Flagged</span>;
    }
    return <span className="inbox-status-badge pending">Pending Review</span>;
  };

  const getEvidenceBadge = (tier) => {
    if (tier === 'org_confirmed') {
      return <span className="inbox-evidence-badge org">Org-confirmed</span>;
    }
    return <span className="inbox-evidence-badge self">Self-reported</span>;
  };

  const pendingCount = requests.filter(r => r.type === 'pending').length;
  const flaggedCount = requests.filter(r => r.type === 'flagged').length;

  return (
    <div className="page verification-inbox" data-testid="activities-page">
      {/* Header */}
      <div className="inbox-header">
        <div>
          <h1 className="page-title">Verification Inbox</h1>
          <p className="page-subtitle">Review and verify student service hours</p>
        </div>
        <div className="inbox-stats">
          <div className="inbox-stat">
            <span className="stat-count pending">{pendingCount}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="inbox-stat">
            <span className="stat-count flagged">{flaggedCount}</span>
            <span className="stat-label">Flagged</span>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="inbox-container">
        {/* Queue List */}
        <div className="inbox-queue" data-testid="verification-queue">
          <div className="queue-header">
            <h3>Review Queue</h3>
            <span className="queue-count">{requests.length} items</span>
          </div>
          
          {loading ? (
            <div className="queue-loading">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="queue-empty">
              <Check size={32} />
              <p>All caught up!</p>
              <span>No pending verifications</span>
            </div>
          ) : (
            <div className="queue-list">
              {requests.map((request) => (
                <div
                  key={request.request_id}
                  className={`queue-item ${selectedRequest?.request_id === request.request_id ? 'selected' : ''} ${request.type}`}
                  onClick={() => setSelectedRequest(request)}
                  data-testid={`queue-item-${request.request_id}`}
                >
                  <div className="queue-item-main">
                    <div className="queue-avatar">
                      {request.student_avatar}
                    </div>
                    <div className="queue-info">
                      <div className="queue-student">{request.student_name}</div>
                      <div className="queue-meta">
                        <span className="queue-program">{request.program_name}</span>
                        <span className="queue-date">{request.log_date}</span>
                      </div>
                    </div>
                    <div className="queue-right">
                      <span className="queue-hours">{request.hours}h</span>
                      {getEvidenceBadge(request.evidence_tier)}
                    </div>
                  </div>
                  <div className="queue-item-footer">
                    {getStatusBadge(request.status, request.type)}
                    {request.type === 'pending' && (
                      <div className="queue-actions">
                        <button
                          className="queue-action-btn confirm"
                          onClick={(e) => { e.stopPropagation(); handleConfirm(request); }}
                          disabled={processing}
                          title="Confirm"
                          data-testid={`confirm-${request.request_id}`}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          className="queue-action-btn reject"
                          onClick={(e) => { e.stopPropagation(); setSelectedRequest(request); setActionModal('reject'); }}
                          disabled={processing}
                          title="Reject"
                          data-testid={`reject-${request.request_id}`}
                        >
                          <X size={14} />
                        </button>
                        <button
                          className="queue-action-btn flag"
                          onClick={(e) => { e.stopPropagation(); setSelectedRequest(request); setActionModal('flag'); }}
                          disabled={processing}
                          title="Flag for Review"
                          data-testid={`flag-${request.request_id}`}
                        >
                          <Flag size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="inbox-detail" data-testid="detail-panel">
          {!selectedRequest ? (
            <div className="detail-empty">
              <FileText size={48} />
              <p>Select an item to view details</p>
            </div>
          ) : (
            <>
              <div className="detail-header">
                <div className="detail-student">
                  <div className="detail-avatar">{selectedRequest.student_avatar}</div>
                  <div>
                    <h3>{selectedRequest.student_name}</h3>
                    <p>{selectedRequest.student_email}</p>
                  </div>
                </div>
                {getStatusBadge(selectedRequest.status, selectedRequest.type)}
              </div>

              <div className="detail-body">
                {/* Activity Info */}
                <div className="detail-section">
                  <h4>Activity Details</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <Clock size={16} />
                      <div>
                        <label>Hours Logged</label>
                        <p>{selectedRequest.hours} hours</p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <Calendar size={16} />
                      <div>
                        <label>Date</label>
                        <p>{selectedRequest.log_date}</p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <User size={16} />
                      <div>
                        <label>Program</label>
                        <p>{selectedRequest.program_name}</p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <MapPin size={16} />
                      <div>
                        <label>NGO / Location</label>
                        <p>{selectedRequest.ngo_name || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="detail-section">
                  <h4>Description</h4>
                  <p className="detail-description">
                    {selectedRequest.description || selectedRequest.action_description || 'No description provided'}
                  </p>
                </div>

                {/* Evidence */}
                <div className="detail-section">
                  <h4>Evidence</h4>
                  <div className="evidence-box">
                    {getEvidenceBadge(selectedRequest.evidence_tier)}
                    <p className="evidence-note">
                      {selectedRequest.evidence_tier === 'org_confirmed' 
                        ? 'This activity has been confirmed by the partner organization.'
                        : 'This activity is self-reported by the student. Consider requesting additional verification.'}
                    </p>
                    <div className="evidence-placeholder">
                      <FileText size={24} />
                      <span>No attachments uploaded</span>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="detail-section">
                  <h4>Timestamps</h4>
                  <div className="timestamps">
                    <div className="timestamp-item">
                      <span className="timestamp-label">Submitted</span>
                      <span className="timestamp-value">
                        {selectedRequest.created_at 
                          ? new Date(selectedRequest.created_at).toLocaleString() 
                          : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedRequest.type === 'pending' && (
                <div className="detail-actions">
                  <button
                    className="detail-action-btn reject"
                    onClick={() => setActionModal('reject')}
                    disabled={processing}
                  >
                    <X size={18} /> Reject
                  </button>
                  <button
                    className="detail-action-btn flag"
                    onClick={() => setActionModal('flag')}
                    disabled={processing}
                  >
                    <Flag size={18} /> Flag
                  </button>
                  <button
                    className="detail-action-btn confirm"
                    onClick={() => handleConfirm(selectedRequest)}
                    disabled={processing}
                  >
                    <Check size={18} /> Confirm Hours
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {actionModal === 'reject' && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} data-testid="reject-modal">
            <div className="modal-header">
              <h3>Reject Verification</h3>
              <button className="close-btn" onClick={() => setActionModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-context">
                Rejecting <strong>{selectedRequest?.hours}h</strong> for <strong>{selectedRequest?.student_name}</strong>
              </p>
              <label>Select a reason for rejection:</label>
              <select 
                value={rejectReason} 
                onChange={(e) => setRejectReason(e.target.value)}
                data-testid="reject-reason-select"
              >
                <option value="">Select reason...</option>
                {REJECTION_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setActionModal(null)}>Cancel</button>
              <button 
                className="submit-btn reject" 
                onClick={handleReject}
                disabled={!rejectReason || processing}
              >
                {processing ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Modal */}
      {actionModal === 'flag' && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} data-testid="flag-modal">
            <div className="modal-header">
              <h3>Flag for Review</h3>
              <button className="close-btn" onClick={() => setActionModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-context">
                Flagging <strong>{selectedRequest?.hours}h</strong> for <strong>{selectedRequest?.student_name}</strong>
              </p>
              <label>Enter reason for flagging:</label>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Describe why this needs additional review..."
                rows={3}
                data-testid="flag-reason-input"
              />
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setActionModal(null)}>Cancel</button>
              <button 
                className="submit-btn flag" 
                onClick={handleFlag}
                disabled={!flagReason || processing}
              >
                {processing ? 'Flagging...' : 'Flag'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivitiesPage;
