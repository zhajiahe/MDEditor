import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Toolbar } from './components/Toolbar';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';
import { StatusBar } from './components/StatusBar';
import { HelpModal } from './components/HelpModal';
import { ToastContainer } from './components/Toast';
import { ViewMode, AIRequestOptions, MarkdownDoc, Theme, AISettings } from './types';
import { generateAIContent } from './services/geminiService';
import { compressImage } from './utils/editorUtils';
import { exportToWord, downloadBlob, WordExportSettings } from './utils/wordExport';
import { WordPreviewModal } from './components/WordPreviewModal';
import { useDocuments } from './hooks/useDocuments';
import { useToast } from './hooks/useToast';

function App() {
  // --- Document Management Hook ---
  const {
    documents,
    activeDocId,
    activeDoc,
    setActiveDocId,
    setDocuments,
    handleUpdateContent,
    handleCreateDoc,
    handleDeleteDoc,
  } = useDocuments();

  // --- Toast Hook ---
  const { toasts, addToast, removeToast } = useToast();

  // --- Settings & Theme State ---
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('nebula-theme') as Theme) || 'light';
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
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isWordPreviewOpen, setIsWordPreviewOpen] = useState(false);
  const [wordPreviewHtml, setWordPreviewHtml] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Split);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Editor State for Status Bar
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isScrolling = useRef(false);

  // --- Theme Persistence ---
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

  // --- Scroll Sync ---
  const handleScroll = useCallback((source: 'editor' | 'preview') => {
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
  }, []);

  // --- Insert Helper ---
  const handleInsert = useCallback((prefix: string, suffix: string) => {
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
  }, [handleUpdateContent]);

  // --- Image Handling ---
  const handleImageUpload = useCallback(async (file: File) => {
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
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selection = textarea.value.substring(start, end);
        const altText = selection || 'Image';
        const tag = `![${altText}](attachment:${id})`;
        
        handleInsert(tag, '');
      }
      
      addToast('Image uploaded successfully', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to process image', 'error');
    }
  }, [activeDocId, handleInsert, setDocuments, addToast]);

  const handleImageUploadTrigger = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleImageUpload]);

  // --- AI Handler ---
  const handleAIAction = useCallback(async (type: AIRequestOptions['type'], customPrompt?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);
    const context = selection || text;

    setIsAILoading(true);
    addToast('AI is processing...', 'info');
    
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
      addToast('AI content generated successfully', 'success');
    } catch (error) {
      addToast(`AI Error: ${(error as Error).message}`, 'error');
    } finally {
      setIsAILoading(false);
    }
  }, [aiSettings, handleUpdateContent, addToast]);

  // --- Export Handler ---
  const handleExport = useCallback((type: 'md' | 'html' | 'word' | 'print') => {
    // Handle print via browser dialog
    if (type === 'print') {
      const previewElement = document.querySelector('.markdown-body');
      if (!previewElement) return;

      // Create a print-only iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '0';
      iframe.style.height = '0';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      // Copy styles from parent document
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(el => el.outerHTML)
        .join('\n');

      // Build the print document
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${activeDoc.title}</title>
          ${styles}
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: system-ui, -apple-system, sans-serif;
              background: white;
              color: #1a1a1a;
            }
            .markdown-body {
              max-width: none !important;
              background: white !important;
            }
            .page-break {
              page-break-after: always;
              break-after: page;
            }
            h1, h2, h3, h4, h5, h6 {
              page-break-after: avoid;
              break-after: avoid;
            }
            p, li, pre, blockquote, table, img {
              page-break-inside: avoid;
              break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div class="prose max-w-none markdown-body">
            ${previewElement.innerHTML}
          </div>
        </body>
        </html>
      `);
      iframeDoc.close();

      // Wait for iframe to load, then print
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        // Remove iframe after print dialog closes
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 300);
      return;
    }

    const previewElement = document.querySelector('.markdown-body');
    const htmlContent = previewElement ? previewElement.innerHTML : '';
    const safeTitle = activeDoc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    if (type === 'word') {
      if (!htmlContent) {
        addToast("No content to export", 'error');
        return;
      }

      // Store HTML and open Word preview modal
      setWordPreviewHtml(htmlContent);
      setIsWordPreviewOpen(true);
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
      addToast('HTML file exported successfully', 'success');
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
    addToast('Markdown file exported successfully', 'success');
  }, [activeDoc, addToast]);

  // --- Word Export Handler (from preview modal) ---
  const handleWordExport = useCallback(async (settings: WordExportSettings) => {
    const safeTitle = activeDoc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    if (!wordPreviewHtml) {
      addToast("No content to export", 'error');
      return;
    }

    try {
      const blob = await exportToWord({
        title: activeDoc.title,
        htmlContent: wordPreviewHtml,
        attachments: activeDoc.attachments,
        settings: settings,
      });
      downloadBlob(blob, `${safeTitle}.docx`);
      addToast('Word document exported successfully', 'success');
      setIsWordPreviewOpen(false);
    } catch (error) {
      console.error('Word export error:', error);
      addToast(`Word export failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }, [activeDoc, addToast, wordPreviewHtml]);

  // --- Memoized Callbacks for Toggle Operations ---
  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
  const toggleTheme = useCallback(() => setTheme(prev => prev === 'dark' ? 'light' : 'dark'), []);
  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);
  const openHelp = useCallback(() => setIsHelpOpen(true), []);
  const closeHelp = useCallback(() => setIsHelpOpen(false), []);

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
        onToggle={toggleSidebar}
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
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenSettings={openSettings}
          onOpenHelp={openHelp}
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
        onClose={closeSettings} 
        settings={aiSettings}
        onSave={setAiSettings}
      />

      <HelpModal 
        isOpen={isHelpOpen}
        onClose={closeHelp}
      />

      <WordPreviewModal
        isOpen={isWordPreviewOpen}
        onClose={() => setIsWordPreviewOpen(false)}
        onExport={handleWordExport}
        htmlContent={wordPreviewHtml}
        title={activeDoc.title}
      />
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;