import React from 'react';
import { Calendar } from 'lucide-react';
import './styles.css';

function ActivitiesPage({ selectedTerm }) {
  return (
    <div className="page" data-testid="activities-page">
      <div className="page-header">
        <h1 className="page-title">Activities</h1>
        <p className="page-subtitle">Manage and track all volunteer activities</p>
      </div>

      <div className="placeholder-content">
        <Calendar size={48} />
        <h3>Activities Management</h3>
        <p>View and manage all service activities for the selected term.</p>
        <p className="term-note">Current term: {selectedTerm}</p>
      </div>
    </div>
  );
}

export default ActivitiesPage;
