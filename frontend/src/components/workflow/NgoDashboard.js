import React from 'react';
import { Download } from 'lucide-react';
import StatusBadge from './StatusBadge';
import WorkflowTimeline from './WorkflowTimeline';
import { useI18n } from '../../i18n/I18nContext';
import { downloadConventionPdf } from '../../utils/conventionPdf';

function NgoDashboard({ conventions, onSignConvention }) {
  const { t } = useI18n();
  const readyCount = conventions.filter((convention) => convention.status === 'ready').length;

  return (
    <div className="dashboard-shell ngo-dashboard">
      <section className="dashboard-hero ngo-hero">
        <div>
          <p className="eyebrow">{t('workflow.eyebrow')}</p>
          <h1>{t('ngo.hero.title')}</h1>
          <p>{t('ngo.hero.subtitle')}</p>
        </div>
        <div className="hero-stat-card">
          <span>{t('ngo.hero.ready_label')}</span>
          <strong>{readyCount}</strong>
        </div>
      </section>

      <section className="workflow-card workflow-card-premium ngo-panel">
        <div className="section-header roomy">
          <div>
            <p className="eyebrow">{t('ngo.sections.signature_queue')}</p>
            <h2>{t('ngo.section_title')}</h2>
          </div>
          <span className="section-count">{conventions.length}</span>
        </div>

        {conventions.length === 0 ? (
          <div className="workflow-empty-state">
            <div className="workflow-empty-icon" aria-hidden="true">✓</div>
            <h3>{t('ngo.empty.title')}</h3>
            <p>{t('ngo.no_conventions')}</p>
          </div>
        ) : (
          <div className="ngo-convention-grid">
            {conventions.map((convention) => (
              <article key={convention.id} className="ngo-convention-card">
                <div className="ngo-card-header">
                  <div>
                    <p className="eyebrow">{t('ngo.labels.convention')} #{convention.id}</p>
                    <h3>{convention.studentName}</h3>
                    <p>{convention.studentEmail}</p>
                  </div>
                  <StatusBadge status={convention.status} />
                </div>

                <div className="mission-panel">
                  <span>{convention.ngoName}</span>
                  <p>{convention.missionDescription}</p>
                </div>

                <div className="detail-stat-grid">
                  <div>
                    <span>{t('ngo.labels.dates')}</span>
                    <strong>{convention.startDate} {t('common.date_separator')} {convention.endDate}</strong>
                  </div>
                  <div>
                    <span>{t('ngo.labels.target_hours')}</span>
                    <strong>{convention.targetHours}h</strong>
                  </div>
                </div>

                <WorkflowTimeline status={convention.status} />

                <div className="ngo-actions">
                  <button
                    className="table-btn primary cta-btn"
                    disabled={convention.status !== 'ready'}
                    onClick={() => onSignConvention(convention.id)}
                  >
                    {convention.status === 'signed' ? t('ngo.actions.signed') : t('ngo.actions.ready_to_sign')}
                  </button>
                  <button
                    className="table-btn secondary"
                    onClick={() => downloadConventionPdf(convention)}
                  >
                    <Download size={15} />
                    {t('common.download_pdf')}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default NgoDashboard;
