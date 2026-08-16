export const exportToCSV = (complaints, filename = 'SmartIssue_Analytics_Report.csv') => {
  if (!complaints || !complaints.length) {
    alert('No data available to export!');
    return;
  }

  // CSV Column Headers
  const headers = [
    'Issue ID',
    'Title',
    'Description',
    'Category',
    'Priority',
    'Status',
    'AI Confidence (%)',
    'AI Summary',
    'Submitted By (Name)',
    'Submitted By (Email)',
    'Created At'
  ];

  // Convert objects to CSV formatted rows
  const rows = complaints.map(c => [
    `"${c._id || ''}"`,
    `"${(c.title || '').replace(/"/g, '""')}"`,
    `"${(c.description || '').replace(/"/g, '""')}"`,
    `"${c.category || ''}"`,
    `"${c.priority || ''}"`,
    `"${c.status || ''}"`,
    `"${c.aiConfidence || 0}"`,
    `"${(c.aiSummary || '').replace(/"/g, '""')}"`,
    `"${(c.user?.name || 'Anonymous').replace(/"/g, '""')}"`,
    `"${(c.user?.email || 'N/A').replace(/"/g, '""')}"`,
    `"${c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}"`
  ]);

  // Combine headers and data
  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  // Trigger File Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
