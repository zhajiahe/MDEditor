import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface StatusBarProps {
  text: string;
  cursorPos: { line: number; col: number };
}

export const StatusBar: React.FC<StatusBarProps> = ({ text, cursorPos }) => {
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const charCount = text.length;
  
  // Calculate reading time (avg 200 wpm)
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className="h-7 bg-white dark:bg-notion-sidebar border-t border-gray-200 dark:border-notion-border flex items-center justify-between px-4 text-[11px] font-mono text-gray-500 dark:text-gray-400 select-none transition-colors duration-200">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-help" title="All changes saved locally">
           <CheckCircle2 size={12} className="text-green-600 dark:text-green-500" /> Saved
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Ln {cursorPos.line}, Col {cursorPos.col}</span>
        <span className="w-px h-3 bg-gray-300 dark:bg-gray-700"></span>
        <span className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">{wordCount} words</span>
        <span className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">{charCount} chars</span>
        <span className="w-px h-3 bg-gray-300 dark:bg-gray-700"></span>
        <span className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">{readTime} min read</span>
      </div>
    </div>
  );
};