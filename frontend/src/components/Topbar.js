import React from 'react';
import { Search, Bell, MessageSquare, ChevronDown } from 'lucide-react';

function Topbar({ terms, selectedTerm, onTermChange }) {
  const selectedTermData = terms.find(t => t.term_id === selectedTerm);

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

      <style jsx>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 32px;
          background-color: white;
          border-bottom: 1px solid #E5E7EB;
        }

        .search-container {
          position: relative;
          width: 320px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9CA3AF;
        }

        .search-input {
          width: 100%;
          padding: 10px 12px 10px 40px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-size: 14px;
          background-color: #F9FAFB;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #3B7073;
          background-color: white;
        }

        .search-input::placeholder {
          color: #9CA3AF;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .term-selector {
          position: relative;
          display: flex;
          align-items: center;
        }

        .term-select {
          appearance: none;
          padding: 8px 32px 8px 12px;
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          background-color: white;
          cursor: pointer;
        }

        .term-select:focus {
          outline: none;
          border-color: #3B7073;
        }

        .term-chevron {
          position: absolute;
          right: 10px;
          pointer-events: none;
          color: #6B7280;
        }

        .icon-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          background: transparent;
          color: #6B7280;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background-color: #F3F4F6;
          color: #374151;
        }

        .message-btn .badge {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 16px;
          height: 16px;
          background-color: #EF4444;
          color: white;
          font-size: 10px;
          font-weight: 600;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-group {
          display: flex;
          align-items: center;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .avatar.secondary {
          margin-left: -12px;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        @media (max-width: 768px) {
          .topbar {
            padding: 12px 16px;
          }

          .search-container {
            width: 200px;
          }

          .term-selector {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}

export default Topbar;
