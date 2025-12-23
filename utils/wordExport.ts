/**
 * Word Export Utility using docx library
 * Converts HTML content to DOCX format with WYSIWYG rendering
 * Browser-compatible implementation
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ImageRun,
  ExternalHyperlink,
  AlignmentType,
  convertInchesToTwip,
  ITableCellOptions,
} from 'docx';
import { saveAs } from 'file-saver';

export interface WordExportSettings {
  fontFamily: 'Calibri' | 'Arial' | 'Times New Roman' | 'Georgia';
  fontSize: 10 | 11 | 12 | 14;
  headingColor: string;
  margins: 'narrow' | 'normal' | 'wide';
  lineSpacing: 1 | 1.15 | 1.5 | 2;
}

export interface WordExportOptions {
  title: string;
  htmlContent: string;
  attachments?: Record<string, string>;
  settings?: WordExportSettings;
}

interface ParsedElement {
  type: 'paragraph' | 'heading' | 'code' | 'blockquote' | 'list' | 'table' | 'image' | 'hr';
  level?: number;
  content?: string;
  items?: string[];
  ordered?: boolean;
  rows?: string[][];
  src?: string;
  runs?: TextRunConfig[];
}

interface TextRunConfig {
  text: string;
  bold?: boolean;
  italics?: boolean;
  code?: boolean;
  link?: string;
}

/**
 * Parse inline formatting (bold, italic, code, links) from HTML
 */
function parseInlineFormatting(element: Element): TextRunConfig[] {
  const runs: TextRunConfig[] = [];
  
  function processNode(node: Node, styles: { bold?: boolean; italics?: boolean; code?: boolean }) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text.trim() || text === ' ') {
        runs.push({ text, ...styles });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tag = el.tagName.toLowerCase();
      
      let newStyles = { ...styles };
      
      if (tag === 'strong' || tag === 'b') {
        newStyles.bold = true;
      } else if (tag === 'em' || tag === 'i') {
        newStyles.italics = true;
      } else if (tag === 'code') {
        newStyles.code = true;
      } else if (tag === 'a') {
        const href = el.getAttribute('href') || '';
        const text = el.textContent || '';
        runs.push({ text, link: href, ...styles });
        return;
      } else if (tag === 'br') {
        runs.push({ text: '\n' });
        return;
      }
      
      el.childNodes.forEach(child => processNode(child, newStyles));
    }
  }
  
  element.childNodes.forEach(child => processNode(child, {}));
  
  return runs;
}

const DEFAULT_SETTINGS: WordExportSettings = {
  fontFamily: 'Calibri',
  fontSize: 11,
  headingColor: '#2E74B5',
  margins: 'normal',
  lineSpacing: 1.15,
};

/**
 * Create TextRun objects from parsed formatting
 */
function createTextRuns(runs: TextRunConfig[], settings: WordExportSettings): (TextRun | ExternalHyperlink)[] {
  const fontSizeHalfPts = settings.fontSize * 2; // Convert pt to half-points
  const codeFontSize = (settings.fontSize - 1) * 2;
  const headingColorHex = settings.headingColor.replace('#', '');
  
  return runs.map(run => {
    if (run.link) {
      return new ExternalHyperlink({
        children: [
          new TextRun({
            text: run.text,
            bold: run.bold,
            italics: run.italics,
            font: run.code ? 'Consolas' : settings.fontFamily,
            color: headingColorHex,
            underline: {},
          }),
        ],
        link: run.link,
      });
    }
    
    return new TextRun({
      text: run.text,
      bold: run.bold,
      italics: run.italics,
      font: run.code ? 'Consolas' : settings.fontFamily,
      size: run.code ? codeFontSize : fontSizeHalfPts,
      shading: run.code ? { fill: 'F5F5F5' } : undefined,
    });
  });
}

/**
 * Parse HTML content into structured elements
 */
