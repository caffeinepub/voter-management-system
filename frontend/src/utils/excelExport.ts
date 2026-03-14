import type { Voter } from '../backend';

export function exportVotersToExcel(voters: Voter[]) {
  // Prepare CSV headers
  const headers = [
    'Sr. No',
    'Name',
    'Father/Husband Name',
    'House Number',
    'Voter ID',
    'Address',
    'Gender',
    'Area',
    'Taluka',
    'District',
    'State',
    'Pincode',
    'Mobile',
    'Date of Birth',
    'Caste',
    'Education',
    'Profession',
    'Office',
    'Political Ideology',
    'Comments',
  ];

  // Escape CSV field (handle commas, quotes, and newlines)
  const escapeCSV = (field: string): string => {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };

  // Prepare CSV rows
  const rows = voters.map((voter) => [
    voter.srNo.toString(),
    escapeCSV(voter.name),
    escapeCSV(voter.fatherHusbandName || ''),
    voter.houseNumber?.toString() || '',
    voter.voterId.toString(),
    escapeCSV(voter.address || ''),
    voter.gender ? voter.gender.charAt(0).toUpperCase() + voter.gender.slice(1) : '',
    escapeCSV(voter.area || ''),
    escapeCSV(voter.taluka || ''),
    escapeCSV(voter.district || ''),
    escapeCSV(voter.state || ''),
    voter.pincode || '',
    voter.mobileNo || '',
    voter.dob || '',
    escapeCSV(voter.caste || ''),
    escapeCSV(voter.education || ''),
    escapeCSV(voter.profession || ''),
    escapeCSV(voter.office || ''),
    escapeCSV(voter.politicalIdeology || ''),
    escapeCSV(voter.comments || ''),
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Generate filename with current date
  const date = new Date().toISOString().split('T')[0];
  const filename = `voters-export-${date}.csv`;

  // Create download link and trigger download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
