import React from 'react';
import { Users } from 'lucide-react';
import './styles.css';

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
    </div>
  );
}

export default ParticipantsPage;
