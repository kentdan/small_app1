// turndown converts HTML → Markdown, works in React Native with no polyfills
import TurndownService from 'turndown';

const td = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  fence: '```',
});

export function htmlToMarkdown(html: string): string {
  return td.turndown(html).replace(/\n{3,}/g, '\n\n').trim();
}
