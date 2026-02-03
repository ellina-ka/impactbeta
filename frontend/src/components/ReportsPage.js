import React, { useState } from 'react';
import { FileText, Download, FileSpreadsheet } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

function ReportsPage({ selectedTerm, terms }) {
  const [exporting, setExporting] = useState(null);
  const selectedTermData = terms.find(t => t.term_id === selectedTerm);

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const endpoint = type === 'logs' 
        ? `/api/export/verified-logs?term_id=${selectedTerm}`
        : `/api/export/audit-trail?term_id=${selectedTerm}`;
      
      const response = await fetch(`${API_URL}${endpoint}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'logs' 
        ? `verified_logs_${selectedTerm}.csv`
        : `audit_trail_${selectedTerm}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="page" data-testid="reports-page">
      <div className="page-header">
        <h1 className="page-title">Reports & Exports</h1>
        <p className="page-subtitle">Generate audit-ready reports and export data</p>
      </div>

      <div className="exports-section">
        <div className="section-header">
          <FileText size={20} />
          <h2>Export Data for {selectedTermData?.name || selectedTerm}</h2>
        </div>

        <div className="export-cards">
          <div className="export-card" data-testid="export-verified-logs">
            <div className="export-icon">
              <FileSpreadsheet size={32} />
            </div>
            <div className="export-info">
              <h3>Verified Service Logs</h3>
              <p>Export all verified service hour records for the selected term.</p>
              <ul className="export-columns">
                <li>Student name & email</li>
                <li>Program name</li>
                <li>Date, hours, status</li>
                <li>Evidence tier</li>
              </ul>
            </div>
            <button 
              className="export-btn"
              onClick={() => handleExport('logs')}
              disabled={exporting === 'logs'}
              data-testid="export-logs-btn"
            >
              <Download size={16} />
              {exporting === 'logs' ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>

          <div className="export-card" data-testid="export-audit-trail">
            <div className="export-icon audit">
              <FileText size={32} />
            </div>
            <div className="export-info">
              <h3>Audit Trail</h3>
              <p>Export complete verification audit trail for compliance.</p>
              <ul className="export-columns">
                <li>Actor & role</li>
                <li>Action performed</li>
                <li>Timestamp</li>
                <li>Notes & reasons</li>
              </ul>
            </div>
            <button 
              className="export-btn"
              onClick={() => handleExport('audit')}
              disabled={exporting === 'audit'}
              data-testid="export-audit-btn"
            >
              <Download size={16} />
              {exporting === 'audit' ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page {
          max-width: 1400px;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-title {
          font-size: 24px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }

        .page-subtitle {
          font-size: 14px;
          color: #6B7280;
        }

        .exports-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          color: #1D4648;
        }

        .section-header h2 {
          font-size: 18px;
          font-weight: 600;
        }

        .export-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 20px;
        }

        .export-card {
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .export-icon {
          width: 56px;
          height: 56px;
          border-radius: 10px;
          background-color: #E8F5F3;
          color: #3B7073;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .export-icon.audit {
          background-color: #FEF3C7;
          color: #92400E;
        }

        .export-info h3 {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 6px;
        }

        .export-info p {
          font-size: 13px;
          color: #6B7280;
          margin-bottom: 12px;
        }

        .export-columns {
          font-size: 12px;
          color: #6B7280;
          padding-left: 16px;
          margin: 0;
        }

        .export-columns li {
          margin-bottom: 4px;
        }

        .export-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          background-color: #3B7073;
          color: white;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: auto;
        }

        .export-btn:hover:not(:disabled) {
          background-color: #1D4648;
        }

        .export-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default ReportsPage;
