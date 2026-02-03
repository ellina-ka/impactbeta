import React, { useState } from 'react';
import { MoreHorizontal, X, Clock, CheckCircle } from 'lucide-react';
import './styles.css';

const REJECTION_REASONS = [
  { value: 'not_eligible', label: 'Not Eligible' },
  { value: 'insufficient_evidence', label: 'Insufficient Evidence' },
  { value: 'suspicious', label: 'Suspicious Activity' },
  { value: 'duplicate', label: 'Duplicate Entry' },
];

function VerificationPanel({ requests, onConfirm, onReject, onFlag, loading }) {
  const [menuOpen, setMenuOpen] = useState(null);
  const [modalOpen, setModalOpen] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [flagReason, setFlagReason] = useState('');

  const handleMenuToggle = (requestId) => {
    setMenuOpen(menuOpen === requestId ? null : requestId);
  };

  const openModal = (requestId, type) => {
    setModalOpen(requestId);
    setModalType(type);
    setMenuOpen(null);
    setSelectedReason('');
    setFlagReason('');
  };

  const closeModal = () => {
    setModalOpen(null);
    setModalType(null);
    setSelectedReason('');
    setFlagReason('');
  };

  const handleRejectSubmit = () => {
    if (selectedReason && modalOpen) {
      onReject(modalOpen, selectedReason);
      closeModal();
    }
  };

  const handleFlagSubmit = () => {
    if (flagReason && modalOpen) {
      onFlag(modalOpen, flagReason);
      closeModal();
    }
  };

  return (
    <div className="panel" data-testid="verification-panel">
      <div className="panel-header">
        <h2 className="panel-title">Verification Requests</h2>
        <span className="panel-badge">{requests.length} pending</span>
      </div>

      <div className="requests-list">
        {loading ? (
          <div className="loading-state">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={32} className="empty-icon" />
            <p>All caught up! No pending verification requests.</p>
          </div>
        ) : (
          requests.slice(0, 10).map((request) => (
            <div 
              key={request.request_id} 
              className="request-item"
              data-testid={`verification-request-${request.request_id}`}
            >
              <div className="request-left">
                <div className="request-avatar">
                  <span>{request.student_avatar}</span>
                </div>
                <div className="request-info">
                  <div className="student-name">{request.student_name}</div>
                  <div className="request-details">
                    <span className="program-tag">{request.program_name}</span>
                    <span className="hours-tag">
                      <Clock size={12} /> {request.hours}h
                    </span>
                    <span className="date-tag">{request.log_date}</span>
                  </div>
                  <div className="request-description">{request.description}</div>
                </div>
              </div>
              
              <div className="request-right">
                <span className={`evidence-pill ${request.evidence_tier}`}>
                  {request.evidence_tier === 'self_reported' ? 'Self-reported' : 'Org confirmed'}
                </span>
                <button
                  className="confirm-btn"
                  onClick={() => onConfirm(request.request_id)}
                  data-testid={`confirm-btn-${request.request_id}`}
                >
                  Confirm
                </button>
                <div className="menu-container">
                  <button 
                    className="menu-btn"
                    onClick={() => handleMenuToggle(request.request_id)}
                    data-testid={`menu-btn-${request.request_id}`}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {menuOpen === request.request_id && (
                    <div className="dropdown-menu">
                      <button 
                        onClick={() => openModal(request.request_id, 'reject')}
                        data-testid={`reject-option-${request.request_id}`}
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => openModal(request.request_id, 'flag')}
                        data-testid={`flag-option-${request.request_id}`}
                      >
                        Flag for Review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      {modalOpen && modalType === 'reject' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} data-testid="reject-modal">
            <div className="modal-header">
              <h3>Reject Verification</h3>
              <button className="close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <label>Select a reason for rejection:</label>
              <select 
                value={selectedReason} 
                onChange={(e) => setSelectedReason(e.target.value)}
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
              <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              <button 
                className="submit-btn reject" 
                onClick={handleRejectSubmit}
                disabled={!selectedReason}
                data-testid="reject-submit-btn"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Modal */}
      {modalOpen && modalType === 'flag' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} data-testid="flag-modal">
            <div className="modal-header">
              <h3>Flag for Review</h3>
              <button className="close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <label>Enter reason for flagging:</label>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Describe why this request needs review..."
                rows={3}
                data-testid="flag-reason-input"
              />
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              <button 
                className="submit-btn flag" 
                onClick={handleFlagSubmit}
                disabled={!flagReason}
                data-testid="flag-submit-btn"
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

export default VerificationPanel;
