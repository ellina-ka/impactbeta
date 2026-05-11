import React from 'react';
import { LayoutDashboard, Heart, User, Building2, ShieldCheck } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import './styles.css';

function Sidebar({ currentRole }) {
  const { t } = useI18n();
  const RoleIcon = currentRole === 'student' ? User : currentRole === 'ngo_admin' ? Building2 : ShieldCheck;

  return (
    <aside className="sidebar" data-testid="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Heart size={22} strokeWidth={2.5} />
        </div>
        <div className="logo-text">
          <span className="logo-title">MyImpact</span>
          <span className="logo-subtitle">Sciences Po • Civic Pathway</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button className="nav-item active" type="button">
          <LayoutDashboard size={18} />
          <span>{t('sidebar.dashboard')}</span>
          <div className="active-indicator" />
        </button>
      </nav>

      <div className="sidebar-role-hint">
        <RoleIcon size={15} />
        <span>{t('sidebar.viewing_as', { role: t(`roles.${currentRole}`) })}</span>
      </div>
    </aside>
  );
}

export default Sidebar;
