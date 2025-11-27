import React, { useRef, useState } from 'react';
import { handleSmartKeyDown } from '../utils/editorUtils';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onScroll?: () => void;
  setCursorPos: (pos: { line: number; col: number }) => void;
  onImageUpload: (file: File) => void;
}

export const Editor: React.FC<EditorProps> = ({ 
  value, 
  onChange, 
  textareaRef, 
  onScroll, 
  setCursorPos,
  onImageUpload
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    updateCursorPos(e.target);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleSmartKeyDown(e, value, (newValue, newCursor) => {
      onChange(newValue);
      // We need to defer setting cursor because React state update is async
      setTimeout(() => {
        if (textareaRef.current && newCursor !== undefined) {
          textareaRef.current.setSelectionRange(newCursor, newCursor);
          updateCursorPos(textareaRef.current);
        }
      }, 0);
    });
  };

  const updateCursorPos = (element: HTMLTextAreaElement) => {
    const text = element.value.substring(0, element.selectionStart);
    const lines = text.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    setCursorPos({ line, col });
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    let hasImage = false;

    // Check if there is an image to prevent default paste behavior if so
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            hasImage = true;
            break;
        }
    }

    if (hasImage) {
        e.preventDefault();
        const item = Array.from(items).find(item => item.type.indexOf('image') !== -1);
        const file = item?.getAsFile();
        if (file) {
            onImageUpload(file);
        }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const items = e.dataTransfer.files;
      if (items && items.length > 0) {
          const file = items[0];
          if (file.type.startsWith('image/')) {
              onImageUpload(file);
          }
      }
  };

  return (
    <div 
        className="h-full w-full bg-white dark:bg-[#1e1e1e] relative group transition-colors duration-200"
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={(e) => updateCursorPos(e.currentTarget)}
        onClick={(e) => updateCursorPos(e.currentTarget)}
        onPaste={handlePaste}
        onScroll={onScroll}
        className="w-full h-full bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-300 p-8 resize-none focus:outline-none font-mono text-sm leading-relaxed custom-scrollbar transition-colors duration-200"
        placeholder="Start typing..."
        spellCheck={false}
      />
      {isDragOver && (
          <div className="absolute inset-0 bg-indigo-500/10 border-2 border-indigo-500 border-dashed m-4 rounded-xl flex items-center justify-center pointer-events-none">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-white dark:bg-gray-900 px-4 py-2 rounded-lg shadow-sm">Drop image to insert</span>
          </div>
      )}
    </div>
  );
};