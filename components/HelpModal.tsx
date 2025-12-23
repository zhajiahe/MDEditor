import React, { useState } from 'react';
import { X, FileText, Sparkles, BookOpen, Keyboard, Download, Wand2, Settings2 } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'start' | 'syntax' | 'shortcuts' | 'export' | 'ai'>('start');

  if (!isOpen) return null;

  const tabs = [
    { id: 'start', label: 'Getting Started', icon: BookOpen },
    { id: 'syntax', label: 'Markdown Syntax', icon: FileText },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
    { id: 'export', label: 'Export Options', icon: Download },
    { id: 'ai', label: 'AI Features', icon: Wand2 },
  ] as const;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-notion-bg w-full max-w-4xl h-[85vh] rounded-xl shadow-2xl border border-gray-200 dark:border-notion-border flex overflow-hidden ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sidebar Navigation */}
        <div className="w-64 bg-gray-50 dark:bg-notion-sidebar border-r border-gray-200 dark:border-notion-border flex flex-col shrink-0">
          <div className="p-6 border-b border-gray-200 dark:border-notion-border">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400">Nebula</span> Help
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-notion-active text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-gray-200 dark:ring-notion-border'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-notion-hover'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-notion-bg">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-notion-border">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-notion-hover rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            
            {activeTab === 'start' && (
              <div className="space-y-8 max-w-2xl mx-auto">
                <section>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Welcome to Nebula Markdown</h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Nebula is a next-generation Markdown editor designed for speed and enhanced by AI. 
                    Whether you are writing technical documentation, taking notes, or drafting a blog post, 
                    Nebula provides the tools you need in a distraction-free environment.
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FeatureCard 
                    icon={Sparkles}
                    title="AI Assistance"
                    description="Highlight text and use the magic wand to improve grammar, summarize content, or change the tone."
                  />
                  <FeatureCard 
                    icon={FileText}
                    title="Live Preview"
                    description="See your changes instantly. Split view allows you to edit and preview side-by-side with synced scrolling."
                  />
                  <FeatureCard 
                    icon={BookOpen}
                    title="Rich Media"
                    description="Support for Mermaid diagrams, Math equations (KaTeX), and clean image handling."
                  />
                </div>
              </div>
            )}

            {activeTab === 'syntax' && (
              <div className="space-y-8 max-w-3xl mx-auto">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-400">Nebula supports GitHub Flavored Markdown (GFM). Here are some common examples:</p>
                </div>

                <div className="space-y-6">
                  <SyntaxExample title="Headers" code="# Heading 1\n## Heading 2\n### Heading 3" />
                  <SyntaxExample title="Emphasis" code="**Bold**\n*Italic*\n~~Strikethrough~~" />
                  <SyntaxExample title="Lists" code="- Item 1\n- Item 2\n  - Nested Item\n\n1. First\n2. Second" />
                  <SyntaxExample title="Links" code="[Link Text](https://example.com)\n![Image Alt](image.jpg)" />
                  <SyntaxExample title="Code Blocks" code="```javascript\nconsole.log('Hello World');\n```" />
                  <SyntaxExample title="Tables" code="| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |" />
                  <SyntaxExample title="Blockquotes" code="> This is a quote\n>> Nested quote" />
                  <SyntaxExample title="Mermaid Diagrams" code="```mermaid\ngraph TD;\n    A-->B;\n    A-->C;\n    B-->D;\n```" />
                  <SyntaxExample title="Math (KaTeX)" code="Inline: $E = mc^2$\n\nBlock:\n$$ \\int_0^\\infty x^2 dx $$" />
                  <SyntaxExample title="Task Lists" code="- [x] Completed task\n- [ ] Pending task" />
                  <SyntaxExample title="Page Break" code='<div class="page-break"></div>' />
                </div>
              </div>
            )}

            {activeTab === 'shortcuts' && (
              <div className="space-y-8 max-w-2xl mx-auto">
                <p className="text-gray-600 dark:text-gray-400">Keyboard shortcuts to boost your productivity:</p>
                
                <div className="space-y-4">
                  <ShortcutSection title="Formatting">
                    <ShortcutItem keys={['Ctrl', 'B']} description="Bold text" />
                    <ShortcutItem keys={['Ctrl', 'I']} description="Italic text" />
                    <ShortcutItem keys={['Ctrl', 'K']} description="Insert link" />
                  </ShortcutSection>
                  
                  <ShortcutSection title="Editor">
                    <ShortcutItem keys={['Ctrl', 'S']} description="Auto-saved (no action needed)" />
                    <ShortcutItem keys={['Ctrl', 'Z']} description="Undo" />
                    <ShortcutItem keys={['Ctrl', 'Shift', 'Z']} description="Redo" />
                    <ShortcutItem keys={['Tab']} description="Indent" />
                    <ShortcutItem keys={['Shift', 'Tab']} description="Outdent" />
                  </ShortcutSection>
                  
                  <ShortcutSection title="Navigation">
                    <ShortcutItem keys={['Ctrl', 'Home']} description="Go to start" />
                    <ShortcutItem keys={['Ctrl', 'End']} description="Go to end" />
                  </ShortcutSection>
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="space-y-8 max-w-2xl mx-auto">
                <p className="text-gray-600 dark:text-gray-400">Export your documents in multiple formats:</p>
                
                <div className="grid gap-4">
                  <ExportCard 
                    title="Markdown (.md)" 
                    description="Export as raw Markdown file. Images are embedded as base64 reference links."
                    tips={["Best for sharing with other Markdown editors", "Preserves all formatting"]}
                  />
                  <ExportCard 
                    title="HTML (.html)" 
                    description="Export as styled HTML document with embedded CSS."
                    tips={["Opens in any browser", "Includes all styling and formatting"]}
                  />
                  <ExportCard 
                    title="Word (.docx)" 
                    description="Export as Microsoft Word document."
                    tips={["Compatible with MS Word, Google Docs", "Basic formatting preserved"]}
                  />
                  <ExportCard 
                    title="Print / PDF" 
                    description="Use browser print dialog to save as PDF."
                    tips={["Press Ctrl+P or use the toolbar button", "Select 'Save as PDF' in print dialog"]}
                  />
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-8 max-w-2xl mx-auto">
                <p className="text-gray-600 dark:text-gray-400">
                  Nebula integrates AI to help you write better. Configure your API key in Settings.
                </p>
                
                <div className="space-y-4">
                  <AIFeatureCard 
                    title="General Improvement" 
                    description="Enhance clarity, grammar, and flow while preserving meaning."
                  />
                  <AIFeatureCard 
                    title="Fix Grammar & Spelling" 
                    description="Correct errors without changing the writing style."
                  />
                  <AIFeatureCard 
                    title="Tone Adjustment" 
                    description="Make text more professional or friendly."
                  />
                  <AIFeatureCard 
                    title="Summarize" 
                    description="Generate a concise summary of selected text."
                  />
                  <AIFeatureCard 
                    title="Continue Writing" 
                    description="AI continues your text in the same style and tone."
                  />
                  <AIFeatureCard 
                    title="Translate" 
                    description="Translate text to English or improve existing English."
                  />
                  <AIFeatureCard 
                    title="Custom Prompt" 
                    description="Ask AI anything with your own custom instruction."
                  />
                </div>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Tip:</strong> Select text before using AI features to apply changes to specific content. 
                    Without selection, AI operates on the entire document.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: any, title: string, description: string }> = ({ icon: Icon, title, description }) => (
  <div className="p-4 rounded-xl bg-gray-50 dark:bg-notion-sidebar border border-gray-100 dark:border-notion-border">
    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-3">
      <Icon size={20} className="text-indigo-600 dark:text-indigo-400" />
    </div>
    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h5>
    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
  </div>
);

const SyntaxExample: React.FC<{ title: string, code: string }> = ({ title, code }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div className="md:col-span-1">
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
    </div>
    <div className="md:col-span-3">
      <pre className="p-3 bg-gray-100 dark:bg-notion-item rounded-lg text-sm font-mono text-gray-800 dark:text-gray-300 overflow-x-auto border border-gray-200 dark:border-notion-border">
        {code}
      </pre>
    </div>
  </div>
);

const ShortcutSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2">
    <h5 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">{title}</h5>
    <div className="space-y-2">{children}</div>
  </div>
);

