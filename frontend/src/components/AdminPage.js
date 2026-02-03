import React, { useState } from 'react';
import { Settings, Save, Check } from 'lucide-react';
import './styles.css';

function AdminPage({ settings, onSettingsUpdate }) {
  const [universityName, setUniversityName] = useState(settings.university_name);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSettingsUpdate({ university_name: universityName });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
                disabled={universityName === settings.university_name}
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
        </div>

        {/* Future Auth Settings Placeholder */}
        <div className="settings-card future">
          <div className="setting-item">
            <label>Authentication Settings</label>
            <p className="setting-description">
              Configure SSO and user authentication. <span className="coming-soon">Coming Soon</span>
            </p>
            {/* TODO: Add authentication configuration */}
          </div>
        </div>

        {/* Future Role Management Placeholder */}
        <div className="settings-card future">
          <div className="setting-item">
            <label>Role Management</label>
            <p className="setting-description">
              Manage admin roles and permissions. <span className="coming-soon">Coming Soon</span>
            </p>
            {/* TODO: Add role management */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
