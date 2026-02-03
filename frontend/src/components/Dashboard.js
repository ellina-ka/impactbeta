import React from 'react';
import KPICard from './KPICard';
import ProgramsPanel from './ProgramsPanel';
import VerificationPanel from './VerificationPanel';

function Dashboard({ 
  kpis, 
  programs, 
  verificationRequests, 
  onConfirm, 
  onReject, 
  onFlag, 
  loading,
  universityName 
}) {
  return (
    <div className="dashboard" data-testid="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title" data-testid="dashboard-title">
          {universityName} Impact Dashboard
        </h1>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" data-testid="kpi-grid">
        <KPICard
          title="Verified Hours"
          value={kpis?.verified_hours?.value || 0}
          delta={kpis?.verified_hours?.delta || ''}
          variant="green"
          loading={loading}
          testId="kpi-verified-hours"
        />
        <KPICard
          title="Active Students"
          value={kpis?.active_students?.value || 0}
          delta={kpis?.active_students?.delta || ''}
          variant="blue"
          loading={loading}
          testId="kpi-active-students"
        />
        <KPICard
          title="Active Programs"
          value={kpis?.active_programs?.value || 0}
          delta={kpis?.active_programs?.delta || ''}
          variant="cream"
          loading={loading}
          testId="kpi-active-programs"
        />
        <KPICard
          title="Avg Retention Rate"
          value={kpis?.retention_rate?.value || 0}
          delta={kpis?.retention_rate?.delta || ''}
          variant="teal"
          isPercentage
          loading={loading}
          testId="kpi-retention-rate"
        />
      </div>

      {/* Two-Panel Section */}
      <div className="panels-grid">
        <ProgramsPanel programs={programs} loading={loading} />
        <VerificationPanel
          requests={verificationRequests}
          onConfirm={onConfirm}
          onReject={onReject}
          onFlag={onFlag}
          loading={loading}
        />
      </div>

      <style jsx>{`
        .dashboard {
          max-width: 1400px;
        }

        .dashboard-header {
          margin-bottom: 24px;
        }

        .dashboard-title {
          font-size: 24px;
          font-weight: 600;
          color: #111827;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .panels-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 24px;
        }

        @media (max-width: 1200px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .panels-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .kpi-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
