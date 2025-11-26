# Nebula Markdown Editor Features

Nebula is a modern, feature-rich Markdown editor built for performance, privacy, and productivity. Below is a comprehensive list of its capabilities.

## 📝 Core Editing
- **Real-time Live Preview**: Write markdown on the left and see the rendered result instantly on the right.
- **View Modes**:
  - **Split View**: Classic editor + preview side-by-side.
  - **Editor Only**: Distraction-free writing mode.
  - **Preview Only**: Read-only mode for reviewing content.
- **Synchronized Scrolling**: Scrolling the editor automatically scrolls the preview to the matching position, and vice versa.
- **Auto-Save**: All changes are automatically saved to your browser's local storage. You never lose work.
- **Syntax Highlighting**: The editor provides visual feedback for markdown syntax.

## ⚡ Productivity & Performance
- **Command Palette (`Cmd/Ctrl + K`)**: Access all features, commands, and settings from a spotlight-style keyboard interface.
- **Smart Input**: 
  - **Auto-List Continuation**: Pressing Enter on a list item automatically creates the next bullet point.
  - **Tab Indentation**: Supports 2-space soft tabs for clean formatting.
  - **Auto-Close Pairs**: Automatically closes brackets `()`, `[]`, `{}`, quotes `""`, `''`, and code ticks ``` `` ```.
- **Image Optimization**: Images pasted or dropped into the editor are automatically resized and compressed (JPEG 70%) to ensure high performance and low storage usage.
- **Debounced Rendering**: Preview rendering is optimized to prevent UI lag while typing in large documents.

## 🤖 AI Powers (Gemini & OpenAI)
- **Built-in Assistant**: One-click AI tools powered by Google Gemini (default).
- **Context-Aware Actions**:
  - **Improve Writing**: Enhances clarity and flow.
  - **Fix Grammar & Spelling**: Corrects errors without changing the meaning.
  - **Tone Adjustment**: One-click conversion to "Professional" or "Friendly" tones.
  - **Summarization**: Generates concise summaries of selected text.
  - **Continue Writing**: creatively extends your text based on context.
  - **Translation**: Translates or optimizes English text.
- **Custom Prompts**: Ask the AI anything directly from the toolbar.
- **BYO Key (OpenAI Compatible)**:
  - Support for custom OpenAI-compatible endpoints (e.g., OpenAI, LocalLLM, Groq).
  - Configure Base URL, API Key, and Model name in Settings.

## 🚀 Advanced Markdown Support
- **Mermaid Diagrams**: Render flowcharts, sequence diagrams, and graphs directly in the preview using code blocks (e.g., ` ```mermaid `).
- **Mathematical Equations**: LaTeX support via KaTeX (e.g., `$E=mc^2$`).
- **Code Highlighting**: Syntax highlighting for code blocks in the preview pane.
- **GitHub Flavored Markdown (GFM)**: Support for tables, task lists (`- [ ]`), strikethrough, and auto-links.
- **HTML Rendering**: Safe rendering of raw HTML tags within markdown.

## 📂 File Management
- **Multi-Document Interface**: Create, switch between, and manage multiple markdown files.
- **Sidebar Navigation**: Collapsible sidebar listing all your documents.
- **Search**: Filter documents by title instantly.
- **Local Persistence**: All documents are stored in IndexedDB/LocalStorage—no data leaves your browser unless you export it.

## 📊 Analytics
- **Status Bar**: Real-time tracking of:
  - Cursor Position (Line/Column)
  - Word Count
  - Character Count
  - Estimated Reading Time
  - Save Status

## 🎨 UI & Customization
- **Dark/Light Mode**: Fully responsive theming for all UI elements, editor, and preview (including diagrams).
- **Responsive Design**: Works on desktop and mobile.
- **Image Handling**: Drag & drop or paste images directly.

## 📤 Export & Sharing
- **Export to Markdown (.md)**: Download the raw source file.
- **Export to HTML (.html)**: Generates a standalone, styled HTML5 file perfect for sharing.
- **Export to Word (.docx)**: Converts the rendered markdown into a Microsoft Word compatible document.
- **Print / PDF**: Styled specifically for printing (hides UI elements) to generate clean PDFs via the browser's print dialog.

## 🛠 Tech Stack
- **Frontend**: React 19, TypeScript, Vite (implied environment).
- **Styling**: Tailwind CSS (with Typography plugin).
- **Markdown Engine**: `react-markdown`, `remark-gfm`, `rehype-katex`, `rehype-highlight`.
- **Diagrams**: `mermaid.js`.
- **AI**: `@google/genai` SDK.
- **Icons**: `lucide-react`.