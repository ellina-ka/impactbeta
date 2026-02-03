import React, { useState } from 'react';
import { Search, Bell, MessageSquare, ChevronDown } from 'lucide-react';
import './styles.css';

function Topbar({ terms, selectedTerm, onTermChange }) {
  const [tooltip, setTooltip] = useState(null);

  const admins = [
    { id: 'ellina', name: 'Ellina', role: 'Program Admin', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' },
    { id: 'lio', name: 'Lio', role: 'Platform Admin', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' }
  ];

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
          {admins.map((admin, index) => (
            <div 
              key={admin.id}
              className={`avatar ${index > 0 ? 'secondary' : ''}`}
              data-testid={`avatar-${admin.id}`}
              onMouseEnter={() => setTooltip(admin.id)}
              onMouseLeave={() => setTooltip(null)}
            >
              <img src={admin.image} alt={admin.name} />
              {tooltip === admin.id && (
                <div className="avatar-tooltip">
                  <strong>{admin.name}</strong>
                  <span>{admin.role}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
