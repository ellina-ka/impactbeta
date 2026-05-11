import React from 'react';
import { ChevronDown, Globe, LogOut, UserCircle } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import './styles.css';

function Topbar({ currentRole, roles, profile, isDemoBuild, onRoleChange, onLogout }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <header className={`topbar role-${currentRole}`} data-testid="topbar">
      <div className="topbar-content">
        <h2 className="topbar-title">{t(`topbar.${currentRole}_title`)}</h2>
        <p className="topbar-subtitle">{t(`topbar.${currentRole}_subtitle`)}</p>
      </div>

      <div className="topbar-controls">
        {isDemoBuild && (
          <div className="term-selector demo-role-switcher">
            <label htmlFor="role-selector" className="selector-label">
              {t('topbar.demo_role_selector_label')}
            </label>
            <select
              id="role-selector"
              value={currentRole}
              onChange={(event) => onRoleChange(event.target.value)}
              className="term-select"
              data-testid="demo-role-selector"
            >
              {roles.map((role) => (
                <option key={role} value={role}>{t(`roles.${role}`)}</option>
              ))}
            </select>
            <ChevronDown size={16} className="term-chevron" />
          </div>
        )}

        <div className="current-user" data-testid="current-user-profile">
          <UserCircle size={18} />
          <div>
            <strong>{profile?.fullName || profile?.email}</strong>
            <span>{t(`roles.${currentRole}`)} · {profile?.email}</span>
          </div>
        </div>

        <div className="lang-selector" data-testid="language-selector">
          <Globe size={14} />
          <label htmlFor="language-select" className="selector-label">{t('topbar.language_label')}</label>
          <select
            id="language-select"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="lang-select"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>

        <button type="button" className="logout-btn" onClick={onLogout}>
          <LogOut size={16} />
          {t('topbar.logout')}
        </button>
      </div>
    </header>
  );
}

export default Topbar;
