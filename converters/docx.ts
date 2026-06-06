import * as FileSystem from 'expo-file-system';
import JSZip from 'jszip';

// DOCX is a ZIP of XML files. Parse word/document.xml for text + basic styles.
export async function docxToMarkdown(filePath: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(filePath, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const zip = await JSZip.loadAsync(base64, { base64: true });

  const docXml = await zip.file('word/document.xml')?.async('string');
  if (!docXml) throw new Error('Not a valid DOCX file (missing word/document.xml)');

  const rels = await zip.file('word/_rels/document.xml.rels')?.async('string') ?? '';
  const numXml = await zip.file('word/numbering.xml')?.async('string') ?? '';

  return parseDocumentXml(docXml, rels, numXml);
}

function parseDocumentXml(xml: string, _rels: string, _numXml: string): string {
  const lines: string[] = [];

  // Extract paragraphs
  const paraMatches = xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) ?? [];

  for (const para of paraMatches) {
    const styleMatch = para.match(/<w:pStyle w:val="([^"]+)"/i);
    const style = (styleMatch?.[1] ?? '').toLowerCase();

    // Collect runs, preserving bold/italic
    const runMatches = para.match(/<w:r[ >][\s\S]*?<\/w:r>/g) ?? [];
    let text = '';

    for (const run of runMatches) {
      const isBold = /<w:b\/>|<w:b w:val="true"/.test(run);
      const isItalic = /<w:i\/>|<w:i w:val="true"/.test(run);
      const tMatch = run.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) ?? [];
      const raw = tMatch.map(t => t.replace(/<[^>]+>/g, '')).join('');
      if (!raw) continue;
      let chunk = raw;
      if (isBold && isItalic) chunk = `***${chunk}***`;
      else if (isBold) chunk = `**${chunk}**`;
      else if (isItalic) chunk = `*${chunk}*`;
      text += chunk;
    }

    if (!text.trim()) {
      lines.push('');
      continue;
    }

    if (style.startsWith('heading1') || style === 'title') lines.push(`# ${text}`);
    else if (style.startsWith('heading2') || style === 'subtitle') lines.push(`## ${text}`);
    else if (style.startsWith('heading3')) lines.push(`### ${text}`);
    else if (style.startsWith('heading4')) lines.push(`#### ${text}`);
    else if (style.startsWith('listparagraph') || style.includes('list')) lines.push(`- ${text}`);
    else lines.push(text);
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
