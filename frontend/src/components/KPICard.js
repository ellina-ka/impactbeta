import React from 'react';

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

      <style jsx>{`
        .kpi-card {
          padding: 20px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .kpi-value {
          font-size: 28px;
          font-weight: 700;
          line-height: 1.2;
        }

        .kpi-title {
          font-size: 14px;
          font-weight: 500;
          opacity: 0.9;
        }

        .kpi-delta {
          font-size: 12px;
          font-weight: 400;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}

export default KPICard;
