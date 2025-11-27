import React, { useState, useRef } from 'react';
import { X, Printer, Layout, Minimize, Maximize, Type, Download } from 'lucide-react';
import { PrintSettings, Theme } from '../types';
import { Preview } from './Preview';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  theme: Theme;
  onPrint: (settings: PrintSettings) => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  content,
  theme,
  onPrint
}) => {
  const [settings, setSettings] = useState<PrintSettings>({
    pageSize: 'a4',
    orientation: 'portrait',
    margin: 20, // 20mm
    scale: 100, // 100%
    showPageNumbers: true
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Calculate simulated dimensions for the preview container
  const getPageDimensions = () => {
    let width = 210; // A4 width mm
    let height = 297; // A4 height mm

    if (settings.pageSize === 'letter') {
      width = 216;
      height = 279;
    } else if (settings.pageSize === 'legal') {
      width = 216;
      height = 356;
    }

    if (settings.orientation === 'landscape') {
      return { width: height, height: width };
    }
    return { width, height };
  };

  const dims = getPageDimensions();

  const handleDownloadPdf = () => {
    const element = printContentRef.current;
    if (!element) return;

    // @ts-ignore
    if (typeof window.html2pdf === 'undefined') {
        alert("PDF generator library is not loaded.");
        return;
    }

    setIsGeneratingPdf(true);

    const opt = {
        margin: settings.margin, // Uses jsPDF units (mm)
        filename: 'document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: settings.pageSize, orientation: settings.orientation }
    };

    // @ts-ignore
    window.html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => setIsGeneratingPdf(false))
        .catch((err: any) => {
            console.error(err);
            setIsGeneratingPdf(false);
            alert("Failed to generate PDF.");
        });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-notion-bg w-[95vw] h-[90vh] rounded-xl shadow-2xl flex overflow-hidden border border-gray-200 dark:border-notion-border">
        
        {/* Left Sidebar: Controls */}
        <div className="w-80 bg-gray-50 dark:bg-notion-sidebar border-r border-gray-200 dark:border-notion-border flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-200 dark:border-notion-border flex justify-between items-center">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Printer size={18} /> Print Setup
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            
            {/* Page Size */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Page Size</label>
              <div className="grid grid-cols-3 gap-2">
                {(['a4', 'letter', 'legal'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSettings({ ...settings, pageSize: size })}
                    className={`px-2 py-2 text-sm rounded border capitalize ${
                      settings.pageSize === size
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white dark:bg-notion-item border-gray-300 dark:border-notion-border text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Orientation */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Orientation</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSettings({ ...settings, orientation: 'portrait' })}
                  className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded border ${
                    settings.orientation === 'portrait'
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white dark:bg-notion-item border-gray-300 dark:border-notion-border text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Minimize size={14} className="rotate-90" /> Portrait
                </button>
                <button
                  onClick={() => setSettings({ ...settings, orientation: 'landscape' })}
                  className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded border ${
                    settings.orientation === 'landscape'
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white dark:bg-notion-item border-gray-300 dark:border-notion-border text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Maximize size={14} /> Landscape
                </button>
              </div>
            </div>

            {/* Margins */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider flex items-center gap-1">
                  <Layout size={12} /> Margins (mm)
                </label>
                <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{settings.margin}mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={settings.margin}
                onChange={(e) => setSettings({ ...settings, margin: Number(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-notion-item accent-indigo-600"
              />
            </div>

            {/* Font Scale */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider flex items-center gap-1">
                  <Type size={12} /> Font Scale
                </label>
                <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{settings.scale}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                step="5"
                value={settings.scale}
                onChange={(e) => setSettings({ ...settings, scale: Number(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-notion-item accent-indigo-600"
              />
            </div>

          </div>

          <div className="p-4 border-t border-gray-200 dark:border-notion-border bg-white dark:bg-notion-sidebar space-y-2">
            <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-notion-item dark:hover:bg-notion-hover text-gray-800 dark:text-white rounded-lg font-medium shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
                {isGeneratingPdf ? (
                    <span className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></span>
                ) : (
                    <Download size={18} />
                )}
                {isGeneratingPdf ? "Generating..." : "Download PDF"}
            </button>
            <button
              onClick={() => onPrint(settings)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium shadow-md flex items-center justify-center gap-2 transition-colors"
            >
              <Printer size={18} /> Print System Dialog
            </button>
          </div>
        </div>

        {/* Right Area: Preview Canvas */}
        <div className="flex-1 bg-gray-100 dark:bg-notion-item p-8 overflow-auto flex justify-center items-start">
          <div
            className="bg-white shadow-2xl transition-all duration-300 ease-in-out relative origin-top"
            style={{
              width: `${dims.width}mm`,
              minHeight: `${dims.height}mm`,
              padding: `${settings.margin}mm`,
            }}
          >
             {/* 
                We use the ref here to capture just the content content for html2pdf.
                We apply the font size scaling directly here so it is preserved in the snapshot.
             */}
             <div 
                ref={printContentRef}
                className={`prose max-w-none ${settings.scale < 80 ? 'prose-sm' : settings.scale > 120 ? 'prose-lg' : ''}`}
                style={{
                    fontSize: `${settings.scale / 100}rem`,
                }}
             >
                <Preview 
                  markdown={content} 
                  scrollRef={{ current: null }} // No scroll sync needed here
                  theme="light" // Always preview in light mode for print
                />
             </div>

             {/* Visual Page Break Guidelines (Approximate) */}
             <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div 
                        key={i} 
                        className="w-full border-b border-dashed border-red-300 opacity-30 text-[10px] text-red-400 text-right pr-2"
                        style={{ top: `${(i + 1) * dims.height}mm`, position: 'absolute' }}
                    >
                        Page {i + 1} End (Approx)
                    </div>
                ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};