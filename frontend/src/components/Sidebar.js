import React from 'react';
import { LayoutDashboard, Heart, User, Building2 } from 'lucide-react';
import './styles.css';

const roleLabels = {
  school_admin: 'School admin',
  student: 'Student',
  ngo_admin: 'NGO admin'
};

function Sidebar({ currentRole }) {
  return (
    <aside className="sidebar" data-testid="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Heart size={28} strokeWidth={2.5} />
        </div>
        <div className="logo-text">
          <span className="logo-title">MyImpact</span>
          <span className="logo-subtitle">Sciences Po • Civic Pathway</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button className="nav-item active" type="button">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
          <div className="active-indicator" />
        </button>
      </nav>

      <div className="sidebar-role-hint">
        {currentRole === 'student' ? <User size={16} /> : <Building2 size={16} />}
        <span>Viewing as {roleLabels[currentRole]}</span>
      </div>
    </aside>
  );
}

export default Sidebar;
