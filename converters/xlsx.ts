import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';

export async function xlsxToMarkdown(filePath: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(filePath, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const workbook = XLSX.read(base64, { type: 'base64' });
  const sections: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (!rows.length) continue;

    sections.push(`## ${sheetName}`);
    const header = '| ' + (rows[0] as unknown[]).map(String).join(' | ') + ' |';
    const divider = '| ' + (rows[0] as unknown[]).map(() => '---').join(' | ') + ' |';
    const body = rows
      .slice(1)
      .map(r => '| ' + (r as unknown[]).map(c => String(c ?? '')).join(' | ') + ' |')
      .join('\n');
    sections.push([header, divider, body].filter(Boolean).join('\n'));
  }

  return sections.join('\n\n');
}
