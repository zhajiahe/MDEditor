
import React, { useState } from 'react';
import { X, FileText, Sparkles, BookOpen } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'start' | 'syntax'>('start');

  if (!isOpen) return null;

  const tabs = [
    { id: 'start', label: 'Getting Started', icon: BookOpen },
    { id: 'syntax', label: 'Markdown Syntax', icon: FileText },
  ] as const;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-gray-900 w-full max-w-4xl h-[85vh] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex overflow-hidden ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sidebar Navigation */}
        <div className="w-64 bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
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
                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
                  <SyntaxExample title="Code Blocks" code="```javascript\nconsole.log('Hello World');\n```" />
                  <SyntaxExample title="Mermaid Diagrams" code="```mermaid\ngraph TD;\n    A-->B;\n    A-->C;\n    B-->D;\n```" />
                  <SyntaxExample title="Math (KaTeX)" code="$E = mc^2$\n\n$$ \int_0^\infty x^2 dx $$" />
                  <SyntaxExample title="Task Lists" code="- [x] Completed task\n- [ ] Pending task" />
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
  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
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
      <pre className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-300 overflow-x-auto border border-gray-200 dark:border-gray-700">
        {code}
      </pre>
    </div>
  </div>
);
