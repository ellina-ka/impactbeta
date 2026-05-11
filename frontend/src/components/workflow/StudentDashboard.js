import React, { useEffect, useState } from 'react';
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

function StudentDashboard({ applications, conventions, profile, onSubmitApplication }) {
  const { t } = useI18n();
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!profile) return;
    setForm((current) => ({
      ...current,
      studentName: profile.fullName || '',
      studentEmail: profile.email || ''
    }));
  }, [profile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmitApplication(form);
    setForm({
      ...EMPTY_FORM,
      studentName: profile?.fullName || '',
      studentEmail: profile?.email || ''
    });
  };

  const myApplication = applications[0];
  const myConvention = conventions.find((item) => item.applicationId === myApplication?.id)
    || conventions[0];
  const currentStatus = myConvention?.status || myApplication?.status || 'draft';

  return (
    <div className="dashboard-shell student-dashboard">
      <section className="dashboard-hero student-hero">
        <div>
          <p className="eyebrow">{t('workflow.eyebrow')}</p>
          <h1>{t('student.hero.title')}</h1>
          <p>{t('student.hero.subtitle')}</p>
        </div>
        <div className="hero-workflow-card">
          <span>{t('workflow.timeline_label')}</span>
          <WorkflowTimeline status={currentStatus} hasConvention={Boolean(myConvention)} />
        </div>
      </section>

      <div className="workflow-layout two-columns student-columns">
        <section className="workflow-card form-card">
          <div className="section-header roomy">
            <div>
              <p className="eyebrow">{t('student.sections.start_here')}</p>
              <h2>{t('student.sections.my_request')}</h2>
            </div>
            {myApplication && <StatusBadge status={myApplication.status} />}
          </div>

          <form className="student-form polished-form" onSubmit={handleSubmit}>
            <label>
              <span>{t('student.fields.student_name')}</span>
              <input required name="studentName" value={form.studentName} onChange={handleChange} placeholder={t('student.fields.student_name')} />
            </label>
            <label>
              <span>{t('student.fields.student_email')}</span>
              <input required type="email" name="studentEmail" value={form.studentEmail} onChange={handleChange} placeholder={t('student.fields.student_email')} />
            </label>
            <label>
              <span>{t('student.fields.ngo_name')}</span>
              <input required name="ngoName" value={form.ngoName} onChange={handleChange} placeholder={t('student.fields.ngo_name')} />
            </label>
            <label className="full-span">
              <span>{t('student.fields.mission_description')}</span>
              <textarea required name="missionDescription" value={form.missionDescription} onChange={handleChange} placeholder={t('student.fields.mission_description')} />
            </label>
            <div className="inline-fields full-span">
              <label>
                <span>{t('student.fields.start_date')}</span>
                <input required type="date" name="startDate" value={form.startDate} onChange={handleChange} />
              </label>
              <label>
                <span>{t('student.fields.end_date')}</span>
                <input required type="date" name="endDate" value={form.endDate} onChange={handleChange} />
              </label>
              <label>
                <span>{t('student.fields.target_hours')}</span>
                <input required type="number" min="1" name="targetHours" value={form.targetHours} onChange={handleChange} placeholder={t('student.fields.target_hours')} />
              </label>
            </div>
            <button type="submit" className="table-btn primary cta-btn full-span">{t('student.actions.submit_request')}</button>
          </form>
        </section>

        <section className="workflow-card progress-card">
          <div className="section-header roomy">
            <div>
              <p className="eyebrow">{t('student.sections.progress')}</p>
              <h2>{t('student.sections.my_convention')}</h2>
            </div>
            <StatusBadge status={currentStatus} />
          </div>

          {myApplication ? (
            <div className="detail-box elevated-detail">
              <div className="detail-heading-row">
                <div>
                  <h3>{myApplication.ngoName}</h3>
                  <p>{myApplication.missionDescription}</p>
                </div>
              </div>
              <div className="detail-stat-grid">
                <div>
                  <span>{t('student.labels.period')}</span>
                  <strong>{myApplication.startDate} {t('common.date_separator')} {myApplication.endDate}</strong>
                </div>
                <div>
                  <span>{t('student.labels.target_hours')}</span>
                  <strong>{myApplication.targetHours}h</strong>
                </div>
              </div>
              <WorkflowTimeline status={currentStatus} hasConvention={Boolean(myConvention)} />
            </div>
          ) : (
            <div className="workflow-empty-state compact">
              <div className="workflow-empty-icon" aria-hidden="true">→</div>
              <h3>{t('student.empty.title')}</h3>
              <p>{t('student.empty.message')}</p>
            </div>
          )}

          {myConvention ? (
            <div className="convention-summary-card">
              <p className="eyebrow">{t('student.sections.generated_document')}</p>
              <h3>{t('student.labels.id')} #{myConvention.id}</h3>
              <dl>
                <div><dt>{t('student.labels.student')}</dt><dd>{myConvention.studentName}</dd></div>
                <div><dt>{t('student.labels.ngo')}</dt><dd>{myConvention.ngoName}</dd></div>
                <div><dt>{t('student.labels.period')}</dt><dd>{myConvention.startDate} {t('common.date_separator')} {myConvention.endDate}</dd></div>
              </dl>
            </div>
          ) : (
            <p className="helper-copy">{t('student.no_convention')}</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default StudentDashboard;
