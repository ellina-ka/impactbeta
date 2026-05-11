import React from 'react';
import StatusBadge from './StatusBadge';
import { useI18n } from '../../i18n/I18nContext';

const WORKFLOW_STEPS = ['submit', 'validate', 'generate', 'sign', 'complete'];

function getWorkflowProgress(status) {
  if (status === 'active' || status === 'complete' || status === 'completed') return 5;
  if (status === 'signed') return 4;
  if (status === 'ready') return 3;
  if (status === 'validated') return 2;
  return 1;
}

function WorkflowTimeline({ status }) {
  const { t } = useI18n();
  const progress = getWorkflowProgress(status);

  return (
    <ol className="workflow-timeline" aria-label={t('workflow.timeline_label')}>
      {WORKFLOW_STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const state = stepNumber < progress ? 'complete' : stepNumber === progress ? 'current' : 'upcoming';
        return (
          <li key={step} className={`workflow-step ${state}`}>
            <span className="workflow-step-dot" aria-hidden="true" />
            <span className="workflow-step-label">{t(`workflow.steps.${step}`)}</span>
          </li>
        );
      })}
    </ol>
  );
}

function NgoDashboard({ conventions }) {
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
                  <button className="table-btn primary cta-btn">{t('ngo.actions.ready_to_sign')}</button>
                  <button className="table-btn secondary">{t('admin.actions.view')}</button>
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
