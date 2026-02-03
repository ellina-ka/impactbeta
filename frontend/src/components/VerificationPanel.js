import React, { useState } from 'react';
import { MoreHorizontal, X } from 'lucide-react';

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
        <button className="more-btn">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="requests-list">
        {loading ? (
          <div className="loading-state">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="empty-state">No pending verification requests</div>
        ) : (
          requests.map((request) => (
            <div 
              key={request.request_id} 
              className="request-item"
              data-testid={`verification-request-${request.request_id}`}
            >
              <div className="request-left">
                <div className="avatar">
                  <span>{request.student_avatar}</span>
                </div>
                <div className="request-info">
                  <div className="student-name">{request.student_name}</div>
                  <div className="request-details">
                    <span className="ngo-name">{request.ngo_name}</span>
                    {request.action_description && (
                      <span className="action-desc"> · {request.action_description}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="request-right">
                <span className="status-pill">Awaiting confirmation</span>
                <button
                  className="confirm-btn"
                  onClick={() => onConfirm(request.request_id)}
                  data-testid={`confirm-btn-${request.request_id}`}
                >
                  Confirm participation
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

      <style jsx>{`
        .panel {
          background-color: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .panel-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .more-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: #6B7280;
          cursor: pointer;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .more-btn:hover {
          background-color: #F3F4F6;
        }

        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .request-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          border-radius: 8px;
          background-color: #F9FAFB;
          gap: 16px;
        }

        .request-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #E5E7EB;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          flex-shrink: 0;
        }

        .request-info {
          min-width: 0;
        }

        .student-name {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 2px;
        }

        .request-details {
          font-size: 12px;
          color: #6B7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ngo-name {
          color: #3B7073;
        }

        .request-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .status-pill {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          background-color: #FEF3C7;
          color: #92400E;
        }

        .confirm-btn {
          padding: 8px 14px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          background-color: #3B7073;
          color: white;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .confirm-btn:hover {
          background-color: #1D4648;
        }

        .menu-container {
          position: relative;
        }

        .menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          color: #6B7280;
          cursor: pointer;
          border-radius: 4px;
        }

        .menu-btn:hover {
          background-color: #E5E7EB;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 4px;
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 50;
          min-width: 140px;
          overflow: hidden;
        }

        .dropdown-menu button {
          display: block;
          width: 100%;
          padding: 10px 14px;
          border: none;
          background: transparent;
          text-align: left;
          font-size: 13px;
          color: #374151;
          cursor: pointer;
        }

        .dropdown-menu button:hover {
          background-color: #F3F4F6;
        }

        .loading-state,
        .empty-state {
          padding: 24px;
          text-align: center;
          color: #6B7280;
          font-size: 14px;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 420px;
          margin: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #E5E7EB;
        }

        .modal-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: #6B7280;
          cursor: pointer;
          border-radius: 6px;
        }

        .close-btn:hover {
          background-color: #F3F4F6;
        }

        .modal-body {
          padding: 20px;
        }

        .modal-body label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .modal-body select,
        .modal-body textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #D1D5DB;
          border-radius: 8px;
          font-size: 14px;
          color: #374151;
        }

        .modal-body select:focus,
        .modal-body textarea:focus {
          outline: none;
          border-color: #3B7073;
        }

        .modal-body textarea {
          resize: vertical;
          min-height: 80px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 20px;
          border-top: 1px solid #E5E7EB;
        }

        .cancel-btn {
          padding: 10px 16px;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          background: white;
          color: #374151;
          cursor: pointer;
        }

        .cancel-btn:hover {
          background-color: #F3F4F6;
        }

        .submit-btn {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .submit-btn.reject {
          background-color: #DC2626;
          color: white;
        }

        .submit-btn.reject:hover:not(:disabled) {
          background-color: #B91C1C;
        }

        .submit-btn.flag {
          background-color: #F59E0B;
          color: white;
        }

        .submit-btn.flag:hover:not(:disabled) {
          background-color: #D97706;
        }

        @media (max-width: 640px) {
          .request-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .request-right {
            width: 100%;
            justify-content: flex-end;
            margin-top: 8px;
          }

          .status-pill {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default VerificationPanel;
