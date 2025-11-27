import React, { useState } from 'react';
import { Plus, Trash2, FileText, Search, Menu, PanelLeftClose } from 'lucide-react';
import { MarkdownDoc } from '../types';

interface SidebarProps {
  documents: MarkdownDoc[];
  activeDocId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  documents,
  activeDocId,
  onSelect,
  onCreate,
  onDelete,
  isOpen,
  onToggle
}) => {
  const [search, setSearch] = useState('');

  const filteredDocs = documents
    .filter(doc => doc.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.lastModified - a.lastModified);

  if (!isOpen) return null;

  return (
    <div className="w-64 bg-gray-50 dark:bg-notion-sidebar border-r border-gray-200 dark:border-notion-border flex flex-col h-full no-print shrink-0 transition-all duration-300">
      <div className="p-4 border-b border-gray-200 dark:border-notion-border flex items-center justify-between">
        <h2 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Menu size={18} className="text-indigo-600 dark:text-indigo-400" /> Nebula
        </h2>
        <div className="flex items-center gap-1">
          <button 
            onClick={onCreate}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white transition-colors"
            title="New Document"
          >
            <Plus size={16} />
          </button>
          <button 
            onClick={onToggle}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-notion-hover rounded-md transition-colors"
            title="Close Sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
      </div>

      <div className="p-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search docs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-notion-bg border border-gray-200 dark:border-notion-border rounded-md py-1.5 pl-8 pr-3 text-sm text-gray-900 dark:text-notion-text focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5 custom-scrollbar">
        {filteredDocs.map(doc => (
          <div
            key={doc.id}
            onClick={() => onSelect(doc.id)}
            className={`group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-all ${
              doc.id === activeDocId 
                ? 'bg-white dark:bg-notion-active text-indigo-600 dark:text-notion-text border-l-2 border-indigo-500 shadow-sm dark:shadow-none font-medium' 
                : 'text-gray-600 dark:text-notion-muted hover:bg-gray-200 dark:hover:bg-notion-hover hover:text-gray-900 dark:hover:text-notion-text border-l-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <FileText size={16} className="shrink-0" />
              <div className="truncate flex flex-col">
                <span className="text-sm truncate w-32">{doc.title || 'Untitled'}</span>
                <span className="text-[10px] opacity-70">
                  {new Date(doc.lastModified).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-notion-hover rounded transition-all"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};