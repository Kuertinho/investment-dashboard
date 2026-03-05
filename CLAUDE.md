# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

## Environment

Copy `.env.local` and set `VITE_ANTHROPIC_API_KEY` before running. Vite exposes only variables prefixed with `VITE_` to the client bundle via `import.meta.env`.

## Architecture

This is a single-page Vite + React app with three top-level feature areas. `App.jsx` handles routing/tab switching between them. Each feature lives in its own directory under `src/components/`.

**Feature components:**
- `HypothesisGenerator/` — User inputs a theme/sector; the app calls Claude and streams back investment hypotheses with rationale, risks, and suggested tickers.
- `StockAnalyzer/` — User inputs a ticker symbol; Claude returns analysis covering business model, moat, valuation, and key risks.
- `Watchlist/` — Client-side persistent list (localStorage) of tracked tickers with user-written notes. No AI calls.

**Claude API integration:** All Claude calls go through a single shared utility (e.g., `src/lib/claude.js`) using the Anthropic JS SDK (`@anthropic-ai/sdk`). Use streaming responses (`stream: true`) for the Generator and Analyzer features to give progressive UI feedback. The API key is read from `import.meta.env.VITE_ANTHROPIC_API_KEY`.

**State:** Watchlist state is persisted to `localStorage`. No backend or database — everything is client-only.

**Styling:** Tailwind CSS utility classes throughout. No separate CSS files unless co-located with a component for highly component-specific styles.
