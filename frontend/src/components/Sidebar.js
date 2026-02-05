import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  Settings,
  Heart
} from 'lucide-react';
import './styles.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'activities', label: 'Activities', icon: Calendar },
  { id: 'participants', label: 'Participants', icon: Users },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'admin', label: 'Admin', icon: Settings },
];

function Sidebar({ activePage, onPageChange, settings }) {
  return (
    <aside className="sidebar" data-testid="sidebar">
      {/* Logo Area */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Heart size={28} strokeWidth={2.5} />
        </div>
        <div className="logo-text">
          <span className="logo-title">{settings?.dashboard_title}</span>
          <span className="logo-subtitle">{settings?.university_name}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onPageChange(item.id)}
              data-testid={`nav-${item.id}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {isActive && <div className="active-indicator" />}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
