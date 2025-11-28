import { useCallback } from 'react';
import { MarkdownDoc, PrintSettings } from '../types';

interface UseExportProps {
  activeDoc: MarkdownDoc;
  setIsPrintModalOpen: (open: boolean) => void;
}

export const useExport = ({ activeDoc, setIsPrintModalOpen }: UseExportProps) => {
  
  const handlePrint = useCallback((settings: PrintSettings) => {
    // Create a dynamic style tag for print metrics
    let style = document.getElementById('nebula-print-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'nebula-print-style';
      document.head.appendChild(style);
    }

    // Define the @page rules and body overrides
    style.innerHTML = `
      @page {
        size: ${settings.pageSize} ${settings.orientation};
        margin: ${settings.margin}mm;
      }
      @media print {
        body {
          font-size: ${settings.scale}%; 
        }
        .markdown-body {
           padding: 0 !important;
           max-width: none !important;
        }
      }
    `;

    setIsPrintModalOpen(false);
    
    // Small delay to allow modal to close and styles to apply
    setTimeout(() => {
      window.print();
    }, 300);
  }, [setIsPrintModalOpen]);

  const handleExport = useCallback((type: 'md' | 'html' | 'word' | 'pdf') => {
    if (type === 'pdf') {
      setIsPrintModalOpen(true);
      return;
    }

    const previewElement = document.querySelector('.markdown-body');
    const htmlContent = previewElement ? previewElement.innerHTML : '';
    const safeTitle = activeDoc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    if (type === 'word') {
      // Process HTML content for better Word compatibility
      let processedHtml = htmlContent;
      
      // Convert Mermaid SVGs to images (Word doesn't support SVG well)
      const mermaidDivs = document.querySelectorAll('.markdown-body [data-mermaid]');
      mermaidDivs.forEach((div) => {
        const svg = div.querySelector('svg');
        if (svg) {
          const placeholder = document.createElement('div');
          placeholder.innerHTML = '<p style="color: #666; font-style: italic; border: 1px dashed #ccc; padding: 10px; text-align: center;">[Mermaid Diagram - View in HTML or PDF export for full diagram]</p>';
          processedHtml = processedHtml.replace(div.outerHTML, placeholder.innerHTML);
        }
      });
      
      const content = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${activeDoc.title}</title>
            <style>
              body { 
                font-family: 'Calibri', 'Arial', sans-serif; 
                font-size: 11pt; 
                line-height: 1.6; 
                color: #333;
                max-width: 800px;
                margin: 0 auto;
              }
              h1 { font-size: 24pt; color: #2E74B5; margin-top: 24pt; margin-bottom: 12pt; font-weight: bold; }
              h2 { font-size: 18pt; color: #2E74B5; margin-top: 20pt; margin-bottom: 10pt; font-weight: bold; }
              h3 { font-size: 14pt; color: #2E74B5; margin-top: 16pt; margin-bottom: 8pt; font-weight: bold; }
              h4 { font-size: 12pt; color: #333; margin-top: 14pt; margin-bottom: 6pt; font-weight: bold; }
              p { margin: 0 0 10pt 0; text-align: justify; }
              strong { font-weight: bold; }
              em { font-style: italic; }
              code { 
                font-family: 'Consolas', 'Courier New', monospace; 
                font-size: 10pt;
                background-color: #f5f5f5; 
                padding: 2px 4px;
                border-radius: 3px;
              }
              pre { 
                font-family: 'Consolas', 'Courier New', monospace;
                font-size: 10pt;
                background-color: #f5f5f5; 
                padding: 12pt; 
                border: 1px solid #ddd;
                border-radius: 4px;
                overflow-x: auto;
                white-space: pre-wrap;
                word-wrap: break-word;
              }
              table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
              th { background-color: #f0f0f0; border: 1px solid #ccc; padding: 8pt; text-align: left; font-weight: bold; }
              td { border: 1px solid #ccc; padding: 8pt; }
              ul, ol { margin: 10pt 0; padding-left: 24pt; }
              li { margin: 4pt 0; }
              blockquote { border-left: 4px solid #2E74B5; padding-left: 12pt; margin: 12pt 0; color: #666; font-style: italic; }
              img { max-width: 100%; height: auto; margin: 12pt 0; }
              a { color: #2E74B5; text-decoration: underline; }
              .katex { font-size: 1.1em; }
              .page-break { page-break-after: always; }
            </style>
          </head>
          <body>${processedHtml}</body>
        </html>
      `;
      
      // @ts-ignore
      if (window.htmlDocx) {
        // @ts-ignore
        const converted = window.htmlDocx.asBlob(content, { orientation: 'portrait', margins: { top: 720, right: 720, bottom: 720, left: 720 } });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(converted);
        a.download = `${safeTitle}.docx`;
        a.click();
      } else {
        alert("Export library not loaded.");
      }
      return;
    } 
    
    if (type === 'html') {
      const content = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${activeDoc.title}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; 
              line-height: 1.6; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 2rem; 
              color: #24292e; 
            }
            img { max-width: 100%; }
            pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
            code { font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace; font-size: 85%; }
            table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
            th, td { border: 1px solid #dfe2e5; padding: 6px 13px; }
            th { background-color: #f6f8fa; }
            blockquote { border-left: 0.25em solid #dfe2e5; color: #6a737d; padding: 0 1em; margin: 0; }
            a { color: #0366d6; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `;
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeTitle}.html`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    // Export Markdown: Hydrate images as reference links at the bottom
    let exportContent = activeDoc.content;
    const attachments = activeDoc.attachments || {};
    let references = '\n\n';
    let hasRef = false;

    // Replace ![alt](attachment:id) with ![alt][id] and append definition
    exportContent = exportContent.replace(/!\[(.*?)\]\(attachment:([a-zA-Z0-9-]+)\)/g, (match, alt, id) => {
      if (attachments[id]) {
        hasRef = true;
        references += `[${id}]: ${attachments[id]}\n`;
        return `![${alt}][${id}]`;
      }
      return match;
    });

    if (hasRef) {
      exportContent += references;
    }

    const blob = new Blob([exportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeTitle}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeDoc, setIsPrintModalOpen]);

  return {
    handleExport,
    handlePrint
  };
};

