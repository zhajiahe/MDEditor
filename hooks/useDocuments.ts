import { useState, useEffect, useCallback } from 'react';
import { MarkdownDoc } from '../types';

const DEFAULT_DOC_ID = 'default-doc';
const WELCOME_CONTENT = `# Welcome to Nebula Markdown

This is an **AI-powered** Markdown editor.

## Features
- **File Management**: Create and manage multiple documents in the sidebar.
- **AI Assist**: Use the magic wand to improve, summarize, or continue your text.
- **Diagrams**: Support for Mermaid.js diagrams.
\`\`\`mermaid
graph TD;
    A[Start] --> B{Is it AI?};
    B -- Yes --> C[Great!];
    B -- No --> D[Make it AI];
\`\`\`
- **Math**: $E = mc^2$
- **Images**: Paste images directly from your clipboard!
- **Export**: PDF, Markdown, HTML, and Word (.docx).

## Try it out!
Select this text and ask AI to translate it, or just start typing...
`;

export const useDocuments = () => {
  const [documents, setDocuments] = useState<MarkdownDoc[]>(() => {
    try {
      const stored = localStorage.getItem('nebula-docs');
      return stored ? JSON.parse(stored) : [{
        id: DEFAULT_DOC_ID,
        title: 'Welcome Note',
        content: WELCOME_CONTENT,
        lastModified: Date.now(),
        attachments: {}
      }];
    } catch {
      return [{
        id: DEFAULT_DOC_ID,
        title: 'Welcome Note',
        content: WELCOME_CONTENT,
        lastModified: Date.now(),
        attachments: {}
      }];
    }
  });

  const [activeDocId, setActiveDocId] = useState<string>(() => {
    return localStorage.getItem('nebula-active-doc') || DEFAULT_DOC_ID;
  });

  const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];

  // Persist documents
  useEffect(() => {
    localStorage.setItem('nebula-docs', JSON.stringify(documents));
  }, [documents]);

  // Persist active doc
  useEffect(() => {
    localStorage.setItem('nebula-active-doc', activeDocId);
  }, [activeDocId]);

  const updateContent = useCallback((newContent: string) => {
    const titleMatch = newContent.match(/^#\s+(.+)$/m) || newContent.match(/^(.+)$/m);
    const newTitle = titleMatch ? titleMatch[1].trim() : 'Untitled';
    
    setDocuments(docs => docs.map(doc => 
      doc.id === activeDocId 
        ? { ...doc, content: newContent, title: newTitle.substring(0, 30), lastModified: Date.now() } 
        : doc
    ));
  }, [activeDocId]);

  const createDoc = useCallback(() => {
    const newDoc: MarkdownDoc = {
      id: crypto.randomUUID(),
      title: 'New Document',
      content: '',
      lastModified: Date.now(),
      attachments: {}
    };
    setDocuments(prev => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
    return newDoc;
  }, []);

  const deleteDoc = useCallback((id: string) => {
    if (documents.length <= 1) {
      return false;
    }
    
    setDocuments(prev => {
      const newDocs = prev.filter(d => d.id !== id);
      if (activeDocId === id) {
        setActiveDocId(newDocs[0].id);
      }
      return newDocs;
    });
    return true;
  }, [documents.length, activeDocId]);

  const updateAttachments = useCallback((attachmentId: string, base64: string) => {
    setDocuments(docs => docs.map(doc => {
      if (doc.id === activeDocId) {
        return {
          ...doc,
          attachments: { ...(doc.attachments || {}), [attachmentId]: base64 },
          lastModified: Date.now()
        };
      }
      return doc;
    }));
  }, [activeDocId]);

  return {
    documents,
    activeDoc,
    activeDocId,
    setActiveDocId,
    setDocuments,
    handleUpdateContent: updateContent,
    handleCreateDoc: createDoc,
    handleDeleteDoc: deleteDoc,
    updateAttachments
  };
};