const ShortcutItem: React.FC<{ keys: string[], description: string }> = ({ keys, description }) => (
  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-notion-sidebar rounded-lg">
    <span className="text-sm text-gray-600 dark:text-gray-300">{description}</span>
    <div className="flex items-center gap-1">
      {keys.map((key, i) => (
        <React.Fragment key={i}>
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-notion-item text-xs font-mono rounded border border-gray-300 dark:border-notion-border text-gray-700 dark:text-gray-300">
            {key}
          </kbd>
          {i < keys.length - 1 && <span className="text-gray-400">+</span>}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const ExportCard: React.FC<{ title: string, description: string, tips: string[] }> = ({ title, description, tips }) => (
  <div className="p-4 bg-gray-50 dark:bg-notion-sidebar rounded-lg border border-gray-100 dark:border-notion-border">
    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h5>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{description}</p>
    <ul className="space-y-1">
      {tips.map((tip, i) => (
        <li key={i} className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-2">
          <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
          {tip}
        </li>
      ))}
    </ul>
  </div>
);

const AIFeatureCard: React.FC<{ title: string, description: string }> = ({ title, description }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-notion-sidebar rounded-lg border border-gray-100 dark:border-notion-border">
    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
      <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
    </div>
    <div>
      <h5 className="font-medium text-gray-900 dark:text-white text-sm">{title}</h5>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    </div>
  </div>
);