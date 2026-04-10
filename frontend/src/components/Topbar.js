import React from 'react';
import { ChevronDown } from 'lucide-react';
import './styles.css';

const roleTitles = {
  school_admin: 'Admin Dashboard',
  student: 'Student Interface',
  ngo_admin: 'NGO Interface'
};

function Topbar({ currentRole, roles, onRoleChange }) {
  return (
    <header className="topbar" data-testid="topbar">
      <div>
        <h2 style={{ margin: 0 }}>{roleTitles[currentRole]}</h2>
        <p style={{ margin: '4px 0 0 0', color: '#6B7280' }}>
          student submits request → admin validates → convention generated
        </p>
      </div>

      <div className="term-selector">
        <select
          value={currentRole}
          onChange={(e) => onRoleChange(e.target.value)}
          className="term-select"
          data-testid="role-selector"
        >
          {roles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        <ChevronDown size={16} className="term-chevron" />
      </div>
    </header>
  );
}

export default Topbar;
