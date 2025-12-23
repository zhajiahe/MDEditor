/**
 * Word Export Utility using html-to-docx
 * Converts HTML content to DOCX format with WYSIWYG rendering
 */

import HTMLtoDOCX from 'html-to-docx';

export interface WordExportOptions {
  title: string;
  htmlContent: string;
  attachments?: Record<string, string>;
}

/**
 * Preprocess HTML content for better Word compatibility
 */
function preprocessHtml(html: string, attachments?: Record<string, string>): string {
  // Create a temporary container for DOM manipulation
  const container = document.createElement('div');
  container.innerHTML = html;

  // Process embedded base64 images - convert data URLs to proper format
  const images = container.querySelectorAll('img');
  images.forEach((img) => {
    const src = img.getAttribute('src');
    if (src) {
      // Handle attachment references
      if (src.startsWith('attachment://') && attachments) {
        const attachmentId = src.replace('attachment://', '');
        const base64Data = attachments[attachmentId];
        if (base64Data) {
          img.setAttribute('src', base64Data);
        }
      }
      // Ensure images have explicit dimensions for better Word rendering
      if (!img.hasAttribute('width')) {
        img.setAttribute('width', 'auto');
        img.setAttribute('style', (img.getAttribute('style') || '') + '; max-width: 600px;');
      }
    }
  });

  // Process Mermaid diagrams - replace SVGs with placeholder
  const mermaidDivs = container.querySelectorAll('[data-mermaid]');
  mermaidDivs.forEach((div) => {
    // Try to get the SVG and convert to a more compatible format
    const svg = div.querySelector('svg');
    if (svg) {
      // For now, replace with a styled placeholder
      const placeholder = document.createElement('div');
      placeholder.style.cssText = 'border: 2px dashed #999; padding: 20px; text-align: center; background: #f5f5f5; margin: 10px 0;';
      placeholder.innerHTML = '<p style="color: #666; font-style: italic; margin: 0;">📊 Mermaid Diagram</p><p style="color: #999; font-size: 11px; margin: 5px 0 0 0;">(View in HTML or PDF export for interactive diagram)</p>';
      div.replaceWith(placeholder);
    }
  });

  // Process KaTeX math formulas - extract LaTeX and display as formatted text
  const katexElements = container.querySelectorAll('.katex');
  katexElements.forEach((katex) => {
    const annotation = katex.querySelector('annotation[encoding="application/x-tex"]');
    if (annotation && annotation.textContent) {
      const mathSpan = document.createElement('span');
      mathSpan.style.cssText = 'font-family: "Cambria Math", "Times New Roman", serif; font-style: italic; background-color: #f0f8ff; padding: 2px 6px; border-radius: 3px;';
      mathSpan.textContent = annotation.textContent;
      katex.replaceWith(mathSpan);
    }
  });

  // Process code blocks - ensure proper styling
  const codeBlocks = container.querySelectorAll('pre code');
  codeBlocks.forEach((code) => {
    // Remove syntax highlighting spans but keep the text
    const text = code.textContent || '';
    code.innerHTML = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  });

  return container.innerHTML;
}

/**
 * Generate Word document from HTML content
 */
export async function exportToWord(options: WordExportOptions): Promise<Blob> {
  const { title, htmlContent, attachments } = options;

  // Preprocess HTML for Word compatibility
  const processedHtml = preprocessHtml(htmlContent, attachments);

  // Create full HTML document with styling
  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
      </head>
      <body>
        ${processedHtml}
      </body>
    </html>
  `;

  // Configure html-to-docx options
  const docxOptions = {
    title: title,
    margin: {
      top: 1440,      // 1 inch in twips (1440 twips = 1 inch)
      right: 1440,
      bottom: 1440,
      left: 1440,
    },
    font: 'Calibri',
    fontSize: 22,     // 11pt in half-points (22 half-points = 11pt)
    table: {
      row: {
        cantSplit: true,
      },
    },
    header: true,
    footer: true,
    pageNumber: true,
  };

  // Generate DOCX blob
  const blob = await HTMLtoDOCX(fullHtml, null, docxOptions);
  
  return blob as Blob;
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
