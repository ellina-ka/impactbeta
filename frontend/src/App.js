import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import ActivitiesPage from './components/ActivitiesPage';
import ParticipantsPage from './components/ParticipantsPage';
import ReportsPage from './components/ReportsPage';
import AdminPage from './components/AdminPage';
import Toast from './components/Toast';
import {
  getTerms,
  getSettings,
  getKpis,
  getPrograms,
  getVerificationRequests,
  getStudents,
  confirmVerification,
  rejectVerification,
  flagVerification,
  updateSettings,
} from './api/client';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedTerm, setSelectedTerm] = useState(() => {
    return localStorage.getItem('selectedTerm') || 'spring-2026';
  });
  const [terms, setTerms] = useState([]);
  const [settings, setSettings] = useState({ university_name: '', dashboard_title: '' });
  const [kpis, setKpis] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    localStorage.setItem('selectedTerm', selectedTerm);
  }, [selectedTerm]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [termsData, settingsData] = await Promise.all([
          getTerms(),
          getSettings()
        ]);

        setTerms(termsData);
        setSettings({
          university_name: settingsData.university_name,
          dashboard_title: settingsData.dashboard_title || 'Test Pilot Dashboard'
        });
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchData();
  }, []);

  const fetchTermData = useCallback(async () => {
    setLoading(true);
    try {
      const [kpisData, programsData, vrData, studentsData] = await Promise.all([
        getKpis(selectedTerm),
        getPrograms(selectedTerm),
        getVerificationRequests(selectedTerm, 'awaiting_confirmation'),
        getStudents(selectedTerm)
      ]);

      setKpis(kpisData);
      setPrograms(programsData);
      setVerificationRequests(vrData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching term data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTerm]);

  useEffect(() => {
    fetchTermData();
  }, [fetchTermData]);

  const handleConfirm = async (requestId) => {
    try {
      const data = await confirmVerification(requestId);
      showToast(`Verified ${data.hours_added || 0} hours successfully!`, 'success');
      fetchTermData();
    } catch (error) {
      console.error('Error confirming verification:', error);
      showToast('Failed to confirm verification', 'error');
    }
  };

  const handleReject = async (requestId, reason) => {
    try {
      await rejectVerification(requestId, reason);
      showToast('Request rejected', 'warning');
      fetchTermData();
    } catch (error) {
      console.error('Error rejecting verification:', error);
      showToast('Failed to reject verification', 'error');
    }
  };

  const handleFlag = async (requestId, reason) => {
    try {
      await flagVerification(requestId, reason);
      showToast('Request flagged for review', 'warning');
      fetchTermData();
    } catch (error) {
      console.error('Error flagging verification:', error);
      showToast('Failed to flag verification', 'error');
    }
  };

  const handleSettingsUpdate = async (newSettings) => {
    try {
      const data = await updateSettings(newSettings);
      setSettings({
        university_name: data.university_name,
        dashboard_title: data.dashboard_title || 'Test Pilot Dashboard'
      });
      showToast('Settings updated', 'success');
    } catch (error) {
      console.error('Error updating settings:', error);
      showToast('Failed to update settings', 'error');
    }
  };

  const handleExport = (type) => {
    showToast(`${type} exported successfully!`, 'success');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            kpis={kpis}
            programs={programs}
            verificationRequests={verificationRequests}
            onConfirm={handleConfirm}
            onReject={handleReject}
            onFlag={handleFlag}
            loading={loading}
            settings={settings}
            selectedTerm={selectedTerm}
          />
        );
      case 'activities':
        return (
          <ActivitiesPage
            selectedTerm={selectedTerm}
            onActionComplete={(action, hours) => {
              if (action === 'confirm') {
                showToast(`Verified ${hours} hours successfully!`, 'success');
              } else if (action === 'reject') {
                showToast('Request rejected', 'warning');
              } else if (action === 'flag') {
                showToast('Request flagged for review', 'warning');
              }
              fetchTermData();
            }}
          />
        );
      case 'participants':
        return (
          <ParticipantsPage
            selectedTerm={selectedTerm}
            students={students}
            loading={loading}
            onNavigateToActivities={() => setActivePage('activities')}
          />
        );
      case 'reports':
        return (
          <ReportsPage
            selectedTerm={selectedTerm}
            terms={terms}
            onExport={handleExport}
          />
        );
      case 'admin':
        return (
          <AdminPage
            settings={settings}
            onSettingsUpdate={handleSettingsUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container" data-testid="app-container">
      <Sidebar
        activePage={activePage}
        onPageChange={setActivePage}
        settings={settings}
      />
      <div className="main-content">
        <Topbar
          terms={terms}
          selectedTerm={selectedTerm}
          onTermChange={setSelectedTerm}
        />
        <div className="page-content">
          {renderPage()}
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
