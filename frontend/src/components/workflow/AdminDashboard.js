import React from 'react';
import StatusBadge from './StatusBadge';

function AdminDashboard({ applications, conventions, onValidate, onReject }) {
  return (
    <div className="workflow-layout">
      <section className="workflow-card">
        <h2>Student Applications</h2>
        <table className="workflow-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>NGO</th>
              <th>Mission summary</th>
              <th>Dates</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>{app.studentName}</td>
                <td>{app.ngoName}</td>
                <td>{app.missionDescription}</td>
                <td>{app.startDate} → {app.endDate}</td>
                <td>{app.targetHours}</td>
                <td><StatusBadge status={app.status} /></td>
                <td className="actions-cell">
                  <button className="table-btn">View</button>
                  <button
                    className="table-btn success"
                    disabled={app.status !== 'pending'}
                    onClick={() => onValidate(app.id)}
                  >
                    Validate
                  </button>
                  <button
                    className="table-btn danger"
                    disabled={app.status !== 'pending'}
                    onClick={() => onReject(app.id)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="workflow-card">
        <h2>Generated Conventions</h2>
        <table className="workflow-table">
          <thead>
            <tr>
              <th>Convention id</th>
              <th>Student</th>
              <th>NGO</th>
              <th>Dates</th>
              <th>Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {conventions.map((convention) => (
              <tr key={convention.id}>
                <td>{convention.id}</td>
                <td>{convention.studentName}</td>
                <td>{convention.ngoName}</td>
                <td>{convention.startDate} → {convention.endDate}</td>
                <td>{convention.targetHours}</td>
                <td><StatusBadge status={convention.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default AdminDashboard;
