import React, { useState } from 'react';
import StatusBadge from './StatusBadge';

const EMPTY_FORM = {
  studentName: '',
  studentEmail: '',
  ngoName: '',
  missionDescription: '',
  startDate: '',
  endDate: '',
  targetHours: 20
};

function StudentDashboard({ applications, conventions, onSubmitApplication }) {
  const [form, setForm] = useState(EMPTY_FORM);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmitApplication(form);
    setForm(EMPTY_FORM);
  };

  const myApplication = applications[0];
  const myConvention = conventions.find((item) => item.applicationId === myApplication?.id)
    || conventions[0];

  return (
    <div className="workflow-layout two-columns">
      <section className="workflow-card">
        <h2>My Request</h2>
        <form className="student-form" onSubmit={handleSubmit}>
          <input required name="studentName" value={form.studentName} onChange={handleChange} placeholder="Student name" />
          <input required type="email" name="studentEmail" value={form.studentEmail} onChange={handleChange} placeholder="Student email" />
          <input required name="ngoName" value={form.ngoName} onChange={handleChange} placeholder="NGO / organization" />
          <textarea required name="missionDescription" value={form.missionDescription} onChange={handleChange} placeholder="Mission description" />
          <div className="inline-fields">
            <input required type="date" name="startDate" value={form.startDate} onChange={handleChange} />
            <input required type="date" name="endDate" value={form.endDate} onChange={handleChange} />
            <input required type="number" min="1" name="targetHours" value={form.targetHours} onChange={handleChange} placeholder="Hours" />
          </div>
          <button type="submit" className="table-btn success">Submit request</button>
        </form>

        {myApplication && (
          <div className="detail-box">
            <h3>Current status</h3>
            <p><strong>{myApplication.ngoName}</strong></p>
            <p>{myApplication.missionDescription}</p>
            <StatusBadge status={myApplication.status} />
          </div>
        )}
      </section>

      <section className="workflow-card">
        <h2>My Convention</h2>
        {myConvention ? (
          <div className="detail-box">
            <p><strong>ID:</strong> {myConvention.id}</p>
            <p><strong>Student:</strong> {myConvention.studentName}</p>
            <p><strong>NGO:</strong> {myConvention.ngoName}</p>
            <p><strong>Period:</strong> {myConvention.startDate} → {myConvention.endDate}</p>
            <p><strong>Target hours:</strong> {myConvention.targetHours}</p>
            <StatusBadge status={myConvention.status} />
          </div>
        ) : (
          <p>No convention generated yet. It will appear after admin validation.</p>
        )}
      </section>
    </div>
  );
}

export default StudentDashboard;
