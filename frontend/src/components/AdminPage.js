import React, { useEffect, useState } from 'react';
import { Settings, Save, Check, Shield, Users } from 'lucide-react';
import './styles.css';

const DEFAULT_AUTH_SETTINGS = {
  ssoEnabled: true,
  mfaRequired: false,
  inviteOnly: true,
};

const DEFAULT_ROLES = {
  lio: 'Program Manager',
  ellina: 'Platform Manager',
};

function AdminPage({ settings, onSettingsUpdate }) {
  const [universityName, setUniversityName] = useState(settings.university_name);
  const [dashboardTitle, setDashboardTitle] = useState(settings.dashboard_title || '');
  const [authSettings, setAuthSettings] = useState(DEFAULT_AUTH_SETTINGS);
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setUniversityName(settings.university_name);
    setDashboardTitle(settings.dashboard_title || '');
  }, [settings]);

  const showSavedState = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSave = () => {
    onSettingsUpdate({
      university_name: universityName,
      dashboard_title: dashboardTitle
    });
    showSavedState();
  };

  const handleAuthToggle = (key) => {
    setAuthSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRoleChange = (admin, role) => {
    setRoles((prev) => ({ ...prev, [admin]: role }));
  };

  return (
    <div className="page" data-testid="admin-page">
      <div className="page-header">
        <h1 className="page-title">Admin Settings</h1>
        <p className="page-subtitle">Configure your university dashboard</p>
      </div>

      <div className="settings-section">
        <div className="section-header">
          <Settings size={20} />
          <h2>Tenant Configuration</h2>
        </div>

        <div className="settings-card">
          <div className="setting-item">
            <label htmlFor="universityName">University Name</label>
            <p className="setting-description">
              This name appears in the dashboard header and exports.
            </p>
            <div className="input-group">
              <input
                id="universityName"
                type="text"
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                placeholder="Enter university name"
                data-testid="university-name-input"
              />
              <button
                className={`save-btn ${saved ? 'saved' : ''}`}
                onClick={handleSave}
                disabled={
                  universityName === settings.university_name &&
                  dashboardTitle === (settings.dashboard_title || '')
                }
                data-testid="save-settings-btn"
              >
                {saved ? (
                  <><Check size={16} /> Saved</>
                ) : (
                  <><Save size={16} /> Save</>
                )}
              </button>
            </div>
          </div>

          <div className="setting-item">
            <label htmlFor="dashboardTitle">Dashboard Title</label>
            <p className="setting-description">
              This title appears in the dashboard header.
            </p>
            <div className="input-group">
              <input
                id="dashboardTitle"
                type="text"
                value={dashboardTitle}
                onChange={(e) => setDashboardTitle(e.target.value)}
                placeholder="Enter dashboard title"
                data-testid="dashboard-title-input"
              />
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="section-header compact">
            <Shield size={18} />
            <h3>Authentication Settings (Demo)</h3>
          </div>
          <p className="setting-description">Enable simple frontend-only auth controls for prototype demos.</p>

          <div className="setting-item setting-toggle-row" data-testid="auth-sso-toggle">
            <div>
              <label>Single Sign-On (SSO)</label>
              <p className="setting-description">Allow sign-in through your organization identity provider.</p>
            </div>
            <button className={`toggle-btn ${authSettings.ssoEnabled ? 'on' : ''}`} onClick={() => handleAuthToggle('ssoEnabled')}>
              {authSettings.ssoEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="setting-item setting-toggle-row" data-testid="auth-mfa-toggle">
            <div>
              <label>Require MFA</label>
              <p className="setting-description">Require two-factor authentication for admin users.</p>
            </div>
            <button className={`toggle-btn ${authSettings.mfaRequired ? 'on' : ''}`} onClick={() => handleAuthToggle('mfaRequired')}>
              {authSettings.mfaRequired ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="setting-item setting-toggle-row" data-testid="auth-invite-toggle">
            <div>
              <label>Invite-only Access</label>
              <p className="setting-description">Only invited users can access admin features.</p>
            </div>
            <button className={`toggle-btn ${authSettings.inviteOnly ? 'on' : ''}`} onClick={() => handleAuthToggle('inviteOnly')}>
              {authSettings.inviteOnly ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        <div className="settings-card">
          <div className="section-header compact">
            <Users size={18} />
            <h3>Role Management (Demo)</h3>
          </div>
          <p className="setting-description">Assign demo roles and permissions for the two admin profiles.</p>

          <div className="setting-item role-grid" data-testid="role-management-grid">
            <div className="role-row">
              <label htmlFor="role-ellina">Ellina Khrais-Azibi</label>
              <select id="role-ellina" value={roles.ellina} onChange={(e) => handleRoleChange('ellina', e.target.value)}>
                <option>Platform Manager</option>
                <option>Program Manager</option>
              </select>
            </div>
            <div className="role-row">
              <label htmlFor="role-lio">Lio Elalouf</label>
              <select id="role-lio" value={roles.lio} onChange={(e) => handleRoleChange('lio', e.target.value)}>
                <option>Platform Manager</option>
                <option>Program Manager</option>
              </select>
            </div>
          </div>

          <button className={`save-btn ${saved ? 'saved' : ''}`} onClick={showSavedState} data-testid="save-role-settings-btn">
            {saved ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save Demo Role Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
