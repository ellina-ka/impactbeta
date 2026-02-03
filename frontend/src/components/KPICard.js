import React from 'react';
import './styles.css';

const variants = {
  green: {
    bg: '#628C84',
    text: 'white',
    delta: 'rgba(255, 255, 255, 0.8)'
  },
  blue: {
    bg: '#D8E7F3',
    text: '#1D4648',
    delta: '#6B7280'
  },
  cream: {
    bg: '#FBF6EE',
    text: '#1D4648',
    delta: '#6B7280'
  },
  teal: {
    bg: '#3B7073',
    text: 'white',
    delta: 'rgba(255, 255, 255, 0.8)'
  }
};

function KPICard({ title, value, delta, variant = 'green', isPercentage = false, loading, testId }) {
  const colors = variants[variant];
  
  const formatValue = (val) => {
    if (loading) return '---';
    if (isPercentage) return `${val}%`;
    return val.toLocaleString();
  };

  return (
    <div 
      className="kpi-card"
      style={{ backgroundColor: colors.bg }}
      data-testid={testId}
    >
      <div className="kpi-value" style={{ color: colors.text }}>
        {formatValue(value)}
      </div>
      <div className="kpi-title" style={{ color: colors.text }}>
        {title}
      </div>
      <div className="kpi-delta" style={{ color: colors.delta }}>
        {loading ? 'Loading...' : delta}
      </div>
    </div>
  );
}

export default KPICard;
