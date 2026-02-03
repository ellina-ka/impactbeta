import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import ActivitiesPage from './components/ActivitiesPage';
import ParticipantsPage from './components/ParticipantsPage';
import ReportsPage from './components/ReportsPage';
import AdminPage from './components/AdminPage';
import Toast from './components/Toast';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedTerm, setSelectedTerm] = useState(() => {
    return localStorage.getItem('selectedTerm') || 'spring-2026';
  });
  const [terms, setTerms] = useState([]);
  const [settings, setSettings] = useState({ university_name: 'Columbia University', dashboard_title: 'Test Pilot Dashboard' });
  const [kpis, setKpis] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Persist term selection
  useEffect(() => {
    localStorage.setItem('selectedTerm', selectedTerm);
  }, [selectedTerm]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [termsRes, settingsRes] = await Promise.all([
          fetch(`${API_URL}/api/terms`),
          fetch(`${API_URL}/api/settings`)
        ]);
        
        const termsData = await termsRes.json();
        const settingsData = await settingsRes.json();
        
        setTerms(termsData);
        setSettings(settingsData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchData();
  }, []);

  // Fetch term-dependent data
  const fetchTermData = useCallback(async () => {
    setLoading(true);
    try {
      const [kpisRes, programsRes, vrRes, studentsRes] = await Promise.all([
        fetch(`${API_URL}/api/kpis?term_id=${selectedTerm}`),
        fetch(`${API_URL}/api/programs?term_id=${selectedTerm}`),
        fetch(`${API_URL}/api/verification-requests?term_id=${selectedTerm}&status=awaiting_confirmation`),
        fetch(`${API_URL}/api/students?term_id=${selectedTerm}`)
      ]);
      
      const kpisData = await kpisRes.json();
      const programsData = await programsRes.json();
      const vrData = await vrRes.json();
      const studentsData = await studentsRes.json();
      
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

  // Verification actions
  const handleConfirm = async (requestId) => {
    try {
      const response = await fetch(`${API_URL}/api/verification-requests/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId })
      });
      
      if (response.ok) {
        const data = await response.json();
        showToast(`Verified ${data.hours_added} hours successfully!`, 'success');
        fetchTermData();
      }
    } catch (error) {
      console.error('Error confirming verification:', error);
      showToast('Failed to confirm verification', 'error');
    }
  };

  const handleReject = async (requestId, reason) => {
    try {
      const response = await fetch(`${API_URL}/api/verification-requests/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, reason })
      });
      
      if (response.ok) {
        showToast('Request rejected', 'warning');
        fetchTermData();
      }
    } catch (error) {
      console.error('Error rejecting verification:', error);
      showToast('Failed to reject verification', 'error');
    }
  };

  const handleFlag = async (requestId, reason) => {
    try {
      const response = await fetch(`${API_URL}/api/verification-requests/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, reason })
      });
      
      if (response.ok) {
        showToast('Request flagged for review', 'warning');
        fetchTermData();
      }
    } catch (error) {
      console.error('Error flagging verification:', error);
      showToast('Failed to flag verification', 'error');
    }
  };

  const handleSettingsUpdate = async (newSettings) => {
    try {
      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        showToast('Settings updated', 'success');
      }
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
        return <ActivitiesPage selectedTerm={selectedTerm} />;
      case 'participants':
        return (
          <ParticipantsPage 
            selectedTerm={selectedTerm} 
            students={students}
            loading={loading}
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
