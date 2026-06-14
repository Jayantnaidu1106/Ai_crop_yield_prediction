import React from 'react';
import { Download } from 'lucide-react';

export default function ExportButton({ onExport, format = 'csv' }) {
  return (
    <button className="btn btn-secondary" onClick={() => onExport(format)}>
      <Download size={16} /> Export {format.toUpperCase()}
    </button>
  );
}
