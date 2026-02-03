import React from 'react';
import { Heart, Leaf, Users, ChevronRight, MoreHorizontal, Sun } from 'lucide-react';
import './styles.css';

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
    </div>
  );
}

export default ProgramsPanel;
