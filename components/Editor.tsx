import React from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onScroll?: () => void;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange, textareaRef, onScroll }) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    let hasImage = false;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        hasImage = true;
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            insertImage(base64);
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const insertImage = (base64: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const imageMarkdown = `\n![Pasted Image](${base64})\n`;
    
    onChange(before + imageMarkdown + after);
    
    // Defer cursor update
    setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + imageMarkdown.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="h-full w-full bg-white dark:bg-[#1e1e1e] relative group transition-colors duration-200">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        onScroll={onScroll}
        className="w-full h-full bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-300 p-8 resize-none focus:outline-none font-mono text-sm leading-relaxed custom-scrollbar transition-colors duration-200"
        placeholder="Start typing your Markdown here..."
        spellCheck={false}
      />
      <div className="absolute bottom-4 right-4 text-xs text-gray-500 dark:text-gray-500 pointer-events-none select-none bg-gray-100 dark:bg-gray-900/80 px-2 py-1 rounded border border-gray-200 dark:border-gray-800">
        {value.length} chars | {value.split(/\s+/).filter(w => w.length > 0).length} words
      </div>
    </div>
  );
};