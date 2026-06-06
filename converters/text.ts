export function csvToMarkdown(csv: string): string {
  const lines = csv.trim().split('\n').filter(Boolean);
  if (!lines.length) return '';

  // Basic CSV parser (handles quoted fields)
  function parseLine(line: string): string[] {
    const cells: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        cells.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    cells.push(cur.trim());
    return cells;
  }

  const rows = lines.map(parseLine);
  const maxCols = Math.max(...rows.map(r => r.length));
  const pad = (r: string[]) => [...r, ...Array(maxCols - r.length).fill('')];

  const header = '| ' + pad(rows[0]).join(' | ') + ' |';
  const divider = '| ' + pad(rows[0]).map(() => '---').join(' | ') + ' |';
  const body = rows.slice(1).map(r => '| ' + pad(r).join(' | ') + ' |').join('\n');
  return [header, divider, body].filter(Boolean).join('\n');
}

export function jsonToMarkdown(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    const pretty = JSON.stringify(parsed, null, 2);
    return '```json\n' + pretty + '\n```';
  } catch {
    return '```json\n' + raw + '\n```';
  }
}

export function xmlToMarkdown(raw: string): string {
  return '```xml\n' + raw.trim() + '\n```';
}

export function plainToMarkdown(raw: string): string {
  return raw.trim();
}
