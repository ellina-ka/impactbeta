import React from 'react';
import StatusBadge from './StatusBadge';

function NgoDashboard({ conventions }) {
  return (
    <div className="workflow-layout">
      <section className="workflow-card">
        <h2>NGO Conventions</h2>
        {conventions.map((convention) => (
          <div key={convention.id} className="detail-box">
            <p><strong>{convention.ngoName}</strong></p>
            <p><strong>Convention:</strong> {convention.id}</p>
            <p><strong>Student:</strong> {convention.studentName} ({convention.studentEmail})</p>
            <p><strong>Mission:</strong> {convention.missionDescription}</p>
            <p><strong>Dates:</strong> {convention.startDate} → {convention.endDate}</p>
            <p><strong>Target hours:</strong> {convention.targetHours}</p>
            <div className="ngo-actions">
              <StatusBadge status={convention.status} />
              <button className="table-btn">Ready to Sign</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default NgoDashboard;
