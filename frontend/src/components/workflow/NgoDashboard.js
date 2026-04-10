import React from 'react';
import StatusBadge from './StatusBadge';
import { useI18n } from '../../i18n/I18nContext';

function NgoDashboard({ conventions }) {
  const { t } = useI18n();

  return (
    <div className="workflow-layout">
      <section className="workflow-card">
        <h2>{t('ngo.section_title')}</h2>
        {conventions.length === 0 && <p>{t('ngo.no_conventions')}</p>}
        {conventions.map((convention) => (
          <div key={convention.id} className="detail-box">
            <p><strong>{convention.ngoName}</strong></p>
            <p><strong>{t('ngo.labels.convention')}:</strong> {convention.id}</p>
            <p><strong>{t('ngo.labels.student')}:</strong> {convention.studentName} ({convention.studentEmail})</p>
            <p><strong>{t('ngo.labels.mission')}:</strong> {convention.missionDescription}</p>
            <p><strong>{t('ngo.labels.dates')}:</strong> {convention.startDate} {t('common.date_separator')} {convention.endDate}</p>
            <p><strong>{t('ngo.labels.target_hours')}:</strong> {convention.targetHours}</p>
            <div className="ngo-actions">
              <StatusBadge status={convention.status} />
              <button className="table-btn">{t('ngo.actions.ready_to_sign')}</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default NgoDashboard;
