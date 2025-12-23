# Repository Guidelines

## Project Structure & Module Organization

- **Root Level**: Entry points (`App.tsx`, `index.tsx`), config files (`vite.config.ts`, `tsconfig.json`), and shared types (`types.ts`)
- **components/**: UI components (PascalCase naming) - Editor, Preview, Toolbar, Sidebar, Modals, Toast
- **hooks/**: Custom React hooks (prefixed with `use`) - useDocuments, useDebounce, useExport, useToast
- **services/**: External API integrations - `geminiService.ts` for AI providers (Gemini, OpenAI-compatible)
- **utils/**: Pure utility functions - `editorUtils.ts` for image processing, text helpers
- **Data Flow**: App.tsx manages global state, passes down via props; hooks encapsulate reusable stateful logic

## Build, Test, and Development Commands

- **Install**: `pnpm install` (pnpm preferred, npm compatible)
- **Dev Server**: `pnpm dev` (runs on http://localhost:3000)
- **Build**: `pnpm build` (outputs to dist/, uses `/MDEditor/` base path for GitHub Pages)
- **Preview**: `pnpm preview` (preview production build locally)
- **Environment**: Set `GEMINI_API_KEY` in `.env` for AI features (optional, can be configured in UI)

## Coding Style & Naming Conventions

- **TypeScript**: Strict typing required; define interfaces/types in `types.ts` for shared types
- **Components**: Functional components only; use `React.FC` sparingly, prefer explicit props typing
- **Hooks**: Prefix with `use`, return object with descriptive keys (e.g., `{ documents, activeDoc, handleCreateDoc }`)
- **Naming**: PascalCase for components/types, camelCase for functions/variables/hooks, UPPER_CASE for constants
- **State**: Use `useState` with lazy initializers for localStorage; memoize callbacks with `useCallback`
- **Styling**: Tailwind CSS classes; use `dark:` prefix for dark mode variants
- **Imports**: Use `@/*` path alias for root-relative imports

## Testing Guidelines

- **No Test Framework Configured**: Project currently lacks test setup
- **Manual Testing**: Use `pnpm dev` and verify features in browser
- **Type Checking**: Run `npx tsc --noEmit` to validate TypeScript
- **Build Verification**: Run `pnpm build` to catch build-time errors
- **Key Areas to Verify**: Document CRUD, AI integration, export functions, theme switching, scroll sync

