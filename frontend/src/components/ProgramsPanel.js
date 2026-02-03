import React from 'react';
import { Heart, Leaf, Users, ChevronRight, MoreHorizontal, Sun } from 'lucide-react';

const iconMap = {
  heart: Heart,
  leaf: Leaf,
  'hands-helping': Users,
  sun: Sun,
  users: Users,
  default: Heart
};

function ProgramsPanel({ programs, loading }) {
  return (
    <div className="panel" data-testid="programs-panel">
      <div className="panel-header">
        <h2 className="panel-title">Programs</h2>
        <button className="more-btn">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="programs-list">
        {loading ? (
          <div className="loading-state">Loading programs...</div>
        ) : programs.length === 0 ? (
          <div className="empty-state">No programs for this term</div>
        ) : (
          programs.map((program) => {
            const IconComponent = iconMap[program.icon] || iconMap.default;
            return (
              <div 
                key={program.program_id} 
                className="program-item"
                data-testid={`program-${program.program_id}`}
              >
                <div className="program-icon">
                  <IconComponent size={18} />
                </div>
                <div className="program-info">
                  <span className="program-name">{program.name}</span>
                </div>
                <ChevronRight size={18} className="chevron" />
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .panel {
          background-color: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .panel-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .more-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: #6B7280;
          cursor: pointer;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .more-btn:hover {
          background-color: #F3F4F6;
        }

        .programs-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .program-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .program-item:hover {
          background-color: #F9FAFB;
        }

        .program-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background-color: #E8F5F3;
          color: #3B7073;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .program-info {
          flex: 1;
        }

        .program-name {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
        }

        .chevron {
          color: #9CA3AF;
        }

        .loading-state,
        .empty-state {
          padding: 24px;
          text-align: center;
          color: #6B7280;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

export default ProgramsPanel;
