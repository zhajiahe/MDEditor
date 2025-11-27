
import React, { useState } from 'react';
import { 
  Bold, Italic, List, ListOrdered, Quote, Code, 
  Wand2, Download, FileText, FileCode, Printer, Columns, 
  PanelLeft, PanelRight, Type, Check, X,
  Menu, Image as ImageIcon, Sparkles, Languages, Edit3, Settings, Sun, Moon,
  Command, Scissors
} from 'lucide-react';
import { ViewMode, Theme, AIRequestOptions } from '../types';

interface ToolbarProps {
  onInsert: (prefix: string, suffix: string) => void;
  onAIAction: (type: AIRequestOptions['type'], customPrompt?: string) => void;
  onExport: (type: 'md' | 'html' | 'word' | 'pdf') => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isAILoading: boolean;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onInsert, 
  onAIAction, 
  onExport, 
  viewMode, 
  setViewMode,
  isAILoading,
  toggleSidebar,
  isSidebarOpen,
  theme,
  onToggleTheme,
  onOpenSettings,
  onOpenCommandPalette
}) => {
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const handleCustomAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim()) {
      onAIAction('custom', customPrompt);
      setCustomPrompt('');
      setShowAIMenu(false);
    }
  };

  return (
    <div className="flex flex-col border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 no-print shrink-0 transition-colors duration-200">
      <div className="flex items-center justify-between p-2 gap-2 flex-wrap">
        
        {/* Left Controls */}
        <div className="flex items-center gap-2">
            {!isSidebarOpen && (
                <button onClick={toggleSidebar} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md">
                    <Menu size={18} />
                </button>
            )}
            
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 transition-colors">
                <ToolbarButton icon={Bold} label="Bold (Ctrl+B)" onClick={() => onInsert('**', '**')} />
                <ToolbarButton icon={Italic} label="Italic (Ctrl+I)" onClick={() => onInsert('*', '*')} />
                <ToolbarButton icon={List} label="Bullet List" onClick={() => onInsert('- ', '')} />
                <ToolbarButton icon={ListOrdered} label="Numbered List" onClick={() => onInsert('1. ', '')} />
                <ToolbarButton icon={Quote} label="Quote" onClick={() => onInsert('> ', '')} />
                <ToolbarButton icon={Code} label="Code Block" onClick={() => onInsert('```\n', '\n```')} />
                <ToolbarButton icon={ImageIcon} label="Image" onClick={() => onInsert('![Alt Text](', ')')} />
                <ToolbarButton icon={Scissors} label="Page Break" onClick={() => onInsert('\n<div class="page-break"></div>\n', '')} />
            </div>
        </div>

        {/* AI Controls */}
        <div className="relative">
          <button 
            onClick={() => setShowAIMenu(!showAIMenu)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm
              ${showAIMenu 
                ? 'bg-indigo-600 text-white shadow-indigo-500/30' 
                : 'bg-white dark:bg-indigo-900/30 border border-gray-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50'}
              ${isAILoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={isAILoading}
          >
            <Wand2 size={16} className={isAILoading ? "animate-spin" : ""} />
            {isAILoading ? 'Thinking...' : 'AI Assist'}
          </button>

          {showAIMenu && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/5">
              <div className="p-1 space-y-0.5">
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Improve</div>
                <MenuButton onClick={() => { onAIAction('improve'); setShowAIMenu(false); }} label="General Improvement" icon={Sparkles} />
                <MenuButton onClick={() => { onAIAction('fix_grammar'); setShowAIMenu(false); }} label="Fix Grammar & Spelling" icon={Check} />
                
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-2">Tone</div>
                <MenuButton onClick={() => { onAIAction('tone_professional'); setShowAIMenu(false); }} label="Make Professional" icon={Edit3} />
                <MenuButton onClick={() => { onAIAction('tone_friendly'); setShowAIMenu(false); }} label="Make Friendly" icon={Edit3} />

                <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-2">Generate</div>
                <MenuButton onClick={() => { onAIAction('summarize'); setShowAIMenu(false); }} label="Summarize Selection" icon={FileText} />
                <MenuButton onClick={() => { onAIAction('continue'); setShowAIMenu(false); }} label="Continue Writing" icon={Type} />
                <MenuButton onClick={() => { onAIAction('translate'); setShowAIMenu(false); }} label="Translate / Fix English" icon={Languages} />
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-850">
                <form onSubmit={handleCustomAISubmit} className="flex gap-2">
                  <input 
                    type="text" 
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Ask Gemini..."
                    className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 placeholder-gray-400 dark:placeholder-gray-600"
                  />
                  <button type="submit" className="p-1.5 bg-indigo-600 rounded-md text-white hover:bg-indigo-500 shadow-sm">
                    <Wand2 size={12} />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1"></div>

        {/* View Modes */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 hidden md:flex transition-colors">
          <ToolbarButton 
            icon={PanelLeft} 
            label="Editor Only" 
            active={viewMode === ViewMode.Edit} 
            onClick={() => setViewMode(ViewMode.Edit)} 
          />
          <ToolbarButton 
            icon={Columns} 
            label="Split View" 
            active={viewMode === ViewMode.Split} 
            onClick={() => setViewMode(ViewMode.Split)} 
          />
          <ToolbarButton 
            icon={PanelRight} 
            label="Preview Only" 
            active={viewMode === ViewMode.Preview} 
            onClick={() => setViewMode(ViewMode.Preview)} 
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-2">
             {/* Export Actions */}
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 transition-colors">
                <ToolbarButton icon={Download} label="Export Markdown" onClick={() => onExport('md')} />
                <ToolbarButton icon={FileCode} label="Export HTML" onClick={() => onExport('html')} />
                <ToolbarButton icon={FileText} label="Export Word" onClick={() => onExport('word')} />
                <ToolbarButton icon={Printer} label="Print / PDF" onClick={() => onExport('pdf')} />
            </div>

            {/* App Settings */}
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 transition-colors">
                <button
                    onClick={onOpenCommandPalette}
                    className="hidden sm:flex p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Command Palette (Ctrl+K)"
                >
                    <Command size={18} />
                </button>
                <button
                    onClick={onToggleTheme}
                    className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button
                    onClick={onOpenSettings}
                    className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Settings"
                >
                    <Settings size={18} />
                </button>
            </div>
        </div>

      </div>
      
      {showAIMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowAIMenu(false)}></div>
      )}
    </div>
  );
};

const ToolbarButton: React.FC<{
  icon: React.ComponentType<any>;
  label: string;
  onClick: () => void;
  active?: boolean;
}> = ({ icon: Icon, label, onClick, active }) => (
  <button
    onClick={onClick}
    title={label}
    className={`p-1.5 rounded-md transition-all ${
      active 
        ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white shadow-inner' 
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
    }`}
  >
    <Icon size={18} />
  </button>
);

const MenuButton: React.FC<{ onClick: () => void; label: string; icon: any }> = ({ onClick, label, icon: Icon }) => (
  <button 
    onClick={onClick}
    className="w-full text-left flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300 transition-colors"
  >
    <Icon size={14} className="text-indigo-500 dark:text-indigo-400" />
    {label}
  </button>
);
