import React from 'react';

export interface AIRequestOptions {
  prompt: string;
  context?: string;
  type: 'improve' | 'summarize' | 'translate' | 'continue' | 'custom' | 'fix_grammar' | 'tone_professional' | 'tone_friendly';
}

export enum ViewMode {
  Split = 'SPLIT',
  Edit = 'EDIT',
  Preview = 'PREVIEW'
}

export interface ToolbarAction {
  icon: React.ComponentType<any>;
  label: string;
  action: () => void;
  shortcut?: string;
}

export interface MarkdownDoc {
  id: string;
  title: string;
  content: string;
  lastModified: number;
  attachments?: Record<string, string>; // id -> base64
}

export type Theme = 'light' | 'dark';

export interface AISettings {
  provider: 'gemini' | 'openai';
  baseUrl?: string;
  apiKey?: string;
  model?: string;
}