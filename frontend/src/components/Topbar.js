import React from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import './styles.css';

function Topbar({ currentRole, roles, onRoleChange }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <header className={`topbar role-${currentRole}`} data-testid="topbar">
      <div className="topbar-content">
        <h2 className="topbar-title">{t(`topbar.${currentRole}_title`)}</h2>
        <p className="topbar-subtitle">{t(`topbar.${currentRole}_subtitle`)}</p>
      </div>

      <div className="topbar-controls">
        <div className="term-selector">
          <label htmlFor="role-selector" className="selector-label">{t('topbar.role_selector_label')}</label>
          <select
            id="role-selector"
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="term-select"
            data-testid="role-selector"
          >
            {roles.map((role) => (
              <option key={role} value={role}>{t(`roles.${role}`)}</option>
            ))}
          </select>
          <ChevronDown size={16} className="term-chevron" />
        </div>

        <div className="lang-selector" data-testid="language-selector">
          <Globe size={14} />
          <label htmlFor="language-select" className="selector-label">{t('topbar.language_label')}</label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="lang-select"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
