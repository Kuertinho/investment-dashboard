# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at http://localhost:5174
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

## Environment

Set `VITE_ANTHROPIC_API_KEY` in `.env.local`. Vite exposes only `VITE_`-prefixed variables to the client via `import.meta.env`.

## Architecture

Single-page Vite + React app. `App.jsx` owns `activeView` + `viewContext` state and renders one of three feature components. Navigation between features uses `navigateTo(view, context)` — the context object is spread as props onto the target view (e.g. `initialTicker`, `hypothesisContext`, `returnContext`). Sidebar navigation clears context.

**No backend.** All Claude calls are direct browser → Anthropic API. Price data proxies through Vite's dev server to Yahoo Finance (configured in `vite.config.js` under `/yahoo-finance`).

### Feature: HypothesisGenerator (`src/components/HypothesisGenerator/`)

Two-stage flow managed in `index.jsx`:
1. **Hypotheses stage** — calls `generateHypotheses()` → renders 6 cards in a grid. Results cached in `localStorage` under `investai_hypotheses`. Users can also add custom hypotheses (`investai_custom_hypotheses`) and star/save them (`investai_saved_hypotheses`).
2. **Ideas stage** — clicking "Explore" on a card calls `generateIdeas(headline, thesis, sectors)` → renders a sortable 20-company table. Results cached per-headline in `investai_ideas_cache_v2`.

From the ideas table, clicking "Analyze" navigates to StockAnalyzer with `initialTicker`, `hypothesisContext`, and `returnContext` props set.

### Feature: StockAnalyzer (`src/components/StockAnalyzer/`)

Calls `analyzeStockScorecard(ticker, hypothesisContext)` and renders a full QSV+BE Investment Scorecard via `Scorecard.jsx`. Loading state cycles through 5 animated steps. Key sub-components:
- `Scorecard.jsx` — 7 sections: header (score + verdict badge), score overview (radar + weighted bar), 5 expandable pillar cards, 2×2 chart grid, hypothesis fit card, downside snapshot, save-to-watchlist flow.
- `ScorecardCharts.jsx` — `ScoreRadar`, `MarginTrendChart`, `PeerComparisonChart`, `CapitalAllocationChart` (all Recharts).
- `PriceChart.jsx` — fetches via `src/lib/priceHistory.js` (Yahoo Finance proxy); shows 200-day MA overlay when ≥200 data points.
- `AnalysisResult.jsx` — legacy component, superseded by `Scorecard.jsx`, not imported anywhere.

### Feature: Watchlist (`src/components/Watchlist/`)

Pure localStorage, no AI calls. `useWatchlist` hook (`src/hooks/useWatchlist.js`) manages state with `add / remove / updateNotes / updateKpis`. Storage key: `investai_watchlist`. Each entry stores `ticker`, `companyName`, `sector`, `notes`, `hypothesis`, `investmentCase`, `kpiSnapshot`, `snapshotAt`, and (when saved from Scorecard) `scorecardSnapshot` (full JSON).

### Claude API (`src/lib/claude.js`)

All Claude calls go through this file. Models used:
- `claude-haiku-4-5-20251001` — `generateHypotheses()`, `generateIdeas()`, `analyzeStock()`, `fetchKpis()`
- `claude-sonnet-4-6` — `analyzeStockScorecard(ticker, hypothesisContext?)` (16k tokens, `web_search_20250305` tool)

`analyzeStockScorecard` returns a rich JSON object with `quality`, `businessEconomics`, `solvency`, `value`, `hypothesisFit`, `overall`, `chartData`, and `recentNews`. Scoring weights differ based on whether `hypothesisContext` is provided. `extractJsonObject()` is a helper that strips non-JSON text from responses.

**Styling:** Tailwind CSS utility classes throughout (`zinc-*` dark palette, `amber-400` accent). No separate CSS files.