function parseHtmlContent(html: string, attachments?: Record<string, string>, settings: WordExportSettings = DEFAULT_SETTINGS): (Paragraph | Table)[] {
  const container = document.createElement('div');
  container.innerHTML = html;
  
  const headingColorHex = settings.headingColor.replace('#', '');
  
  const elements: (Paragraph | Table)[] = [];
  
  function processElement(el: Element) {
    const tag = el.tagName.toLowerCase();
    
    // Headings
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
      const level = parseInt(tag[1]);
      const headingLevel = [
        HeadingLevel.HEADING_1,
        HeadingLevel.HEADING_2,
        HeadingLevel.HEADING_3,
        HeadingLevel.HEADING_4,
        HeadingLevel.HEADING_5,
        HeadingLevel.HEADING_6,
      ][level - 1];
      
      elements.push(new Paragraph({
        children: createTextRuns(parseInlineFormatting(el), settings),
        heading: headingLevel,
        spacing: { before: 240, after: 120 },
      }));
      return;
    }
    
    // Paragraphs
    if (tag === 'p') {
      const runs = parseInlineFormatting(el);
      if (runs.length > 0) {
        elements.push(new Paragraph({
          children: createTextRuns(runs, settings),
          spacing: { after: 200 },
        }));
      }
      return;
    }
    
    // Code blocks
    if (tag === 'pre') {
      const code = el.querySelector('code');
      const text = (code || el).textContent || '';
      
      elements.push(new Paragraph({
        children: [
          new TextRun({
            text: text,
            font: 'Consolas',
            size: 20,
          }),
        ],
        shading: { fill: '282C34' },
        spacing: { before: 200, after: 200 },
      }));
      return;
    }
    
    // Blockquotes
    if (tag === 'blockquote') {
      const text = el.textContent || '';
      elements.push(new Paragraph({
        children: [
          new TextRun({
            text: text,
            italics: true,
            color: '666666',
            font: settings.fontFamily,
          }),
        ],
        indent: { left: convertInchesToTwip(0.5) },
        border: {
          left: { style: BorderStyle.SINGLE, size: 12, color: headingColorHex },
        },
        spacing: { before: 200, after: 200 },
      }));
      return;
    }
    
    // Lists
    if (tag === 'ul' || tag === 'ol') {
      const items = el.querySelectorAll(':scope > li');
      items.forEach((li, index) => {
        const bullet = tag === 'ol' ? `${index + 1}. ` : '• ';
        const runs = parseInlineFormatting(li);
        runs.unshift({ text: bullet });
        elements.push(new Paragraph({
          children: createTextRuns(runs, settings),
          indent: { left: convertInchesToTwip(0.25) },
          spacing: { after: 100 },
        }));
      });
      return;
    }
    
    // Tables
    if (tag === 'table') {
      const rows: TableRow[] = [];
      el.querySelectorAll('tr').forEach((tr, rowIndex) => {
        const cells: TableCell[] = [];
        const cellElements = tr.querySelectorAll('th, td');
        
        cellElements.forEach((cell) => {
          const isHeader = cell.tagName.toLowerCase() === 'th';
          const cellOptions: ITableCellOptions = {
            children: [
              new Paragraph({
                children: createTextRuns(parseInlineFormatting(cell), settings),
              }),
            ],
            shading: isHeader ? { fill: 'F0F0F0' } : undefined,
          };
          cells.push(new TableCell(cellOptions));
        });
        
        if (cells.length > 0) {
          rows.push(new TableRow({ children: cells }));
        }
      });
      
      if (rows.length > 0) {
        elements.push(new Table({
          rows: rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        }));
        elements.push(new Paragraph({ text: '' })); // Spacing after table
      }
      return;
    }
    
    // Images
    if (tag === 'img') {
      let src = el.getAttribute('src') || '';
      
      // Handle attachment references
      if (src.startsWith('attachment://') && attachments) {
        const attachmentId = src.replace('attachment://', '');
        src = attachments[attachmentId] || '';
      }
      
      // Handle base64 images
      if (src.startsWith('data:image')) {
        try {
          const base64Data = src.split(',')[1];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          elements.push(new Paragraph({
            children: [
              new ImageRun({
                data: bytes,
                transformation: { width: 400, height: 300 },
                type: 'png',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
          }));
        } catch (e) {
          console.error('Failed to process image:', e);
          elements.push(new Paragraph({
            children: [new TextRun({ text: '[Image]', italics: true, color: '999999' })],
          }));
        }
      }
      return;
    }
    
    // Horizontal rules
    if (tag === 'hr') {
      elements.push(new Paragraph({
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' },
        },
        spacing: { before: 200, after: 200 },
      }));
      return;
    }
    
    // Mermaid diagrams placeholder
    if (el.hasAttribute('data-mermaid') || el.classList.contains('mermaid')) {
      elements.push(new Paragraph({
        children: [
          new TextRun({
            text: '📊 [Mermaid Diagram - View in HTML or PDF for interactive diagram]',
            italics: true,
            color: '666666',
          }),
        ],
        alignment: AlignmentType.CENTER,
        border: {
          top: { style: BorderStyle.DASHED, size: 1, color: '999999' },
          bottom: { style: BorderStyle.DASHED, size: 1, color: '999999' },
          left: { style: BorderStyle.DASHED, size: 1, color: '999999' },
          right: { style: BorderStyle.DASHED, size: 1, color: '999999' },
        },
        spacing: { before: 200, after: 200 },
      }));
      return;
    }
    
    // KaTeX math - extract LaTeX notation
    if (el.classList.contains('katex')) {
      const annotation = el.querySelector('annotation[encoding="application/x-tex"]');
      if (annotation && annotation.textContent) {
        elements.push(new Paragraph({
          children: [
            new TextRun({
              text: annotation.textContent,
              font: 'Cambria Math',
              italics: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 100 },
        }));
        return;
      }
    }
    
    // Div containers - process children
    if (tag === 'div' || tag === 'section' || tag === 'article') {
      el.childNodes.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          processElement(child as Element);
        }
      });
      return;
    }
  }
  
  // Process all top-level elements
  container.childNodes.forEach(child => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      processElement(child as Element);
    }
  });
  
  return elements;
}

/**
 * Generate Word document from HTML content
 */
export async function exportToWord(options: WordExportOptions): Promise<Blob> {
  const { title, htmlContent, attachments, settings = DEFAULT_SETTINGS } = options;

  // Calculate margins based on settings
  const marginValues = {
    narrow: 0.5,
    normal: 1,
    wide: 1.25,
  };
  const marginInches = marginValues[settings.margins];

  // Parse HTML into document elements
  const docElements = parseHtmlContent(htmlContent, attachments, settings);

  // Create the document
  const doc = new Document({
    title: title,
    creator: 'Nebula Markdown Editor',
    description: `Exported from ${title}`,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(marginInches),
              right: convertInchesToTwip(marginInches),
              bottom: convertInchesToTwip(marginInches),
              left: convertInchesToTwip(marginInches),
            },
          },
        },
        children: docElements,
      },
    ],
  });

  // Generate blob
  const blob = await Packer.toBlob(doc);
  return blob;
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  saveAs(blob, filename);
}
