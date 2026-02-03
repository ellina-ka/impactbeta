import React from 'react';
import { Search, Bell, MessageSquare, ChevronDown } from 'lucide-react';
import './styles.css';

function Topbar({ terms, selectedTerm, onTermChange }) {
  return (
    <header className="topbar" data-testid="topbar">
      {/* Search */}
      <div className="search-container">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search..."
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

        {/* Avatar */}
        <div className="avatar-group">
          <div className="avatar" data-testid="user-avatar">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" 
              alt="Admin"
            />
          </div>
          <div className="avatar secondary">
            <img 
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" 
              alt="User"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
