import React, { useState } from 'react';
import { Settings, Save, Check } from 'lucide-react';

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

      <style jsx>{`
        .page {
          max-width: 800px;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-title {
          font-size: 24px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }

        .page-subtitle {
          font-size: 14px;
          color: #6B7280;
        }

        .settings-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          color: #1D4648;
        }

        .section-header h2 {
          font-size: 18px;
          font-weight: 600;
        }

        .settings-card {
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .settings-card.future {
          opacity: 0.6;
        }

        .setting-item label {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          display: block;
          margin-bottom: 4px;
        }

        .setting-description {
          font-size: 13px;
          color: #6B7280;
          margin-bottom: 12px;
        }

        .coming-soon {
          display: inline-block;
          padding: 2px 8px;
          background-color: #FEF3C7;
          color: #92400E;
          font-size: 11px;
          font-weight: 500;
          border-radius: 4px;
          margin-left: 8px;
        }

        .input-group {
          display: flex;
          gap: 12px;
        }

        .input-group input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #D1D5DB;
          border-radius: 8px;
          font-size: 14px;
          color: #374151;
        }

        .input-group input:focus {
          outline: none;
          border-color: #3B7073;
        }

        .save-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          background-color: #3B7073;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .save-btn:hover:not(:disabled) {
          background-color: #1D4648;
        }

        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .save-btn.saved {
          background-color: #10B981;
        }
      `}</style>
    </div>
  );
}

export default AdminPage;
