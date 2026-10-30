// CSV helpers (concept #33). Fields containing commas, quotes or line breaks are
// wrapped in double quotes with embedded quotes doubled (RFC 4180). Text cells
// that start with = + - @ are prefixed with an apostrophe so spreadsheet apps do
// not execute them as formulas ("CSV injection").

export function escapeCell(value) {
  if (value === null || value === undefined) return '';
  let text;
  if (typeof value === 'number') {
    text = Number.isFinite(value) ? String(value) : '';
  } else if (typeof value === 'boolean') {
    text = value ? 'true' : 'false';
  } else {
    text = String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  }
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

/** columns: [{ header: 'Booking', value: (row) => row.id }] */
export function toCSV(rows, columns) {
  const head = columns.map((c) => escapeCell(c.header)).join(',');
  const lines = rows.map((row) => columns.map((c) => escapeCell(c.value(row))).join(','));
  return [head, ...lines].join('\r\n') + '\r\n';
}

/** Browser-only download. A BOM keeps Excel happy with non-ASCII names. */
export function downloadCSV(filename, csv) {
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
