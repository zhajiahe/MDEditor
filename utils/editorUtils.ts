import React from 'react';

/**
 * Compresses an image file to a lower quality/resolution Base64 string.
 */
export const compressImage = (file: File, maxWidth = 1024, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Convert to JPEG for better compression than PNG for photos
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * Handles smart key presses in the editor (Tab, Enter, pairs).
 */
export const handleSmartKeyDown = (
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  value: string,
  onChange: (val: string, cursorOffset?: number) => void
) => {
  const textarea = e.currentTarget;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  // 1. Tab Indentation
  if (e.key === 'Tab') {
    e.preventDefault();
    // Insert 2 spaces
    const newValue = value.substring(0, start) + '  ' + value.substring(end);
    onChange(newValue, start + 2);
    return;
  }

  // 2. Auto-List Continuation
  if (e.key === 'Enter') {
    const currentLineStart = value.lastIndexOf('\n', start - 1) + 1;
    const currentLine = value.substring(currentLineStart, start);
    
    // Regex to match list markers: "- ", "* ", "1. "
    const listMatch = currentLine.match(/^(\s*)([-*]|\d+\.)\s/);
    
    if (listMatch) {
      // If line is ONLY the list marker (empty item), delete it and exit list
      if (currentLine.trim() === listMatch[0].trim()) {
        e.preventDefault();
        const newValue = value.substring(0, currentLineStart) + value.substring(start);
        onChange(newValue, currentLineStart);
        return;
      }

      e.preventDefault();
      const indent = listMatch[1];
      let marker = listMatch[2];
      
      // If it's a numbered list, increment the number
      if (/^\d+\.$/.test(marker)) {
        const num = parseInt(marker);
        marker = `${num + 1}.`;
      }

      const insertion = `\n${indent}${marker} `;
      const newValue = value.substring(0, start) + insertion + value.substring(end);
      onChange(newValue, start + insertion.length);
      return;
    }
  }

  // 3. Auto-Close Pairs
  const pairs: Record<string, string> = {
    '(': ')',
    '[': ']',
    '{': '}',
    '"': '"',
    "'": "'",
    '`': '`'
  };

  if (pairs[e.key]) {
    e.preventDefault();
    const closeChar = pairs[e.key];
    const newValue = value.substring(0, start) + e.key + closeChar + value.substring(end);
    onChange(newValue, start + 1); // Move cursor between chars
    return;
  }
};