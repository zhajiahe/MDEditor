import React, { useState, useRef, useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';
import { StatusBar } from './components/StatusBar';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { HelpModal } from './components/HelpModal';
import { ViewMode, AIRequestOptions, MarkdownDoc, Theme, AISettings, PrintSettings } from './types';
import { generateAIContent } from './services/geminiService';
import { compressImage } from './utils/editorUtils';

const DEFAULT_DOC_ID = 'default-doc';
const WELCOME_CONTENT = `# Welcome to Nebula Markdown

This is an **AI-powered** Markdown editor.

## Features
- **File Management**: Create and manage multiple documents in the sidebar.
- **AI Assist**: Use the magic wand to improve, summarize, or continue your text.
- **Diagrams**: Support for Mermaid.js diagrams.
\`\`\`mermaid
graph TD;
    A[Start] --> B{Is it AI?};
    B -- Yes --> C[Great!];
    B -- No --> D[Make it AI];
\`\`\`
- **Math**: $E = mc^2$
- **Images**: Paste images directly from your clipboard!
- **Export**: PDF, Markdown, HTML, and Word (.docx).

## Try it out!
Select this text and ask AI to translate it, or just start typing...
`;

function App() {
  const [documents, setDocuments] = useState<MarkdownDoc[]>(() => {
    try {
      const stored = localStorage.getItem('nebula-docs');
      return stored ? JSON.parse(stored) : [{
        id: DEFAULT_DOC_ID,
        title: 'Welcome Note',
        content: WELCOME_CONTENT,
        lastModified: Date.now(),
        attachments: {}
      }];
    } catch {
      return [{
        id: DEFAULT_DOC_ID,
        title: 'Welcome Note',
        content: WELCOME_CONTENT,
        lastModified: Date.now(),
        attachments: {}
      }];
    }
  });

  const [activeDocId, setActiveDocId] = useState<string>(() => {
    return localStorage.getItem('nebula-active-doc') || DEFAULT_DOC_ID;
  });

  // --- Settings & Theme State ---
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('nebula-theme') as Theme) || 'dark';
  });

  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    try {
      const stored = localStorage.getItem('nebula-ai-settings');
      return stored ? JSON.parse(stored) : { provider: 'gemini' };
    } catch {
      return { provider: 'gemini' };
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Split);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Editor State for Status Bar
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isScrolling = useRef(false);

  const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('nebula-docs', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('nebula-active-doc', activeDocId);
  }, [activeDocId]);

  useEffect(() => {
    localStorage.setItem('nebula-theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('nebula-ai-settings', JSON.stringify(aiSettings));
  }, [aiSettings]);

  // --- Document Management ---
  const handleUpdateContent = (newContent: string) => {
    const titleMatch = newContent.match(/^#\s+(.+)$/m) || newContent.match(/^(.+)$/m);
    const newTitle = titleMatch ? titleMatch[1].trim() : 'Untitled';
    
    setDocuments(docs => docs.map(doc => 
      doc.id === activeDocId 
        ? { ...doc, content: newContent, title: newTitle.substring(0, 30), lastModified: Date.now() } 
        : doc
    ));
  };

  const handleCreateDoc = () => {
    const newDoc: MarkdownDoc = {
      id: crypto.randomUUID(),
      title: 'New Document',
      content: '',
      lastModified: Date.now(),
      attachments: {}
    };
    setDocuments([newDoc, ...documents]);
    setActiveDocId(newDoc.id);
  };

  const handleDeleteDoc = (id: string) => {
    if (documents.length <= 1) {
      alert("Cannot delete the last document.");
      return;
    }
    
    if (confirm("Are you sure you want to delete this document?")) {
      const newDocs = documents.filter(d => d.id !== id);
      setDocuments(newDocs);
      if (activeDocId === id) {
        setActiveDocId(newDocs[0].id);
      }
    }
  };

  // --- Scroll Sync ---
  const handleScroll = (source: 'editor' | 'preview') => {
    if (isScrolling.current) return;
    isScrolling.current = true;

    const editor = textareaRef.current;
    const preview = previewRef.current;

    if (editor && preview) {
      if (source === 'editor') {
        const percentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
        preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
      } else {
        const percentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
        editor.scrollTop = percentage * (editor.scrollHeight - editor.clientHeight);
      }
    }

    setTimeout(() => {
      isScrolling.current = false;
    }, 50);
  };

  // --- Insert Helper ---
  const handleInsert = (prefix: string, suffix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);

    const newText = text.substring(0, start) + prefix + selection + suffix + text.substring(end);
    handleUpdateContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  // --- Image Handling ---
  const handleImageUpload = async (file: File) => {
    try {
      const base64 = await compressImage(file);
      const id = `img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      
      // 1. Update Document Attachments
      setDocuments(docs => docs.map(doc => {
        if (doc.id === activeDocId) {
          return {
            ...doc,
            attachments: { ...(doc.attachments || {}), [id]: base64 },
            lastModified: Date.now()
          };
        }
        return doc;
      }));

      // 2. Insert Clean Reference into Editor
      // If we have a selection, use it as alt text, otherwise default to "Image"
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selection = textarea.value.substring(start, end);
        const altText = selection || 'Image';
        const tag = `![${altText}](attachment:${id})`;
        
        handleInsert(tag, '');
      }

    } catch (err) {
      console.error(err);
      alert("Failed to process image.");
    }
  };

  const handleImageUploadTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- AI Handler ---
  const handleAIAction = async (type: AIRequestOptions['type'], customPrompt?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);
    const context = selection || text;

    setIsAILoading(true);
    try {
      const result = await generateAIContent({
        type,
        context,
        prompt: customPrompt || '',
      }, aiSettings);

      let newText = '';
      if (selection && type !== 'summarize' && type !== 'custom') {
        newText = text.substring(0, start) + result + text.substring(end);
      } else {
        if (type === 'continue' || type === 'custom') {
          newText = text + '\n\n' + result;
        } else {
           newText = text + '\n\n---\n\n**AI Output:**\n\n' + result;
        }
      }

      handleUpdateContent(newText);
    } catch (error) {
      alert(`AI Error: ${(error as Error).message}`);
    } finally {
      setIsAILoading(false);
    }
  };

  // --- Print Handler ---
  const handlePrint = (settings: PrintSettings) => {
    // 1. Create a dynamic style tag for print metrics
    let style = document.getElementById('nebula-print-style');
    if (!style) {
        style = document.createElement('style');
        style.id = 'nebula-print-style';
        document.head.appendChild(style);
    }

    // 2. Define the @page rules and body overrides
    style.innerHTML = `
      @page {
        size: ${settings.pageSize} ${settings.orientation};
        margin: ${settings.margin}mm;
      }
      @media print {
        body {
          font-size: ${settings.scale}%; 
        }
        /* Ensure preview component stretches correctly */
        .markdown-body {
           padding: 0 !important;
           max-width: none !important;
        }
      }
    `;

    // 3. Close modal and trigger print
    setIsPrintModalOpen(false);
    
    // Small delay to allow modal to close and styles to apply
    setTimeout(() => {
        window.print();
    }, 300);
  };

  // --- Export Handler ---
  const handleExport = (type: 'md' | 'html' | 'word' | 'pdf') => {
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
          // Create a placeholder note for Mermaid diagrams
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
              /* Base Typography */
              body { 
                font-family: 'Calibri', 'Arial', sans-serif; 
                font-size: 11pt; 
                line-height: 1.6; 
                color: #333;
                max-width: 800px;
                margin: 0 auto;
              }
              
              /* Headings */
              h1 { font-size: 24pt; color: #2E74B5; margin-top: 24pt; margin-bottom: 12pt; font-weight: bold; }
              h2 { font-size: 18pt; color: #2E74B5; margin-top: 20pt; margin-bottom: 10pt; font-weight: bold; }
              h3 { font-size: 14pt; color: #2E74B5; margin-top: 16pt; margin-bottom: 8pt; font-weight: bold; }
              h4 { font-size: 12pt; color: #333; margin-top: 14pt; margin-bottom: 6pt; font-weight: bold; }
              
              /* Paragraphs and Text */
              p { margin: 0 0 10pt 0; text-align: justify; }
              strong { font-weight: bold; }
              em { font-style: italic; }
              
              /* Code */
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
              
              /* Tables */
              table { 
                border-collapse: collapse; 
                width: 100%; 
                margin: 12pt 0;
              }
              th { 
                background-color: #f0f0f0; 
                border: 1px solid #ccc; 
                padding: 8pt; 
                text-align: left;
                font-weight: bold;
              }
              td { 
                border: 1px solid #ccc; 
                padding: 8pt; 
              }
              
              /* Lists */
              ul, ol { margin: 10pt 0; padding-left: 24pt; }
              li { margin: 4pt 0; }
              
              /* Blockquotes */
              blockquote { 
                border-left: 4px solid #2E74B5; 
                padding-left: 12pt; 
                margin: 12pt 0;
                color: #666;
                font-style: italic;
              }
              
              /* Images */
              img { 
                max-width: 100%; 
                height: auto;
                margin: 12pt 0;
              }
              
              /* Links */
              a { color: #2E74B5; text-decoration: underline; }
              
              /* Math (KaTeX) - basic styling */
              .katex { font-size: 1.1em; }
              
              /* Page breaks */
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
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-notion-bg text-gray-900 dark:text-notion-text overflow-hidden transition-colors duration-200">
      
      {/* Hidden File Input for Image Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageFileChange}
      />

      <Sidebar 
        documents={documents}
        activeDocId={activeDocId}
        onSelect={setActiveDocId}
        onCreate={handleCreateDoc}
        onDelete={handleDeleteDoc}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <Toolbar 
          onInsert={handleInsert} 
          onAIAction={handleAIAction}
          onExport={handleExport}
          onUploadImage={handleImageUploadTrigger}
          viewMode={viewMode}
          setViewMode={setViewMode}
          isAILoading={isAILoading}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
        />
        
        <div className="flex-1 flex overflow-hidden relative">
          {(viewMode === ViewMode.Split || viewMode === ViewMode.Edit) && (
            <div className={`${viewMode === ViewMode.Split ? 'w-1/2 border-r border-gray-200 dark:border-notion-border' : 'w-full'} h-full no-print`}>
              <Editor 
                value={activeDoc.content} 
                onChange={handleUpdateContent} 
                textareaRef={textareaRef} 
                onScroll={() => handleScroll('editor')}
                setCursorPos={setCursorPos}
                onImageUpload={handleImageUpload}
              />
            </div>
          )}

          {(viewMode === ViewMode.Split || viewMode === ViewMode.Preview) && (
            <div className={`${viewMode === ViewMode.Split ? 'w-1/2' : 'w-full'} h-full bg-white dark:bg-notion-bg print-only`}>
              <Preview 
                markdown={activeDoc.content} 
                scrollRef={previewRef}
                onScroll={() => handleScroll('preview')}
                theme={theme}
                attachments={activeDoc.attachments}
              />
            </div>
          )}
        </div>

        <StatusBar text={activeDoc.content} cursorPos={cursorPos} />
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={aiSettings}
        onSave={setAiSettings}
      />

      <PrintPreviewModal 
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        content={activeDoc.content}
        theme={theme}
        onPrint={handlePrint}
        documentTitle={activeDoc.title}
      />

      <HelpModal 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}

export default App;