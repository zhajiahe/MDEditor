
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { MermaidDiagram } from './MermaidDiagram';
import { Theme } from '../types';
import { useDebounce } from '../hooks/useDebounce';

interface PreviewProps {
  markdown: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScroll?: () => void;
  theme: Theme;
}

export const Preview: React.FC<PreviewProps> = ({ markdown, scrollRef, onScroll, theme }) => {
  // Debounce the markdown sent to the heavy renderers
  const debouncedMarkdown = useDebounce(markdown, 300);

  return (
    <div 
      ref={scrollRef}
      onScroll={onScroll}
      className="markdown-body prose dark:prose-invert prose-blue max-w-none h-full overflow-auto p-8 bg-white dark:bg-gray-950 scroll-smooth transition-colors duration-200"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');
            const language = match ? match[1] : '';

            if (language === 'mermaid') {
              return <MermaidDiagram chart={String(children).replace(/\n$/, '')} theme={theme} />;
            }
            
            return !isInline ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <code className="bg-gray-100 dark:bg-gray-800 text-red-500 dark:text-red-300 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          img: (props) => (
            <img {...props} className="rounded-lg shadow-lg max-w-full h-auto my-4 mx-auto" alt={props.alt || 'Markdown Image'} loading="lazy" />
          ),
          table: (props) => (
            <div className="overflow-x-auto my-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <table {...props} className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" />
            </div>
          ),
          th: (props) => <th {...props} className="bg-gray-50 dark:bg-gray-800 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />,
          td: (props) => <td {...props} className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700" />,
          blockquote: (props) => <blockquote {...props} className="border-l-4 border-indigo-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4" />,
          a: (props) => <a {...props} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 underline decoration-indigo-500/30" target="_blank" rel="noopener noreferrer" />,
          h1: (props) => <h1 {...props} className="text-3xl font-bold border-b border-gray-200 dark:border-gray-800 pb-2 mb-4 mt-8 text-gray-900 dark:text-white" />,
          h2: (props) => <h2 {...props} className="text-2xl font-bold mb-3 mt-6 text-gray-800 dark:text-white" />,
        }}
      >
        {debouncedMarkdown}
      </ReactMarkdown>
    </div>
  );
};
