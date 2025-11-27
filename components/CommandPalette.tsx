
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Command, FileText, Download, Moon, Sun, 
  Split, PanelLeft, PanelRight, Sparkles, Plus, CircleHelp
} from 'lucide-react';
import { ViewMode, Theme } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: {
    setViewMode: (mode: ViewMode) => void;
    toggleTheme: () => void;
    onExport: (type: 'md' | 'html' | 'word' | 'pdf') => void;
    handleCreateDoc: () => void;
    onOpenHelp: () => void;
    theme: Theme;
  }
}

interface Command {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  shortcut?: string;
  action: () => void;
  group: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, actions }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { id: 'new', label: 'New Document', icon: Plus, action: actions.handleCreateDoc, group: 'File' },
    { id: 'export-pdf', label: 'Export as PDF', icon: Download, action: () => actions.onExport('pdf'), group: 'Export' },
    { id: 'export-md', label: 'Export as Markdown', icon: FileText, action: () => actions.onExport('md'), group: 'Export' },
    { id: 'export-html', label: 'Export as HTML', icon: FileText, action: () => actions.onExport('html'), group: 'Export' },
    { id: 'export-word', label: 'Export as Word', icon: FileText, action: () => actions.onExport('word'), group: 'Export' },
    { id: 'theme', label: `Switch to ${actions.theme === 'dark' ? 'Light' : 'Dark'} Mode`, icon: actions.theme === 'dark' ? Sun : Moon, action: actions.toggleTheme, group: 'Appearance' },
    { id: 'view-split', label: 'Split View', icon: Split, action: () => actions.setViewMode(ViewMode.Split), group: 'View' },
    { id: 'view-editor', label: 'Editor Only', icon: PanelLeft, action: () => actions.setViewMode(ViewMode.Edit), group: 'View' },
    { id: 'view-preview', label: 'Preview Only', icon: PanelRight, action: () => actions.setViewMode(ViewMode.Preview), group: 'View' },
    { id: 'help', label: 'Open Help & Documentation', icon: CircleHelp, action: actions.onOpenHelp, group: 'Help' },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/20 dark:bg-black/50 backdrop-blur-[1px] transition-all">
      <div 
        className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 ring-1 ring-black/5 flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <Search size={18} className="text-gray-400 dark:text-gray-500 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
            placeholder="Type a command..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No results found.
            </div>
          ) : (
            <div className="space-y-1">
               {filteredCommands.map((cmd, index) => (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                      index === selectedIndex
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <cmd.icon size={16} className={`shrink-0 ${index === selectedIndex ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
                    <span className="flex-1 text-left">{cmd.label}</span>
                    {cmd.group && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-50">{cmd.group}</span>
                    )}
                  </button>
               ))}
            </div>
          )}
        </div>
        
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500">
           <span>Navigate: ↑ ↓</span>
           <span>Select: Enter</span>
        </div>
      </div>
    </div>
  );
};
