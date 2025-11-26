
import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';
import { Theme } from '../types';

interface MermaidDiagramProps {
  chart: string;
  theme?: Theme;
}

// Initialize globally with safe defaults to prevent race conditions during module load
mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  suppressErrorRendering: true,
});

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, theme = 'dark' }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const mountRef = useRef(true);

  useEffect(() => {
    mountRef.current = true;
    return () => {
      mountRef.current = false;
    };
  }, []);

  useEffect(() => {
    const renderChart = async () => {
      // 1. Basic validation
      if (!chart || chart.trim().length === 0) {
        if (mountRef.current) {
             setSvg('');
             setError(null);
        }
        return;
      }

      try {
        // 2. Configure for current theme
        // Note: mermaid.initialize merges options.
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
        });

        // 3. Render
        // Generate a unique ID to prevent collisions in the DOM during calculation
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        
        // mermaid.render returns a promise resolving to { svg }
        const { svg } = await mermaid.render(id, chart);
        
        if (mountRef.current) {
          setSvg(svg);
          setError(null);
        }
      } catch (err) {
        console.error('Mermaid Rendering Failed:', err);
        if (mountRef.current) {
          // Provide a generic error message as the specific "Could not find a suitable point" 
          // is often internal to the layout engine (dagre) and confusing to users.
          setError('Syntax Error or Layout Failure');
        }
      }
    };

    renderChart();
  }, [chart, theme]);

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-md text-red-600 dark:text-red-300 text-xs font-mono overflow-auto my-4">
        <div className="font-semibold mb-1 flex items-center gap-2">
            <span>⚠️ Diagram Error</span>
        </div>
        <div className="opacity-80">{error}</div>
        <details className="mt-2">
           <summary className="cursor-pointer opacity-70 hover:opacity-100 select-none">Show Source</summary>
           <pre className="mt-1 opacity-70 p-2 bg-white dark:bg-gray-900 rounded">{chart}</pre>
        </details>
      </div>
    );
  }

  if (!svg) return null;

  return (
    <div 
      className="mermaid-container my-6 flex justify-center bg-white dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800 overflow-x-auto shadow-sm transition-colors duration-200"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
};
