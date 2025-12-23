export function toCsv(rows: string[][]): string {
  const escapeCell = (value: string): string => {
    const needsQuote = /[",\n\r]/.test(value);
    const escaped = value.replace(/"/g, '""');
    return needsQuote ? `"${escaped}"` : escaped;
  };

  return rows.map((row) => row.map((cell) => escapeCell(cell ?? '')).join(',')).join('\r\n');
}


