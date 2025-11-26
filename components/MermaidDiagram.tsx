import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Theme } from '../types';

interface MermaidDiagramProps {
  chart: string;
  theme?: Theme;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, theme = 'dark' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Re-initialize mermaid with new theme
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
    });

    const renderChart = async () => {
      if (!ref.current) return;
      
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      try {
        setError(null);
        // Reset mermaid logic to ensure clean render
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (err) {
        console.error('Mermaid Render Error:', err);
        setError('Syntax Error in Diagram');
        // Mermaid sometimes leaves global error state, this might persist
      }
    };

    renderChart();
  }, [chart, theme]); // Re-run when chart or theme changes

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded text-red-600 dark:text-red-300 text-sm font-mono">
        {error}
        <pre className="mt-2 text-xs opacity-70">{chart}</pre>
      </div>
    );
  }

  return (
    <div 
      ref={ref} 
      className="mermaid-container my-6 flex justify-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg overflow-x-auto transition-colors duration-200"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
};