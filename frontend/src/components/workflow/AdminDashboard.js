import React, { useMemo } from 'react';
import StatusBadge from './StatusBadge';
import { useI18n } from '../../i18n/I18nContext';

function AdminDashboard({ applications, conventions, onValidate, onReject }) {
  const { t } = useI18n();

  const metrics = useMemo(() => {
    const pendingRequests = applications.filter((app) => app.status === 'pending').length;
    const validatedRequests = applications.filter((app) => app.status === 'validated').length;
    const generatedConventions = conventions.length;
    const totalPlannedHours = applications.reduce((sum, app) => sum + (Number(app.targetHours) || 0), 0);

    return [
      { id: 'pending', label: t('admin.kpis.pending_requests'), value: pendingRequests },
      { id: 'validated', label: t('admin.kpis.validated_requests'), value: validatedRequests },
      { id: 'conventions', label: t('admin.kpis.generated_conventions'), value: generatedConventions },
      { id: 'hours', label: t('admin.kpis.total_planned_hours'), value: totalPlannedHours }
    ];
  }, [applications, conventions, t]);

  return (
    <div className="admin-dashboard-layout">
      <section className="admin-kpi-grid" aria-label="KPI cards">
        {metrics.map((metric) => (
          <article key={metric.id} className="admin-kpi-card">
            <p className="admin-kpi-label">{metric.label}</p>
            <p className="admin-kpi-value">{metric.value}</p>
          </article>
        ))}
      </section>

      <section className="workflow-card workflow-card-premium">
        <div className="section-header">
          <h2>{t('admin.sections.student_requests')}</h2>
        </div>

        <div className="admin-table-wrapper">
          <table className="workflow-table admin-table">
            <thead>
              <tr>
                <th>{t('admin.table.student')}</th>
                <th>{t('admin.table.ngo')}</th>
                <th>{t('admin.table.mission')}</th>
                <th>{t('admin.table.dates')}</th>
                <th>{t('admin.table.hours')}</th>
                <th>{t('admin.table.status')}</th>
                <th>{t('admin.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 && (
                <tr>
                  <td colSpan={7} className="table-empty-message">{t('admin.table.no_requests')}</td>
                </tr>
              )}
              {applications.map((app) => (
                <tr key={app.id}>
                  <td className="cell-student">
                    <span className="entity-primary">{app.studentName}</span>
                    <span className="entity-secondary">{app.studentEmail}</span>
                  </td>
                  <td>
                    <span className="entity-primary">{app.ngoName}</span>
                  </td>
                  <td>
                    <span className="mission-text">{app.missionDescription}</span>
                  </td>
                  <td>{app.startDate} {t('common.date_separator')} {app.endDate}</td>
                  <td>{app.targetHours}</td>
                  <td><StatusBadge status={app.status} /></td>
                  <td className="actions-cell premium-actions">
                    <button
                      className="table-btn success primary"
                      disabled={app.status !== 'pending'}
                      onClick={() => onValidate(app.id)}
                    >
                      {t('admin.actions.validate')}
                    </button>
                    <button className="table-btn secondary">{t('admin.actions.view')}</button>
                    <button
                      className="text-link-btn"
                      disabled={app.status !== 'pending'}
                      onClick={() => onReject(app.id)}
                    >
                      {t('admin.actions.reject')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="workflow-card workflow-card-premium">
        <div className="section-header">
          <h2>{t('admin.sections.generated_conventions')}</h2>
        </div>

        <div className="conventions-list">
          {conventions.length === 0 && (
            <p className="table-empty-message standalone">{t('admin.table.no_conventions')}</p>
          )}
          {conventions.map((convention) => (
            <article key={convention.id} className="convention-row">
              <div className="convention-main">
                <p className="entity-primary">{convention.studentName}</p>
                <p className="entity-secondary">{convention.ngoName}</p>
              </div>
              <div className="convention-period">
                {convention.startDate} {t('common.date_separator')} {convention.endDate}
              </div>
              <div className="convention-hours">{convention.targetHours}h</div>
              <StatusBadge status={convention.status} />
              <span className="convention-id">{t('admin.conventions.id_label')} #{convention.id}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
