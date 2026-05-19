import React, { useMemo } from 'react';
import { Download } from 'lucide-react';
import StatusBadge from './StatusBadge';
import WorkflowTimeline from './WorkflowTimeline';
import { useI18n } from '../../i18n/I18nContext';
import { downloadConventionPdf } from '../../utils/conventionPdf';

function EmptyState({ title, message }) {
  return (
    <div className="workflow-empty-state">
      <div className="workflow-empty-icon" aria-hidden="true">✦</div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

function AdminDashboard({ applications, conventions, onValidate, onReject }) {
  const { t } = useI18n();

  const metrics = useMemo(() => {
    const pendingRequests = applications.filter((app) => app.status === 'pending').length;
    const validatedRequests = applications.filter((app) => app.status === 'validated').length;
    const generatedConventions = conventions.length;
    const totalPlannedHours = applications.reduce((sum, app) => sum + (Number(app.targetHours) || 0), 0);

    return [
      { id: 'pending', label: t('admin.kpis.pending_requests'), value: pendingRequests, tone: 'amber' },
      { id: 'validated', label: t('admin.kpis.validated_requests'), value: validatedRequests, tone: 'teal' },
      { id: 'conventions', label: t('admin.kpis.generated_conventions'), value: generatedConventions, tone: 'blue' },
      { id: 'hours', label: t('admin.kpis.total_planned_hours'), value: totalPlannedHours, tone: 'slate' }
    ];
  }, [applications, conventions, t]);

  const conventionByApplication = useMemo(() => {
    return conventions.reduce((lookup, convention) => {
      lookup[String(convention.applicationId)] = convention;
      return lookup;
    }, {});
  }, [conventions]);

  return (
    <div className="dashboard-shell admin-dashboard-layout">
      <section className="dashboard-hero admin-hero">
        <div>
          <p className="eyebrow">{t('workflow.eyebrow')}</p>
          <h1>{t('admin.hero.title')}</h1>
          <p>{t('admin.hero.subtitle')}</p>
        </div>
        <div className="hero-workflow-card">
          <span>{t('workflow.timeline_label')}</span>
          <WorkflowTimeline status={conventions.length > 0 ? 'ready' : 'pending'} hasConvention={conventions.length > 0} />
        </div>
      </section>

      <section className="admin-kpi-grid" aria-label="KPI cards">
        {metrics.map((metric) => (
          <article key={metric.id} className={`admin-kpi-card tone-${metric.tone}`}>
            <p className="admin-kpi-label">{metric.label}</p>
            <p className="admin-kpi-value">{metric.value}</p>
          </article>
        ))}
      </section>

      <section className="workflow-card workflow-card-premium">
        <div className="section-header roomy">
          <div>
            <p className="eyebrow">{t('admin.sections.review_queue')}</p>
            <h2>{t('admin.sections.student_requests')}</h2>
          </div>
          <span className="section-count">{applications.length}</span>
        </div>

        {applications.length === 0 ? (
          <EmptyState title={t('admin.empty.requests_title')} message={t('admin.table.no_requests')} />
        ) : (
          <div className="request-card-grid">
            {applications.map((app) => {
              const linkedConvention = conventionByApplication[String(app.id)];
              return (
                <article key={app.id} className="request-card">
                  <div className="request-card-topline">
                    <div className="avatar-initials" aria-hidden="true">
                      {app.studentName?.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                    </div>
                    <div className="request-card-identity">
                      <h3>{app.studentName}</h3>
                      <p>{app.studentEmail}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>

                  <div className="request-card-body">
                    <p className="request-ngo">{app.ngoName}</p>
                    <p className="request-mission">{app.missionDescription}</p>
                    <div className="meta-row">
                      <span>{app.startDate} {t('common.date_separator')} {app.endDate}</span>
                      <span>{app.targetHours}h</span>
                    </div>
                  </div>

                  <WorkflowTimeline status={app.status} hasConvention={Boolean(linkedConvention)} />

                  <div className="card-actions">
                    <button
                      className="table-btn primary"
                      disabled={app.status !== 'pending'}
                      onClick={() => onValidate(app.id)}
                    >
                      {t('admin.actions.validate')}
                    </button>
                    <button className="table-btn secondary">{t('admin.actions.view')}</button>
                    {linkedConvention && (
                      <button
                        className="table-btn secondary"
                        onClick={() => downloadConventionPdf(linkedConvention)}
                      >
                        <Download size={15} />
                        {t('common.download_pdf')}
                      </button>
                    )}
                    <button
                      className="text-link-btn"
                      disabled={app.status !== 'pending'}
                      onClick={() => onReject(app.id)}
                    >
                      {t('admin.actions.reject')}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="workflow-card workflow-card-premium">
        <div className="section-header roomy">
          <div>
            <p className="eyebrow">{t('admin.sections.generated_packet')}</p>
            <h2>{t('admin.sections.generated_conventions')}</h2>
          </div>
          <span className="section-count">{conventions.length}</span>
        </div>

        <div className="conventions-list">
          {conventions.length === 0 && (
            <EmptyState title={t('admin.empty.conventions_title')} message={t('admin.table.no_conventions')} />
          )}
          {conventions.map((convention) => (
            <article key={convention.id} className="convention-row convention-card">
              <div className="convention-main">
                <p className="entity-primary">{convention.studentName}</p>
                <p className="entity-secondary">{convention.ngoName}</p>
              </div>
              <div className="convention-meta-stack">
                <span>{convention.startDate} {t('common.date_separator')} {convention.endDate}</span>
                <span>{convention.targetHours}h</span>
              </div>
              <StatusBadge status={convention.status} />
              <WorkflowTimeline status={convention.status} hasConvention />
              <span className="convention-id">{t('admin.conventions.id_label')} #{convention.id}</span>
              <button
                className="table-btn primary"
                onClick={() => downloadConventionPdf(convention)}
              >
                <Download size={15} />
                {t('common.download_pdf')}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
