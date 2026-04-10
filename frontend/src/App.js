import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AdminDashboard from './components/workflow/AdminDashboard';
import StudentDashboard from './components/workflow/StudentDashboard';
import NgoDashboard from './components/workflow/NgoDashboard';
import {
  getApplications,
  getConventions,
  submitApplication,
  validateApplication,
  rejectApplication
} from './api/workflowService';
import { I18nProvider } from './i18n/I18nContext';
import './App.css';

const ROLES = ['school_admin', 'student', 'ngo_admin'];

function AppContent() {
  const [currentRole, setCurrentRole] = useState('school_admin');
  const [applications, setApplications] = useState([]);
  const [conventions, setConventions] = useState([]);

  const reloadData = async () => {
    const [apps, convs] = await Promise.all([getApplications(), getConventions()]);
    setApplications(apps);
    setConventions(convs);
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleSubmitApplication = async (payload) => {
    await submitApplication(payload);
    await reloadData();
  };

  const handleValidate = async (id) => {
    await validateApplication(id);
    await reloadData();
  };

  const handleReject = async (id) => {
    await rejectApplication(id);
    await reloadData();
  };

  const roleApplications = useMemo(() => {
    if (currentRole === 'student') return applications.slice(0, 1);
    return applications;
  }, [applications, currentRole]);

  const roleConventions = useMemo(() => {
    if (currentRole === 'ngo_admin') {
      return conventions.filter((item) => item.ngoName.toLowerCase().includes('croix-rouge'));
    }
    if (currentRole === 'student') {
      const currentStudent = roleApplications[0]?.studentEmail;
      return conventions.filter((item) => item.studentEmail === currentStudent);
    }
    return conventions;
  }, [conventions, currentRole, roleApplications]);

  const renderDashboard = () => {
    if (currentRole === 'school_admin') {
      return (
        <AdminDashboard
          applications={roleApplications}
          conventions={roleConventions}
          onValidate={handleValidate}
          onReject={handleReject}
        />
      );
    }

    if (currentRole === 'student') {
      return (
        <StudentDashboard
          applications={roleApplications}
          conventions={roleConventions}
          onSubmitApplication={handleSubmitApplication}
        />
      );
    }

    return <NgoDashboard conventions={roleConventions} />;
  };

  return (
    <div className="app-container" data-testid="app-container">
      <Sidebar currentRole={currentRole} />
      <div className="main-content">
        <Topbar currentRole={currentRole} roles={ROLES} onRoleChange={setCurrentRole} />
        <div className="page-content">{renderDashboard()}</div>
      </div>
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

export default App;
