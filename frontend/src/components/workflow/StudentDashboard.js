import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { useI18n } from '../../i18n/I18nContext';

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
  const { t } = useI18n();
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
        <h2>{t('student.sections.my_request')}</h2>
        <form className="student-form" onSubmit={handleSubmit}>
          <input required name="studentName" value={form.studentName} onChange={handleChange} placeholder={t('student.fields.student_name')} />
          <input required type="email" name="studentEmail" value={form.studentEmail} onChange={handleChange} placeholder={t('student.fields.student_email')} />
          <input required name="ngoName" value={form.ngoName} onChange={handleChange} placeholder={t('student.fields.ngo_name')} />
          <textarea required name="missionDescription" value={form.missionDescription} onChange={handleChange} placeholder={t('student.fields.mission_description')} />
          <div className="inline-fields">
            <input required type="date" name="startDate" value={form.startDate} onChange={handleChange} />
            <input required type="date" name="endDate" value={form.endDate} onChange={handleChange} />
            <input required type="number" min="1" name="targetHours" value={form.targetHours} onChange={handleChange} placeholder={t('student.fields.target_hours')} />
          </div>
          <button type="submit" className="table-btn success">{t('student.actions.submit_request')}</button>
        </form>

        {myApplication && (
          <div className="detail-box">
            <h3>{t('student.current_status')}</h3>
            <p><strong>{myApplication.ngoName}</strong></p>
            <p>{myApplication.missionDescription}</p>
            <StatusBadge status={myApplication.status} />
          </div>
        )}
      </section>

      <section className="workflow-card">
        <h2>{t('student.sections.my_convention')}</h2>
        {myConvention ? (
          <div className="detail-box">
            <p><strong>{t('student.labels.id')}:</strong> {myConvention.id}</p>
            <p><strong>{t('student.labels.student')}:</strong> {myConvention.studentName}</p>
            <p><strong>{t('student.labels.ngo')}:</strong> {myConvention.ngoName}</p>
            <p><strong>{t('student.labels.period')}:</strong> {myConvention.startDate} {t('common.date_separator')} {myConvention.endDate}</p>
            <p><strong>{t('student.labels.target_hours')}:</strong> {myConvention.targetHours}</p>
            <StatusBadge status={myConvention.status} />
          </div>
        ) : (
          <p>{t('student.no_convention')}</p>
        )}
      </section>
    </div>
  );
}

export default StudentDashboard;
