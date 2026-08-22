export const exportToCSV = (complaints, filename = 'DGMS_CoalMine_Compliance_Report.csv') => {
  if (!complaints || !complaints.length) {
    alert('No data available to export!');
    return;
  }

  // CSV Column Headers
  const headers = [
    'Violation ID',
    'Title',
    'Description',
    'Mine Site / Coalfield',
    'Category',
    'Severity / Priority',
    'Status',
    'Safety Controller (Lead)',
    'AI Confidence (%)',
    'AI Summary',
    'Location Address',
    'Coordinates (Lat, Long)',
    'Reported By (Name)',
    'Reported By (Email)',
    'Logged At'
  ];

  // Convert objects to CSV formatted rows
  const rows = complaints.map(c => [
    `"${c._id || ''}"`,
    `"${(c.title || '').replace(/"/g, '""')}"`,
    `"${(c.description || '').replace(/"/g, '""')}"`,
    `"${(c.mineSite || 'Jharia Colliery - Pit 4').replace(/"/g, '""')}"`,
    `"${c.category || ''}"`,
    `"${c.priority || ''}"`,
    `"${c.status || ''}"`,
    `"${(c.assignedTo || 'Unassigned').replace(/"/g, '""')}"`,
    `"${c.aiConfidence || 0}"`,
    `"${(c.aiSummary || '').replace(/"/g, '""')}"`,
    `"${(c.location?.address || 'N/A').replace(/"/g, '""')}"`,
    `"${c.location?.latitude && c.location?.longitude ? `${c.location.latitude}, ${c.location.longitude}` : 'N/A'}"`,
    `"${(c.user?.name || 'Anonymous Inspector').replace(/"/g, '""')}"`,
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
