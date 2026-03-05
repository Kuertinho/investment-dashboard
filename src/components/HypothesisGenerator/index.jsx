import { useEffect, useRef, useState } from 'react'
import { Lightbulb } from 'lucide-react'
import PageShell from '../Layout/PageShell'
import HypothesesGrid from './HypothesesGrid'
import IdeasView from './IdeasView'
import { generateHypotheses, generateIdeas } from '../../lib/claude'

const CACHE_KEY = 'investai_hypotheses'
const CUSTOM_CACHE_KEY = 'investai_custom_hypotheses'
const SAVED_KEY = 'investai_saved_hypotheses'
const IDEAS_CACHE_KEY = 'investai_ideas_cache_v2'

function getIdeasCache() {
  try { return JSON.parse(localStorage.getItem(IDEAS_CACHE_KEY)) ?? {} }
  catch { return {} }
}

export default function HypothesisGenerator({ onNavigate, restoreState = null }) {
  const [stage, setStage] = useState(() => restoreState ? 'ideas' : 'loading-hypotheses')
  const [hypotheses, setHypotheses] = useState([])
  const [customHypotheses, setCustomHypotheses] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CUSTOM_CACHE_KEY)) ?? [] }
    catch { return [] }
  })
  const [savedHeadlines, setSavedHeadlines] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(SAVED_KEY)) ?? []) }
    catch { return new Set() }
  })
  const [selectedHypothesis, setSelectedHypothesis] = useState(() => restoreState?.selectedHypothesis ?? null)
  const [ideas, setIdeas] = useState(() => restoreState?.ideas ?? [])
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const skipFirstFetch = useRef(!!restoreState)

  useEffect(() => {
    if (skipFirstFetch.current && retryCount === 0) return
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        setHypotheses(JSON.parse(cached))
        setStage('hypotheses')
        return
      } catch { /* fall through to fetch */ }
    }

    let cancelled = false
    setStage('loading-hypotheses')
    setError(null)
    generateHypotheses()
      .then(data => {
        if (!cancelled) {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data))
          setHypotheses(data)
          setStage('hypotheses')
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message ?? 'Unknown error')
          setStage('error')
        }
      })
    return () => { cancelled = true }
  }, [retryCount])

  function handleExplore(hypothesis) {
    const cached = getIdeasCache()[hypothesis.headline]
    if (cached) {
      setSelectedHypothesis(hypothesis)
      setIdeas(cached)
      setStage('ideas')
      return
    }
    setSelectedHypothesis(hypothesis)
    setStage('loading-ideas')
    setError(null)
    generateIdeas(hypothesis.headline, hypothesis.thesis, hypothesis.sectors)
      .then(data => {
        localStorage.setItem(IDEAS_CACHE_KEY, JSON.stringify({
          ...getIdeasCache(), [hypothesis.headline]: data
        }))
        setIdeas(data)
        setStage('ideas')
      })
      .catch(err => {
        setError(err.message ?? 'Unknown error')
        setStage('error')
      })
  }

  function handleBack() {
    setSelectedHypothesis(null)
    setIdeas([])
    setError(null)
    if (hypotheses.length === 0) {
      // Restore path: hypotheses were never fetched — load from cache or trigger fetch
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        try {
          setHypotheses(JSON.parse(cached))
          setStage('hypotheses')
          return
        } catch { /* fall through */ }
      }
      setStage('loading-hypotheses')
      setRetryCount(c => c + 1)
    } else {
      setStage('hypotheses')
    }
  }

  function handleRetry() {
    if (selectedHypothesis) {
      const cache = getIdeasCache()
      delete cache[selectedHypothesis.headline]
      localStorage.setItem(IDEAS_CACHE_KEY, JSON.stringify(cache))
      handleExplore(selectedHypothesis)
    } else {
      setRetryCount(c => c + 1)
    }
  }

  function handleRegenerate() {
    localStorage.removeItem(CACHE_KEY)
    setRetryCount(c => c + 1)
  }

  function handleAnalyze(ticker, idea) {
    onNavigate('analyzer', {
      initialTicker: ticker,
      hypothesisContext: {
        headline: selectedHypothesis.headline,
        thesis: selectedHypothesis.thesis,
        relevanceReason: idea.relevanceReason,
      },
      returnContext: { ideas, selectedHypothesis },
    })
  }

  function handleAddCustom({ headline, thesis, sectors }) {
    const entry = { headline, thesis, sectors, isCustom: true }
    const updated = [...customHypotheses, entry]
    setCustomHypotheses(updated)
    localStorage.setItem(CUSTOM_CACHE_KEY, JSON.stringify(updated))
  }

  function handleToggleSave(headline) {
    setSavedHeadlines(prev => {
      const next = new Set(prev)
      next.has(headline) ? next.delete(headline) : next.add(headline)
      localStorage.setItem(SAVED_KEY, JSON.stringify([...next]))
      return next
    })
  }

  const showIdeasView = selectedHypothesis && ['loading-ideas', 'ideas'].includes(stage)
    || (stage === 'error' && selectedHypothesis)

  return (
    <PageShell
      title="Hypothesis Generator"
      description="AI-generated structural investment themes with supporting company ideas"
      icon={Lightbulb}
    >
      {showIdeasView ? (
        <IdeasView
          stage={stage}
          hypothesis={selectedHypothesis}
          ideas={ideas}
          error={error}
          onBack={handleBack}
          onAnalyze={handleAnalyze}
          onRetry={handleRetry}
        />
      ) : (
        <HypothesesGrid
          stage={stage}
          hypotheses={hypotheses}
          customHypotheses={customHypotheses}
          savedHeadlines={savedHeadlines}
          error={error}
          onExplore={handleExplore}
          onRetry={handleRetry}
          onRegenerate={handleRegenerate}
          onAddCustom={handleAddCustom}
          onToggleSave={handleToggleSave}
        />
      )}
    </PageShell>
  )
}
