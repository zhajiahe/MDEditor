import React, { useState, useRef, useEffect } from 'react';
import { X, Download, FileText, Settings } from 'lucide-react';

export interface WordExportSettings {
  fontFamily: 'Calibri' | 'Arial' | 'Times New Roman' | 'Georgia';
  fontSize: 10 | 11 | 12 | 14;
  headingColor: string;
  margins: 'narrow' | 'normal' | 'wide';
  lineSpacing: 1 | 1.15 | 1.5 | 2;
}

const DEFAULT_SETTINGS: WordExportSettings = {
  fontFamily: 'Calibri',
  fontSize: 11,
  headingColor: '#2E74B5',
  margins: 'normal',
  lineSpacing: 1.15,
};

interface WordPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (settings: WordExportSettings) => void;
  htmlContent: string;
  title: string;
}

export const WordPreviewModal: React.FC<WordPreviewModalProps> = ({
  isOpen,
  onClose,
  onExport,
  htmlContent,
  title,
}) => {
  const [settings, setSettings] = useState<WordExportSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wordExportSettings');
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to load word export settings');
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('wordExportSettings', JSON.stringify(settings));
  }, [settings]);

  if (!isOpen) return null;

  const marginValues = {
    narrow: { page: '0.5in', css: '12px' },
    normal: { page: '1in', css: '24px' },
    wide: { page: '1.25in', css: '32px' },
  };

  const lineHeightValues = {
    1: '1',
    1.15: '1.15',
    1.5: '1.5',
    2: '2',
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(settings);
    } finally {
      setIsExporting(false);
    }
  };

  const previewStyles = `
    .word-preview-content {
      font-family: "${settings.fontFamily}", sans-serif;
      font-size: ${settings.fontSize}pt;
      line-height: ${lineHeightValues[settings.lineSpacing]};
      color: #333;
      background: white;
      padding: ${marginValues[settings.margins].css};
    }
    .word-preview-content h1,
    .word-preview-content h2,
    .word-preview-content h3,
    .word-preview-content h4,
    .word-preview-content h5,
    .word-preview-content h6 {
      color: ${settings.headingColor};
      font-weight: bold;
      margin-top: 1em;
      margin-bottom: 0.5em;
    }
    .word-preview-content h1 { font-size: 24pt; }
    .word-preview-content h2 { font-size: 18pt; }
    .word-preview-content h3 { font-size: 14pt; }
    .word-preview-content h4 { font-size: 12pt; }
    .word-preview-content p { margin: 0 0 10pt 0; }
    .word-preview-content code {
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: ${settings.fontSize - 1}pt;
      background: #f5f5f5;
      padding: 2px 4px;
      border-radius: 3px;
    }
    .word-preview-content pre {
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: ${settings.fontSize - 1}pt;
      background: #282c34;
      color: #abb2bf;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      white-space: pre-wrap;
    }
    .word-preview-content pre code {
      background: transparent;
      padding: 0;
      color: inherit;
    }
    .word-preview-content table {
      border-collapse: collapse;
      width: 100%;
      margin: 12pt 0;
    }
    .word-preview-content th,
    .word-preview-content td {
      border: 1px solid #ccc;
      padding: 8pt;
      text-align: left;
    }
    .word-preview-content th {
      background: #f0f0f0;
      font-weight: bold;
    }
    .word-preview-content blockquote {
      border-left: 4px solid ${settings.headingColor};
      padding-left: 12pt;
      margin: 12pt 0;
      color: #666;
      font-style: italic;
    }
    .word-preview-content ul,
    .word-preview-content ol {
      margin: 10pt 0;
      padding-left: 24pt;
    }
    .word-preview-content li { margin: 4pt 0; }
    .word-preview-content img {
      max-width: 100%;
      height: auto;
    }
    .word-preview-content a {
      color: ${settings.headingColor};
      text-decoration: underline;
    }
    .word-preview-content hr {
      border: none;
      border-top: 1px solid #ccc;
      margin: 16pt 0;
    }
    .word-preview-content .katex {
      font-family: 'Cambria Math', 'Times New Roman', serif;
    }
    .word-preview-content [data-mermaid] {
      border: 2px dashed #999;
      padding: 20px;
      text-align: center;
      background: #f5f5f5;
      margin: 10px 0;
    }
  `;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Word Export Preview
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              - {title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Settings Panel */}
          {showSettings && (
            <div className="w-72 p-4 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-4">
                Export Settings
              </h3>

              {/* Font Family */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Font Family
                </label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) =>
                    setSettings({ ...settings, fontFamily: e.target.value as WordExportSettings['fontFamily'] })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  <option value="Calibri">Calibri</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                </select>
              </div>

              {/* Font Size */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Font Size
                </label>
                <select
                  value={settings.fontSize}
                  onChange={(e) =>
                    setSettings({ ...settings, fontSize: parseInt(e.target.value) as WordExportSettings['fontSize'] })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  <option value={10}>10pt</option>
                  <option value={11}>11pt</option>
                  <option value={12}>12pt</option>
                  <option value={14}>14pt</option>
                </select>
              </div>

              {/* Heading Color */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Heading Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.headingColor}
                    onChange={(e) =>
                      setSettings({ ...settings, headingColor: e.target.value })
                    }
                    className="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.headingColor}
                    onChange={(e) =>
                      setSettings({ ...settings, headingColor: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-mono text-sm"
                  />
                </div>
              </div>

              {/* Margins */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Margins
                </label>
                <select
                  value={settings.margins}
                  onChange={(e) =>
                    setSettings({ ...settings, margins: e.target.value as WordExportSettings['margins'] })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  <option value="narrow">Narrow (0.5")</option>
                  <option value="normal">Normal (1")</option>
                  <option value="wide">Wide (1.25")</option>
                </select>
              </div>

              {/* Line Spacing */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Line Spacing
                </label>
                <select
                  value={settings.lineSpacing}
                  onChange={(e) =>
                    setSettings({ ...settings, lineSpacing: parseFloat(e.target.value) as WordExportSettings['lineSpacing'] })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  <option value={1}>Single</option>
                  <option value={1.15}>1.15</option>
                  <option value={1.5}>1.5</option>
                  <option value={2}>Double</option>
                </select>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => setSettings(DEFAULT_SETTINGS)}
                className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Reset to Defaults
              </button>
            </div>
          )}

          {/* Preview Area */}
          <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-900 p-6">
            <div className="max-w-[8.5in] mx-auto bg-white shadow-lg min-h-[11in]">
              <style>{previewStyles}</style>
              <div
                ref={previewRef}
                className="word-preview-content"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export to Word
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

