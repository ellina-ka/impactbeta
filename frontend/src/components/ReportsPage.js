import React, { useState } from 'react';
import { FileText, Download, FileSpreadsheet, CheckCircle } from 'lucide-react';
import './styles.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

function ReportsPage({ selectedTerm, terms, onExport }) {
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
      
      // Notify parent of successful export
      onExport(type === 'logs' ? 'Verified logs CSV' : 'Audit trail CSV');
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
                <li>Program name & term</li>
                <li>Date, hours, status</li>
                <li>Evidence tier</li>
                <li>Verifier & timestamp</li>
              </ul>
            </div>
            <button 
              className="export-btn"
              onClick={() => handleExport('logs')}
              disabled={exporting === 'logs'}
              data-testid="export-logs-btn"
            >
              {exporting === 'logs' ? (
                <>Exporting...</>
              ) : (
                <><Download size={16} /> Export CSV</>
              )}
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
                <li>Entity details</li>
                <li>Timestamp</li>
                <li>Notes & rejection reasons</li>
              </ul>
            </div>
            <button 
              className="export-btn"
              onClick={() => handleExport('audit')}
              disabled={exporting === 'audit'}
              data-testid="export-audit-btn"
            >
              {exporting === 'audit' ? (
                <>Exporting...</>
              ) : (
                <><Download size={16} /> Export CSV</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
