import JSZip from 'jszip';
import { readAsBase64 } from './reader';

// PPTX is a ZIP. Each slide is ppt/slides/slide{N}.xml.
export async function pptxToMarkdown(filePath: string): Promise<string> {
  const base64 = await readAsBase64(filePath);

  const zip = await JSZip.loadAsync(base64, { base64: true });

  // Find all slide files, sorted by slide number
  const slideFiles = Object.keys(zip.files)
    .filter(name => name.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)?.[0] ?? '0');
      const nb = parseInt(b.match(/\d+/)?.[0] ?? '0');
      return na - nb;
    });

  if (!slideFiles.length) throw new Error('No slides found in PPTX file');

  const sections: string[] = [];

  for (let i = 0; i < slideFiles.length; i++) {
    const xml = await zip.file(slideFiles[i])!.async('string');
    const text = extractSlideText(xml);
    if (text.trim()) {
      sections.push(`## Slide ${i + 1}\n\n${text}`);
    }
  }

  return sections.join('\n\n---\n\n');
}

function extractSlideText(xml: string): string {
  const lines: string[] = [];

  // Find all text body elements <p:txBody>, ordered by appearance
  const txBodies = xml.match(/<p:txBody>[\s\S]*?<\/p:txBody>/g) ?? [];

  for (const body of txBodies) {
    const paras = body.match(/<a:p>[\s\S]*?<\/a:p>/g) ?? [];
    for (const para of paras) {
      const tMatches = para.match(/<a:t>([^<]*)<\/a:t>/g) ?? [];
      const text = tMatches.map(t => t.replace(/<[^>]+>/g, '')).join('');
      if (text.trim()) lines.push(text.trim());
    }
  }

  return lines.join('\n');
}
