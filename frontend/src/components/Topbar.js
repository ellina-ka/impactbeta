import React, { useState } from 'react';
import { Search, Bell, MessageSquare, ChevronDown, X, Mail, Shield, Calendar } from 'lucide-react';
import './styles.css';

const ADMIN_ASSET_VERSION = process.env.REACT_APP_ADMIN_ASSET_VERSION || '20260205';
const publicAssetPath = (path) => `${process.env.PUBLIC_URL || ''}${path}?v=${ADMIN_ASSET_VERSION}`;

const ADMINS = [
  { 
    id: 'lio', 
    name: 'Lio Elalouf', 
    role: 'Program Manager',
    email: 'lio@myimpact.org',
    department: 'Technology',
    joinedDate: 'Sep 2024',
    permissions: ['Verify Hours', 'Export Reports', 'Manage Programs'],
    image: publicAssetPath('/admins/lio.png'),
    fallbackImage: publicAssetPath('/admins/lio.png')
  },
  { 
    id: 'ellina', 
    name: 'Ellina Khrais-Azibi', 
    role: 'Platform Manager',
    email: 'ellina@myimpact.org',
    department: 'Student Services',
    joinedDate: 'Sep 2024',
    permissions: ['Full Access', 'System Settings', 'User Management'],
    image: publicAssetPath('/admins/ellina.png'),
    fallbackImage: publicAssetPath('/admins/ellina.png')
  }
];

function Topbar({ terms, selectedTerm, onTermChange }) {
  const [tooltip, setTooltip] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  return (
    <header className="topbar" data-testid="topbar">
      {/* Search */}
      <div className="search-container">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search students, programs..."
          className="search-input"
          data-testid="search-input"
        />
      </div>

      {/* Right Section */}
      <div className="topbar-right">
        {/* Term Selector */}
        <div className="term-selector">
          <select
            value={selectedTerm}
            onChange={(e) => onTermChange(e.target.value)}
            className="term-select"
            data-testid="term-selector"
          >
            {terms.map((term) => (
              <option key={term.term_id} value={term.term_id}>
                {term.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="term-chevron" />
        </div>

        {/* Icons */}
        <button className="icon-btn" data-testid="notifications-btn">
          <Bell size={20} />
        </button>
        
        <button className="icon-btn message-btn" data-testid="messages-btn">
          <MessageSquare size={20} />
          <span className="badge">3</span>
        </button>

        {/* Admin Avatars */}
        <div className="avatar-group">
          {ADMINS.map((admin, index) => (
            <div 
              key={admin.id}
              className={`avatar clickable ${index > 0 ? 'secondary' : ''}`}
              data-testid={`avatar-${admin.id}`}
              onMouseEnter={() => setTooltip(admin.id)}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => setSelectedAdmin(admin)}
            >
              <img
                src={admin.image}
                alt={admin.name}
                onError={(e) => {
                  if (admin.fallbackImage) {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = admin.fallbackImage;
                  }
                }}
              />
              {tooltip === admin.id && !selectedAdmin && (
                <div className="avatar-tooltip">
                  <strong>{admin.name}</strong>
                  <span>{admin.role}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Admin Profile Modal */}
      {selectedAdmin && (
        <div className="modal-overlay" onClick={() => setSelectedAdmin(null)}>
          <div className="modal admin-modal" onClick={(e) => e.stopPropagation()} data-testid="admin-profile-modal">
            <div className="modal-header">
              <h3>Admin Profile</h3>
              <button className="close-btn" onClick={() => setSelectedAdmin(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {/* Profile Header */}
              <div className="admin-profile-header">
                <img 
                  src={selectedAdmin.image} 
                  alt={selectedAdmin.name}
                  className="admin-profile-image"
                  onError={(e) => {
                    if (selectedAdmin.fallbackImage) {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = selectedAdmin.fallbackImage;
                    }
                  }}
                />
                <div className="admin-profile-info">
                  <h4>{selectedAdmin.name}</h4>
                  <span className="admin-role-badge">{selectedAdmin.role}</span>
                </div>
              </div>

              {/* Profile Details */}
              <div className="admin-details">
                <div className="admin-detail-item">
                  <Mail size={16} />
                  <div>
                    <label>Email</label>
                    <p>{selectedAdmin.email}</p>
                  </div>
                </div>
                <div className="admin-detail-item">
                  <Shield size={16} />
                  <div>
                    <label>Department</label>
                    <p>{selectedAdmin.department}</p>
                  </div>
                </div>
                <div className="admin-detail-item">
                  <Calendar size={16} />
                  <div>
                    <label>Joined</label>
                    <p>{selectedAdmin.joinedDate}</p>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="admin-permissions">
                <h5>Permissions</h5>
                <div className="permission-tags">
                  {selectedAdmin.permissions.map((perm, i) => (
                    <span key={i} className="permission-tag">{perm}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Topbar;
