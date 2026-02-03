import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import ActivitiesPage from './components/ActivitiesPage';
import ParticipantsPage from './components/ParticipantsPage';
import ReportsPage from './components/ReportsPage';
import AdminPage from './components/AdminPage';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedTerm, setSelectedTerm] = useState(() => {
    return localStorage.getItem('selectedTerm') || 'spring-2026';
  });
  const [terms, setTerms] = useState([]);
  const [settings, setSettings] = useState({ university_name: 'Columbia University' });
  const [kpis, setKpis] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const [kpisRes, programsRes, vrRes] = await Promise.all([
        fetch(`${API_URL}/api/kpis?term_id=${selectedTerm}`),
        fetch(`${API_URL}/api/programs?term_id=${selectedTerm}`),
        fetch(`${API_URL}/api/verification-requests?term_id=${selectedTerm}&status=awaiting_confirmation`)
      ]);
      
      const kpisData = await kpisRes.json();
      const programsData = await programsRes.json();
      const vrData = await vrRes.json();
      
      setKpis(kpisData);
      setPrograms(programsData);
      setVerificationRequests(vrData);
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
        // Refresh data after confirmation
        fetchTermData();
      }
    } catch (error) {
      console.error('Error confirming verification:', error);
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
        fetchTermData();
      }
    } catch (error) {
      console.error('Error rejecting verification:', error);
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
        fetchTermData();
      }
    } catch (error) {
      console.error('Error flagging verification:', error);
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
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
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
            universityName={settings.university_name}
          />
        );
      case 'activities':
        return <ActivitiesPage selectedTerm={selectedTerm} />;
      case 'participants':
        return <ParticipantsPage selectedTerm={selectedTerm} />;
      case 'reports':
        return <ReportsPage selectedTerm={selectedTerm} terms={terms} />;
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
    </div>
  );
}

export default App;
