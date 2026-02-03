import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  Settings,
  Heart
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'activities', label: 'Activities', icon: Calendar },
  { id: 'participants', label: 'Participants', icon: Users },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'admin', label: 'Admin', icon: Settings },
];

function Sidebar({ activePage, onPageChange }) {
  return (
    <aside className="sidebar" data-testid="sidebar">
      {/* Logo Area */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Heart size={28} strokeWidth={2.5} />
        </div>
        <div className="logo-text">
          <span className="logo-title">MyImpact</span>
          <span className="logo-subtitle">Impact tracking platform</span>
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

      <style jsx>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 240px;
          background-color: #1D4648;
          display: flex;
          flex-direction: column;
          z-index: 100;
        }

        .sidebar-logo {
          padding: 24px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo-icon {
          width: 44px;
          height: 44px;
          background-color: #3B7073;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          color: white;
          font-size: 18px;
          font-weight: 600;
          line-height: 1.2;
        }

        .logo-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 11px;
          font-weight: 400;
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
        }

        .nav-item:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .nav-item.active {
          background-color: rgba(255, 255, 255, 0.15);
          color: white;
        }

        .active-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          background-color: white;
          border-radius: 0 2px 2px 0;
        }

        @media (max-width: 1024px) {
          .sidebar {
            width: 72px;
          }
          
          .logo-text, .nav-item span {
            display: none;
          }
          
          .sidebar-logo {
            justify-content: center;
            padding: 20px 12px;
          }
          
          .nav-item {
            justify-content: center;
            padding: 12px;
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}

export default Sidebar;
