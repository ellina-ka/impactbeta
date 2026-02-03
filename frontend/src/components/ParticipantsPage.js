import React from 'react';
import { Users } from 'lucide-react';

function ParticipantsPage({ selectedTerm }) {
  return (
    <div className="page" data-testid="participants-page">
      <div className="page-header">
        <h1 className="page-title">Participants</h1>
        <p className="page-subtitle">View and manage student participants</p>
      </div>

      <div className="placeholder-content">
        <Users size={48} />
        <h3>Participant Management</h3>
        <p>View all students participating in service programs.</p>
        <p className="term-note">Current term: {selectedTerm}</p>
      </div>

      <style jsx>{`
        .page {
          max-width: 1400px;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-title {
          font-size: 24px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }

        .page-subtitle {
          font-size: 14px;
          color: #6B7280;
        }

        .placeholder-content {
          background: white;
          border-radius: 12px;
          padding: 60px 40px;
          text-align: center;
          color: #6B7280;
        }

        .placeholder-content h3 {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
          margin: 16px 0 8px;
        }

        .placeholder-content p {
          font-size: 14px;
        }

        .term-note {
          margin-top: 16px;
          padding: 8px 16px;
          background-color: #F3F4F6;
          border-radius: 6px;
          display: inline-block;
          font-weight: 500;
          color: #374151;
        }
      `}</style>
    </div>
  );
}

export default ParticipantsPage;
