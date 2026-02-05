import React, { useState } from 'react';
import KPICard from './KPICard';
import ProgramsPanel from './ProgramsPanel';
import VerificationPanel from './VerificationPanel';
import ProgramModal from './ProgramModal';
import './styles.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

function Dashboard({ 
  kpis, 
  programs, 
  verificationRequests, 
  onConfirm, 
  onReject, 
  onFlag, 
  loading,
  settings,
  selectedTerm
}) {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programDetails, setProgramDetails] = useState(null);
  const [loadingProgram, setLoadingProgram] = useState(false);

  const handleProgramClick = async (programId) => {
    setLoadingProgram(true);
    try {
      const response = await fetch(`${API_URL}/api/programs/${programId}`);
      const data = await response.json();
      setProgramDetails(data);
      setSelectedProgram(programId);
    } catch (error) {
      console.error('Error fetching program details:', error);
    } finally {
      setLoadingProgram(false);
    }
  };

  const closeModal = () => {
    setSelectedProgram(null);
    setProgramDetails(null);
  };

  const brandingLabel = [settings?.university_name, settings?.dashboard_title]
    .filter(Boolean)
    .join(' – ');

  return (
    <div className="dashboard" data-testid="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title" data-testid="dashboard-title">
          {brandingLabel}
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
          title="Completion Rate"
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
        <ProgramsPanel 
          programs={programs} 
          loading={loading} 
          onProgramClick={handleProgramClick}
        />
        <VerificationPanel
          requests={verificationRequests}
          onConfirm={onConfirm}
          onReject={onReject}
          onFlag={onFlag}
          loading={loading}
        />
      </div>

      {/* Program Details Modal */}
      {selectedProgram && (
        <ProgramModal
          program={programDetails}
          loading={loadingProgram}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default Dashboard;
