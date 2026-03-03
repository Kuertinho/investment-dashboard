# Investment Opportunity Dashboard

An AI-powered investment research tool that helps you generate investment hypotheses, analyze stocks, and manage a watchlist — all in one place.

## Features

### Hypothesis Generator
Enter a theme or sector (e.g., "AI infrastructure", "clean energy") and receive AI-generated investment hypotheses with supporting rationale, potential risks, and suggested tickers to research.

### Stock Analyzer
Deep-dive into individual stocks by ticker symbol. Get AI-powered analysis covering business model, competitive moat, valuation considerations, and key risks — powered by the Anthropic Claude API.

### Watchlist
Track your stocks of interest in a persistent watchlist. Add, remove, and annotate stocks with your own notes as you conduct research.

## Tech Stack

- **Frontend:** [Vite](https://vitejs.dev/) + [React](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **AI:** [Anthropic Claude API](https://www.anthropic.com/)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add your API key

Create a `.env.local` file in the project root:

```bash
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

Get your API key from the [Anthropic Console](https://console.anthropic.com/).

### 3. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
src/
├── components/
│   ├── HypothesisGenerator/
│   ├── StockAnalyzer/
│   └── Watchlist/
├── App.jsx
└── main.jsx
```
