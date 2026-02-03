import React from 'react';
import { X, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import './styles.css';

function ProgramModal({ program, loading, onClose }) {
  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal program-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Loading...</h3>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className="modal-body">
            <div className="loading-state">Loading program details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!program) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal program-modal" onClick={(e) => e.stopPropagation()} data-testid="program-modal">
        <div className="modal-header">
          <h3>{program.name}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {/* Stats Grid */}
          <div className="program-stats-grid">
            <div className="program-stat">
              <Users size={20} />
              <div>
                <span className="stat-value">{program.student_count}</span>
                <span className="stat-label">Students</span>
              </div>
            </div>
            <div className="program-stat">
              <Clock size={20} />
              <div>
                <span className="stat-value">{program.total_hours}</span>
                <span className="stat-label">Total Hours</span>
              </div>
            </div>
            <div className="program-stat">
              <CheckCircle size={20} />
              <div>
                <span className="stat-value">{program.percent_verified}%</span>
                <span className="stat-label">Verified</span>
              </div>
            </div>
            <div className="program-stat">
              <AlertCircle size={20} />
              <div>
                <span className="stat-value">{program.pending_requests}</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
          </div>

          {/* Students List */}
          {program.students && program.students.length > 0 && (
            <div className="program-students">
              <h4>Active Students</h4>
              <div className="students-list-mini">
                {program.students.map((student) => (
                  <div key={student.student_id} className="student-mini">
                    <div className="student-avatar-mini">{student.avatar}</div>
                    <span>{student.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgramModal;
