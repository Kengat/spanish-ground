import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowRight, Bookmark, BookOpen, Brain, Check, ChevronRight, CircleUserRound,
  Coffee, Flag, Flame, Home, Menu, MessageSquareText, MessagesSquare, Plus, RotateCcw, Settings,
  Sparkles, SquareCheckBig, Target, Volume2, X, Zap,
} from 'lucide-react'
import { starterPacks } from './content/lessonPacks.js'
import { checkJoseSentence } from './utils/joseSentenceChecker.js'
import { checkCoreVerbsSentence } from './utils/coreVerbsSentenceChecker.js'

const icons = { Coffee, MessagesSquare, Sparkles, Brain }
const modes = [
  { id: 'guide', label: 'Clear guide', icon: BookOpen, description: 'Understand the idea first — without grammar fog.', requires: 'guide' },
  { id: 'cards', label: 'Two-way deck', icon: Zap, description: 'Flip through every item in alternating directions.' },
  { id: 'match', label: '4×4 Match', icon: Target, description: 'Connect four Spanish phrases with four meanings, round after round.' },
  { id: 'quiz', label: 'Two-way quiz', icon: Brain, description: 'Choose meanings and Spanish phrases in both directions.' },
  { id: 'builder', label: 'Sentence lab', icon: BookOpen, description: 'Build Spanish with your hands and feel the word order.' },
  { id: 'compose', label: 'Write it yourself', icon: MessageSquareText, description: 'Create the whole sentence from memory and get a useful check.', requires: 'compose' },
  { id: 'vocab', label: 'Word focus', icon: Sparkles, description: 'Pull the important individual words out of the full phrases.', requires: 'vocabulary' },
  { id: 'scene', label: 'Real-life scene', icon: MessagesSquare, description: 'Choose what you would actually say in a real moment.', requires: 'scene' },
  { id: 'create', label: 'Create your own sentences', icon: Sparkles, description: 'Use the words freely and finish with sentences of your own.', requires: 'creation' },
]

const initialProgress = { xp: 120, streak: 3, completed: [], modeCompletions: {}, mistakes: 4 }
const FlagContext = createContext({ flaggedItems: [], toggleFlag: () => {} })
const LessonLanguageContext = createContext({ language: 'ru', setLanguage: () => {} })

function localizeLessonData(value, language) {
  if (Array.isArray(value)) return value.map((item) => localizeLessonData(item, language))
  if (!value || typeof value !== 'object') return value
  const keys = Object.keys(value)
  if (keys.length === 2 && keys.includes('ru') && keys.includes('en')) return localizeLessonData(value[language], language)
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localizeLessonData(item, language)]))
}

function useLocalizedPack(pack) {
  const { language } = useContext(LessonLanguageContext)
  return useMemo(() => {
    if (!pack?.bilingual) return pack
    return { ...localizeLessonData(pack, language), activeLanguage: language }
  }, [pack, language])
}

function LessonLanguageToggle({ pack, className = '' }) {
  const { language, setLanguage } = useContext(LessonLanguageContext)
  if (!pack?.bilingual) return null
  return <div className={`lesson-language-toggle ${className}`} role="group" aria-label="Lesson explanation language"><button type="button" className={language === 'ru' ? 'active' : ''} aria-pressed={language === 'ru'} onClick={() => setLanguage('ru')}>RU</button><button type="button" className={language === 'en' ? 'active' : ''} aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button></div>
}

function availableModesFor(pack) {
  return modes.filter((mode) => !mode.requires || pack[mode.requires])
}

function completedModesFor(progress, packId) {
  const saved = progress.modeCompletions?.[packId]
  return Array.isArray(saved) ? saved : []
}

function masteryFor(progress, pack) {
  const available = availableModesFor(pack)
  if (!available.length) return 0
  const validCompleted = completedModesFor(progress, pack.id).filter((modeId) => available.some((mode) => mode.id === modeId))
  return Math.round((validCompleted.length / available.length) * 100)
}

function usePersistedState(key, fallback) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
  })
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value])
  return [value, setValue]
}

function flagItemFor(pack, item) {
  if (!pack || !item?.es) return null
  const es = item.es.trim()
  return {
    id: `${pack.id}::${es.toLocaleLowerCase('es')}`,
    packId: pack.id,
    packTitle: pack.title,
    packEyebrow: pack.eyebrow,
    es,
    en: item.en || 'Recall the meaning from context.',
    example: item.example || '',
  }
}

function FlagButton({ pack, item, className = '' }) {
  const { flaggedItems, toggleFlag } = useContext(FlagContext)
  const flagItem = flagItemFor(pack, item)
  if (!flagItem) return null
  const active = flaggedItems.some((saved) => saved.id === flagItem.id)
  return <button type="button" className={`flag-button ${active ? 'active' : ''} ${className}`} aria-label={active ? `Remove ${flagItem.es} from difficult words` : `Flag ${flagItem.es} as difficult`} aria-pressed={active} onClick={(event) => { event.stopPropagation(); toggleFlag(flagItem) }}><Flag size={17} fill={active ? 'currentColor' : 'none'} /></button>
}

function BookmarkButton({ pack, item, className = '' }) {
  const { flaggedItems, toggleFlag } = useContext(FlagContext)
  const savedItem = flagItemFor(pack, item)
  if (!savedItem) return null
  const active = flaggedItems.some((saved) => saved.id === savedItem.id)
  return <button type="button" className={`bookmark-button ${active ? 'active' : ''} ${className}`} aria-label={active ? `Remove ${savedItem.es} from difficult words` : `Save ${savedItem.es} for review`} aria-pressed={active} onClick={(event) => { event.stopPropagation(); toggleFlag(savedItem) }}><Bookmark size={18} fill={active ? 'currentColor' : 'none'} /></button>
}

function SpeakerIcon() {
  return <svg viewBox="0 0 118.6 100" aria-hidden="true"><path d="m55 3c-3 0-6.1 1.6-8.2 3l-21.9 18.8h-10.4c-4.5 0-10.9 4.4-10.9 12.2v25.7c0 7.5 5.4 12.3 10.9 12.3h10.9l21.3 18.3c1.4 2.5 3.9 3.7 8.1 3.7 4.5 0 8-3.5 8.3-8v-78c-0.1-4-3.5-8-8.1-8zm-33.8 62.3h-6.2c-1.8 0-3-1.3-3-3.3v-24.6c0-1.8 1.3-3.4 3-3.4h6.2v31.3zm27.6 16.7-19.1-16.5v-31.9l19.1-15.6v64z" /><path d="m86.4 31.6c-4.3-1.6-7.2 2.4-7.1 4.4s1.7 4 1.7 4 3.6 3.7 3.8 9.5c-0.5 5.1-3.8 9.2-3.8 9.2s-1.7 1.3-2.1 3.3c-0.3 2.2 2.1 5.9 5.9 4.9 1.9-0.3 8.8-7.2 8.8-16.9 0.3-10.8-6.3-18-7.2-18.4z" /><path d="m104 16.9c-2.3-2.9-7.6-2.1-7.8 2.9-0.1 2 1.7 3.9 1.7 3.9s8.4 9.9 8.7 24.3c-0.1 13.9-5.4 23.7-9.7 29.2-3.5 4.8 0.5 8.7 4 7.8 3.7-0.9 14.8-17.4 14.8-36.3 0.1-16.9-8.3-28.7-11.7-31.8z" /></svg>
}

function App() {
  const [customPacks, setCustomPacks] = usePersistedState('sg-custom-packs', [])
  const [progress, setProgress] = usePersistedState('sg-progress', initialProgress)
  const [flaggedItems, setFlaggedItems] = usePersistedState('sg-flagged-items', [])
  const [lessonLanguage, setLessonLanguage] = usePersistedState('sg-lesson-language', 'ru')
  const [activePack, setActivePack] = useState(null)
  const [activeMode, setActiveMode] = useState(null)
  const [view, setView] = useState('today')
  const [reviewItems, setReviewItems] = useState(null)
  const [showImport, setShowImport] = useState(false)
  const swipeStart = useRef(null)
  const packs = useMemo(() => [...starterPacks, ...customPacks], [customPacks])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [activePack, activeMode, reviewItems, view])

  const toggleFlag = (item) => setFlaggedItems((old) => old.some((saved) => saved.id === item.id) ? old.filter((saved) => saved.id !== item.id) : [...old, item])
  const navigate = (nextView) => { setActivePack(null); setActiveMode(null); setReviewItems(null); setView(nextView) }
  const handleTouchStart = (event) => { swipeStart.current = event.touches[0]?.clientX ?? null }
  const handleTouchEnd = (event) => {
    if (swipeStart.current === null || activePack || reviewItems) return
    const distance = (event.changedTouches[0]?.clientX ?? swipeStart.current) - swipeStart.current
    if (distance < -70 && view === 'today') setView('review')
    if (distance > 70 && view === 'review') setView('today')
    swipeStart.current = null
  }

  const award = (amount = 10) => setProgress((old) => ({ ...old, xp: old.xp + amount }))
  const finish = () => {
    setProgress((old) => ({
      ...old,
      xp: old.xp + 30,
      ...recordModeCompletion(old, activePack, activeMode),
    }))
    setActiveMode(null)
  }

  const withProviders = (children) => <LessonLanguageContext.Provider value={{ language: lessonLanguage, setLanguage: setLessonLanguage }}><FlagContext.Provider value={{ flaggedItems, toggleFlag }}>{children}</FlagContext.Provider></LessonLanguageContext.Provider>

  if (activePack && activeMode) return withProviders(<Exercise pack={activePack} mode={activeMode} onBack={() => setActiveMode(null)} onAward={award} onFinish={finish} />)
  if (reviewItems) return withProviders(<FlaggedTrainer items={reviewItems} onBack={() => setReviewItems(null)} onAward={award} />)

  return withProviders(
    <div className={`app-shell view-${view}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <Sidebar view={view} onNavigate={navigate} flagCount={flaggedItems.length} />
      <main className="main-area">
        <Topbar progress={progress} />
        {view === 'review' ? <ReviewPage packs={packs} flaggedItems={flaggedItems} onBack={() => navigate('today')} onTrain={setReviewItems} /> : !activePack ? (
          <Dashboard
            packs={packs}
            progress={progress}
            onOpen={setActivePack}
            onImport={() => setShowImport(true)}
            onReview={() => navigate('review')}
            flagCount={flaggedItems.length}
          />
        ) : (
          <PackOverview pack={activePack} progress={progress} onBack={() => setActivePack(null)} onStart={setActiveMode} />
        )}
      </main>
      {showImport && <ImportModal onClose={() => setShowImport(false)} onSave={(pack) => { setCustomPacks((old) => [...old, pack]); setShowImport(false) }} />}
    </div>
  )
}

function Sidebar({ view, onNavigate, flagCount }) {
  return (
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">ñ</span><span>Spanish<br /><b>Ground</b></span></div>
      <nav>
        <button className={`nav-item ${view === 'today' ? 'active' : ''}`} onClick={() => onNavigate('today')}><Home size={20} /> Home</button>
        <button className="nav-item"><MessageSquareText size={20} /> Lessons</button>
        <button className={`nav-item ${view === 'review' ? 'active' : ''}`} onClick={() => onNavigate('review')}><SquareCheckBig size={20} /> Review {flagCount > 0 && <span className="nav-count">{flagCount}</span>}</button>
        <button className="nav-item"><CircleUserRound size={20} /> Profile</button>
      </nav>
      <div className="sidebar-bottom">
        <button className="nav-item"><Settings size={20} /> Settings</button>
        <div className="profile-mini"><div className="avatar">IL</div><div><b>Illia</b><span>Explorer · A0</span></div><ChevronRight size={18} /></div>
      </div>
    </aside>
  )
}

function Topbar({ progress }) {
  return (
    <header className="topbar">
      <button className="mobile-menu"><Menu /></button>
      <div className="top-spacer" />
      <div className="stat-pill flame"><Flame size={18} fill="currentColor" /><b>{progress.streak}</b><span>day streak</span></div>
      <div className="stat-pill"><Sparkles size={18} /><b>{progress.xp}</b><span>XP</span></div>
      <button className="round-button"><CircleUserRound /></button>
    </header>
  )
}

function Dashboard({ packs, progress, onOpen, onImport, onReview, flagCount }) {
  const featured = packs.find((pack) => pack.featured) || packs.find((pack) => pack.id === 'everyday-60') || packs[0]
  const featuredContent = useLocalizedPack(featured)
  const completedModeCount = Object.values(progress.modeCompletions || {}).reduce((total, packModes) => total + (Array.isArray(packModes) ? packModes.length : 0), 0)
  const totalModeCount = packs.reduce((total, pack) => total + availableModesFor(pack).length, 0)
  const overallProgress = totalModeCount ? Math.round((completedModeCount / totalModeCount) * 100) : 0
  return (
    <div className="page dashboard">
      <button className="review-peek" onClick={onReview} aria-label={`Open difficult words review, ${flagCount} flagged`}><Flag size={18} fill={flagCount ? 'currentColor' : 'none'} /><span>{flagCount}</span><small>swipe</small></button>
      <section className="hero">
        <div>
          <span className="kicker">LUNES · YOUR LEARNING GROUND</span>
          <h1>Hola, Illia <span>👋</span></h1>
          <p>Small steps, real Spanish. What are we exploring today?</p>
          <span className="language-pill">Spanish <i /> A0 Beginner</span>
        </div>
        <div className="daily-ring"><div><strong>2</strong><span>/ 3</span></div><small>today’s<br />activities</small></div>
      </section>

      <section className="progress-summary">
        <div className="progress-summary-head"><span>Your Progress</span><span>Level A0</span></div>
        <div className="progress-summary-body">
          <div className="progress-ring" style={{ '--progress': `${overallProgress * 3.6}deg` }}><strong>{overallProgress}%</strong></div>
          <div className="progress-summary-copy"><b>{completedModeCount} / {totalModeCount} activities</b><div><span style={{ width: `${overallProgress}%` }} /></div></div>
        </div>
      </section>

      <h2 className="today-title">Today’s Lesson</h2>
      <section className="continue-card">
        <div className="continue-copy">
          <span className="eyebrow light">Essentials</span>
          <h2>{featuredContent.title}</h2>
          <p>{featuredContent.description}</p>
          <div className="lesson-chip"><span>{featuredContent.ui?.phraseOfDay || 'Phrase of the day'}</span><small>{featured.minutes} {featuredContent.ui?.minutesShort || 'min'}</small></div>
          <button className="primary light-button" aria-label={`Open ${featuredContent.title}`} onClick={() => onOpen(featured)}><ArrowRight size={19} /></button>
        </div>
        <div className="lesson-art" aria-hidden="true" />
        <div className="continue-progress"><span style={{ width: '58%' }} /></div>
      </section>

      <div className="section-heading"><div><span className="kicker">PICK YOUR PATH</span><h2>Explore your playground</h2></div><button className="text-button" onClick={onImport}><Plus size={17} /> Add material</button></div>
      <section className="pack-grid">
        {packs.map((pack) => <PackCard key={pack.id} pack={pack} mastery={masteryFor(progress, pack)} onClick={() => onOpen(pack)} />)}
        <button className="new-pack-card" onClick={onImport}><span><Plus /></span><b>Drop in something new</b><small>Words, phrases, a topic or any text</small></button>
      </section>

      <section className="insight-row">
        <div className="insight-card"><span className="insight-icon"><Brain /></span><div><span className="kicker">SMART REVIEW</span><h3>{progress.mistakes} things worth another look</h3><p>Mistakes aren’t debt. They’re your next lesson plan.</p></div><button className="round-button"><ArrowRight /></button></div>
        <div className="quote-card"><Sparkles /><blockquote>“Poco a poco se llega lejos.”</blockquote><p>Little by little, you go far.</p></div>
      </section>
    </div>
  )
}

function recordModeCompletion(progress, pack, modeId) {
  const previousModes = completedModesFor(progress, pack.id)
  const nextModes = previousModes.includes(modeId) ? previousModes : [...previousModes, modeId]
  const availableModeIds = availableModesFor(pack).map((mode) => mode.id)
  const packComplete = availableModeIds.every((id) => nextModes.includes(id))
  const completedWithoutPack = (progress.completed || []).filter((id) => id !== pack.id)
  return {
    modeCompletions: { ...(progress.modeCompletions || {}), [pack.id]: nextModes },
    completed: packComplete ? [...completedWithoutPack, pack.id] : completedWithoutPack,
  }
}

function PackCard({ pack, mastery, onClick }) {
  const content = useLocalizedPack(pack)
  const Icon = icons[pack.icon] || BookOpen
  return (
    <button className={`pack-card ${pack.accent}`} onClick={onClick}>
      <div className="pack-icon"><Icon /></div>
      <span className="eyebrow">{content.eyebrow}</span>
      <h3>{content.title}</h3><p>{content.description}</p>
      <div className="pack-meta"><span>{pack.minutes} {content.ui?.minutesShort || 'min'}</span><span>•</span><span>{pack.words.length} {content.ui?.wordsLabel || 'words'}</span>{mastery > 0 && <span className="completed">{mastery === 100 && <Check size={13} />}{mastery === 100 ? (content.ui?.done || 'Done') : `${mastery}%`}</span>}<ArrowRight size={18} /></div>
    </button>
  )
}

function PackOverview({ pack, progress, onBack, onStart }) {
  const content = useLocalizedPack(pack)
  const Icon = icons[pack.icon] || BookOpen
  const availableModes = availableModesFor(pack)
  const completedModes = completedModesFor(progress, pack.id).filter((modeId) => availableModes.some((mode) => mode.id === modeId))
  const mastery = masteryFor(progress, pack)
  return (
    <div className="page pack-page">
      <div className="pack-page-tools"><button className="back-button" onClick={onBack}><ArrowLeft size={17} /> {content.ui?.backToPlayground || 'Back to playground'}</button><LessonLanguageToggle pack={pack} /></div>
      <section className={`pack-hero ${pack.accent}`}>
        <div className="pack-hero-icon"><Icon /></div><div><span className="eyebrow">{content.eyebrow}</span><h1>{content.title}</h1><p>{content.description}</p></div>
        <div className="pack-score"><b>{mastery}%</b><span>{content.ui?.mastery || 'mastery'} · {completedModes.length}/{availableModes.length} {content.ui?.modes || 'modes'}</span></div>
      </section>
      <div className="section-heading"><div><span className="kicker">{content.ui?.chooseMode || 'CHOOSE A MODE'}</span><h2>{content.ui?.practiceQuestion || 'How do you want to practise?'}</h2></div></div>
      <section className="mode-grid">
        {availableModes.map((mode, index) => { const IconMode = mode.icon; const copy = content.modeCopy?.[mode.id] || mode; return (
          <button key={mode.id} className="mode-card" onClick={() => onStart(mode.id)}>
            <span className="mode-number">0{index + 1}</span><span className="mode-icon"><IconMode /></span><h3>{copy.label}</h3>
            <p>{copy.description}</p>
            <span className={`mode-start ${completedModes.includes(mode.id) ? 'mode-complete' : ''}`}>{completedModes.includes(mode.id) ? <><Check size={17} /> {content.ui?.completed || 'Completed'}</> : <>{content.ui?.start || 'Start'} <ArrowRight size={17} /></>}</span>
          </button>
        )})}
      </section>
    </div>
  )
}

function Exercise({ pack, mode, onBack, onAward, onFinish }) {
  const content = useLocalizedPack(pack)
  const cardMode = mode === 'cards'
  const modeCopy = content.modeCopy?.[mode] || modes.find((item) => item.id === mode)
  return (
    <div className={`exercise-shell ${cardMode ? 'cards-exercise' : ''}`}>
      <header className={`exercise-header ${cardMode ? 'ask-find-header' : ''}`}><button className="back-button" aria-label={cardMode ? (content.ui?.back || 'Back') : (content.ui?.exit || 'Exit')} onClick={onBack}>{cardMode ? <ArrowLeft size={20} /> : <><X size={20} /> {content.ui?.exit || 'Exit'}</>}</button><div className="exercise-title">{!cardMode && <span>{content.eyebrow}</span>}<b>{cardMode ? (content.ui?.cardTitle || 'Ask & Find') : modeCopy?.label}</b></div><div className="exercise-header-actions"><LessonLanguageToggle pack={pack} className="compact" />{cardMode ? <button className="ask-header-bookmark" aria-label={content.ui?.savedPhrases || 'Saved phrases'}><Bookmark size={20} /></button> : <div className="xp-chip"><Sparkles size={16} /> +10 XP</div>}</div></header>
      {mode === 'cards' && <Cards pack={content} onAward={onAward} onFinish={onFinish} />}
      {mode === 'guide' && <GrammarGuide pack={content} onAward={onAward} onFinish={onFinish} />}
      {mode === 'match' && <Match pack={content} onAward={onAward} onFinish={onFinish} />}
      {mode === 'quiz' && <Quiz pack={content} onAward={onAward} onFinish={onFinish} />}
      {mode === 'builder' && <Builder pack={content} onAward={onAward} onFinish={onFinish} />}
      {mode === 'compose' && <Composer pack={content} onAward={onAward} onFinish={onFinish} />}
      {mode === 'create' && <SentenceCreationFinal pack={content} onAward={onAward} onFinish={onFinish} />}
      {mode === 'vocab' && <Vocabulary pack={content} onAward={onAward} onFinish={onFinish} />}
      {mode === 'scene' && <Scene pack={content} onAward={onAward} onFinish={onFinish} />}
    </div>
  )
}

function ProgressBar({ current, total }) { return <div className="lesson-progress"><span style={{ width: `${(current / total) * 100}%` }} /></div> }

function GrammarGuide({ pack, onAward, onFinish }) {
  const [index, setIndex] = useState(0)
  const page = pack.guide[index]
  const next = () => {
    onAward(5)
    if (index === pack.guide.length - 1) onFinish()
    else setIndex(index + 1)
  }
  return <ExerciseFrame kicker={pack.guideKicker || 'CLEAR GUIDE · THE MAP'} title={page.title} current={index + 1} total={pack.guide.length}>
    <div className="grammar-guide">
      <p className="guide-body">{page.body}</p>
      <div className="guide-rule">{page.rule}</div>
      <div className="guide-examples">{page.examples.map(([spanish, note]) => <div key={spanish}><b>{spanish}</b><span>{note}</span><FlagButton pack={pack} item={{ es: spanish, en: note }} /></div>)}</div>
    </div>
    <div className="guide-actions">
      <button className="back-button" disabled={index === 0} onClick={() => setIndex(index - 1)}><ArrowLeft size={17} /> {pack.ui?.previous || 'Previous'}</button>
      <button className="primary" onClick={next}>{index === pack.guide.length - 1 ? (pack.ui?.startPractising || 'Start practising') : (pack.ui?.understand || 'I understand')} <ArrowRight size={18} /></button>
    </div>
  </ExerciseFrame>
}

function speakSpanish(text) {
  if (!globalThis.speechSynthesis || !globalThis.SpeechSynthesisUtterance) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'es-ES'
  const voices = speechSynthesis.getVoices()
  utterance.voice = voices.find((voice) => voice.lang.toLowerCase() === 'es-es')
    || voices.find((voice) => voice.lang.toLowerCase().startsWith('es'))
    || null
  speechSynthesis.cancel()
  speechSynthesis.speak(utterance)
}

function Cards({ pack, onAward, onFinish }) {
  const [index, setIndex] = useState(0); const [flipped, setFlipped] = useState(false)
  const order = useMemo(() => shuffle(pack.words.map((word) => word.es)), [pack.id])
  const word = pack.words.find((item) => item.es === order[index])
  const next = () => { onAward(); if (index === pack.words.length - 1) onFinish(); else { setIndex(index + 1); setFlipped(false) } }
  const toggleCard = () => setFlipped((old) => !old)
  const progress = ((index + 1) / order.length) * 4
  return <main className="ask-find-main">
    <div className="ask-progress-row"><div className="ask-progress-segments">{[0, 1, 2, 3].map((segment) => <i key={segment}><span style={{ width: `${Math.max(0, Math.min(100, (progress - segment) * 100))}%` }} /></i>)}</div><b>{index + 1} / {order.length}</b></div>
    <div className="ask-language">{pack.ui?.spanish || 'Spanish'} <ArrowRight size={14} /> {pack.ui?.targetLanguage || 'English'}</div>
    <section className={`ask-phrase-card ${flipped ? 'flipped' : ''}`} role="button" tabIndex={0} onClick={toggleCard} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') toggleCard() }}>
      <div className="ask-card-inner">
        <div className="ask-card-face ask-card-front"><h1>{word.es}</h1><button className="ask-audio" aria-label={pack.ui?.playPronunciation || 'Play Spanish pronunciation'} onClick={(event) => { event.stopPropagation(); speakSpanish(word.es) }}><SpeakerIcon /></button><BookmarkButton pack={pack} item={word} className="ask-card-bookmark" /></div>
        <div className="ask-card-face ask-card-back"><span>{pack.ui?.meaningLabel || 'ENGLISH MEANING'}</span><h1>{word.en}</h1>{word.example && <p>“{word.example}”</p>}<small>{pack.ui?.tapToSpanish || 'Tap to see Spanish'}</small></div>
      </div>
    </section>
    <section className="listen-prompt"><div><Sparkles size={20} /><b>{pack.ui?.listenTitle || 'Listen and remember the phrase'}</b></div><p>{pack.ui?.listenBody || 'Tap the speaker to hear how it’s pronounced. Then say it out loud!'}</p></section>
    <button className="primary ask-got" disabled={!flipped} onClick={next}>{index === pack.words.length - 1 ? (pack.ui?.finish || 'Finish') : (pack.ui?.gotIt || 'Got it')} <ArrowRight size={18} /></button>
  </main>
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5)
}

function makeOptions(correct, pool, count = 4) {
  return shuffle([correct, ...shuffle(pool.filter((item) => item !== correct)).slice(0, count - 1)])
}

function generatedQuiz(words) {
  return shuffle(words).map((word, index) => {
    const reverse = index % 2 === 1
    return reverse
      ? { prompt: `Choose the Spanish for “${word.en}”`, options: makeOptions(word.es, words.map((item) => item.es)), answer: word.es, flagItem: word }
      : { prompt: `What does “${word.es}” mean?`, options: makeOptions(word.en, words.map((item) => item.en)), answer: word.en, flagItem: word }
  })
}

function Match({ pack, onAward, onFinish }) {
  const order = useMemo(() => shuffle(pack.words.map((word) => word.es)), [pack.id])
  const items = order.map((es) => pack.words.find((word) => word.es === es))
  const [round, setRound] = useState(0)
  const [leftPick, setLeftPick] = useState(null)
  const [rightPick, setRightPick] = useState(null)
  const [matched, setMatched] = useState([])
  const [message, setMessage] = useState('')
  const batch = items.slice(round * 4, round * 4 + 4)
  const meaningOrder = useMemo(() => shuffle(order.slice(round * 4, round * 4 + 4)), [round, pack.id])
  const meanings = meaningOrder.map((es) => pack.words.find((word) => word.es === es))
  const totalRounds = Math.ceil(items.length / 4)
  useEffect(() => { setLeftPick(null); setRightPick(null); setMessage('') }, [pack.activeLanguage])

  const assess = (left, right) => {
    if (!left || !right) return
    if (left.es === right.es) {
      setMatched((old) => [...old, left.es])
      setMessage(pack.ui?.matchCorrect || '¡Sí! That pair belongs together.')
      onAward(3)
    } else setMessage(pack.ui?.matchWrong || 'Not this pair — try the other meaning.')
    setLeftPick(null)
    setRightPick(null)
  }
  const pickLeft = (item) => { setLeftPick(item); setMessage(''); if (rightPick) assess(item, rightPick) }
  const pickRight = (item) => { setRightPick(item); setMessage(''); if (leftPick) assess(leftPick, item) }
  const nextRound = () => {
    if (round === totalRounds - 1) onFinish()
    else { setRound(round + 1); setMatched([]); setMessage(''); setLeftPick(null); setRightPick(null) }
  }

  return <ExerciseFrame kicker={pack.ui?.matchKicker || '4 × 4 MATCH'} title={`${pack.ui?.connectPairs || 'Connect the pairs'} · ${pack.ui?.round || 'Round'} ${round + 1} ${pack.ui?.of || 'of'} ${totalRounds}`} current={round * 4 + matched.length} total={items.length}>
    <div className="match-board">
      <div>{batch.map((item) => <div className="match-item" key={item.es}><button disabled={matched.includes(item.es)} className={leftPick?.es === item.es ? 'selected' : ''} onClick={() => pickLeft(item)}>{item.es}</button><FlagButton pack={pack} item={item} /></div>)}</div>
      <div>{meanings.map((item) => <button key={item.es} disabled={matched.includes(item.es)} className={rightPick?.es === item.es ? 'selected' : ''} onClick={() => pickRight(item)}>{item.en}</button>)}</div>
    </div>
    <div className={`match-message ${message.startsWith('¡') ? 'good' : ''}`}>{message || `${matched.length} ${pack.ui?.of || 'of'} ${batch.length} ${pack.ui?.matched || 'matched'}`}</div>
    <button className="primary lesson-next" disabled={matched.length !== batch.length} onClick={nextRound}>{round === totalRounds - 1 ? (pack.ui?.finishMatching || 'Finish matching') : (pack.ui?.nextFour || 'Next four')} <ArrowRight size={18} /></button>
  </ExerciseFrame>
}

function Quiz({ pack, onAward, onFinish }) {
  const [index, setIndex] = useState(0); const [picked, setPicked] = useState(null)
  const items = useMemo(() => pack.generatedQuiz ? generatedQuiz(pack.words) : pack.quiz, [pack])
  const item = items[index]; const correct = picked === item.answer
  useEffect(() => setPicked(null), [pack.activeLanguage])
  const flagItem = quizFlagItem(pack, item)
  const next = () => { if (correct) onAward(); if (index === items.length - 1) onFinish(); else { setIndex(index + 1); setPicked(null) } }
  return <ExerciseFrame kicker={pack.ui?.quizKicker || 'TWO-WAY QUIZ'} title={item.prompt} current={index + 1} total={items.length}>
    <div className="exercise-flag"><FlagButton pack={pack} item={flagItem} /><span>{pack.ui?.hardOne || 'Hard one?'}</span></div>
    <div className="options">{item.options.map((option, i) => <button key={option} className={`${picked ? (option === item.answer ? 'right' : option === picked ? 'wrong' : '') : ''}`} onClick={() => setPicked(option)}><span>{String.fromCharCode(65 + i)}</span>{option}</button>)}</div>
    {picked && <div className={`feedback ${correct ? 'positive' : 'negative'}`}><b>{correct ? (pack.ui?.correctTitle || '¡Muy bien!') : (pack.ui?.wrongTitle || 'Not quite yet.')}</b><p>{item.explanation || (correct ? (pack.ui?.naturalAnswer || 'That is the natural answer.') : `${pack.ui?.answerIs || 'The answer is'} “${item.answer}”. ${pack.ui?.sayIt || 'Say it once out loud.'}`)}</p></div>}
    <button className="primary lesson-next" disabled={!picked} onClick={next}>{index === items.length - 1 ? (pack.ui?.finish || 'Finish') : (pack.ui?.next || 'Next')} <ArrowRight size={18} /></button>
  </ExerciseFrame>
}

function Builder({ pack, onAward, onFinish }) {
  const [index, setIndex] = useState(0); const [chosen, setChosen] = useState([]); const [checked, setChecked] = useState(false)
  const items = useMemo(() => pack.generatedBuilder ? shuffle(pack.words).map((word) => ({ translation: word.en, answer: word.es.split(' ') })) : pack.builder, [pack])
  const item = items[index]
  const prepared = useMemo(() => prepareBuilderItem(item), [item])
  const shuffled = useMemo(() => shuffle(prepared.tokens), [prepared])
  const correct = chosen.join(' ') === prepared.tokens.join(' ')
  const next = () => { if (correct) onAward(); if (index === items.length - 1) onFinish(); else { setIndex(index + 1); setChosen([]); setChecked(false) } }
  return <ExerciseFrame kicker={pack.ui?.sentenceKicker || 'SENTENCE LAB'} title={item.translation} current={index + 1} total={items.length}>
    <div className="exercise-flag"><FlagButton pack={pack} item={{ es: prepared.canonical, en: item.translation }} /><span>{pack.ui?.hardOne || 'Hard one?'}</span></div>
    <div className="sentence-pattern" aria-label="Sentence punctuation pattern">{prepared.pattern}</div>
    <div className={`sentence-drop ${checked ? correct ? 'right' : 'wrong' : ''}`}>{chosen.length ? chosen.map((word, i) => <button key={`${word}-${i}`} onClick={() => !checked && setChosen(chosen.filter((_, n) => n !== i))}>{word}</button>) : <span>{pack.ui?.buildPlaceholder || 'Build the sentence here…'}</span>}</div>
    <div className="word-bank">{shuffled.map((word, i) => { const used = chosen.filter((x) => x === word).length >= shuffled.slice(0, i + 1).filter((x) => x === word).length; return <button key={`${word}-${i}`} disabled={used || checked} onClick={() => setChosen([...chosen, word])}>{word}</button> })}</div>
    {checked && <div className={`feedback ${correct ? 'positive' : 'negative'}`}><b>{correct ? (pack.ui?.perfect || '¡Perfecto!') : (pack.ui?.wordOrder || 'Almost—look at the word order.')}</b><p>{prepared.canonical}</p></div>}
    {!checked ? <button className="primary lesson-next" disabled={!chosen.length} onClick={() => setChecked(true)}>{pack.ui?.checkSentence || 'Check sentence'} <Check size={18} /></button> : <button className="primary lesson-next" onClick={next}>{index === items.length - 1 ? (pack.ui?.finish || 'Finish') : (pack.ui?.next || 'Next')} <ArrowRight size={18} /></button>}
  </ExerciseFrame>
}

function prepareBuilderItem(item) {
  const canonical = item.answer.join(' ')
  const firstToken = item.answer[0] || ''
  const lastToken = item.answer.at(-1) || ''
  const opening = firstToken.match(/^[¿¡]/)?.[0] || ''
  const closing = lastToken.match(/[.!?]$/)?.[0] || ''
  const tokens = item.answer.map((token, index) => {
    let clean = token
    if (index === 0 && opening) clean = clean.slice(1)
    if (index === item.answer.length - 1 && closing) clean = clean.slice(0, -1)
    return clean.toLocaleLowerCase('es')
  })
  const pattern = opening ? `${opening} ______ ${closing || (opening === '¿' ? '?' : '!')}` : `______${closing}`
  return { canonical, tokens, pattern }
}

function normalizeWrittenSpanish(value, ignoreAccents = false) {
  const normalized = value
    .toLocaleLowerCase('es')
    .replace(/[¿¡!?.,;:«»“”"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((word) => word !== 'yo')
    .join(' ')
  return ignoreAccents ? normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : normalized
}

function checkWrittenAnswer(value, item, ui = {}) {
  const exact = normalizeWrittenSpanish(value)
  const accepted = item.accepted.map((answer) => normalizeWrittenSpanish(answer))
  if (accepted.includes(exact)) return { status: 'correct', title: ui.correctTitle || '¡Muy bien!', message: item.explanation }

  const loose = normalizeWrittenSpanish(value, true)
  const acceptedLoose = item.accepted.map((answer) => normalizeWrittenSpanish(answer, true))
  if (acceptedLoose.includes(loose)) return { status: 'close', title: ui.accentTitle || 'Meaning is right — fix the accent.', message: `${ui.writeIt || 'Write it like this:'} ${item.answer}` }
  if (/\btrabajar\b/i.test(value)) return { status: 'wrong', title: ui.verbFormTitle || 'Use a conjugated verb.', message: ui.workFormMessage || 'For “I work”, use trabajo; trabajar means “to work”.' }
  if (/\bvolver\b/i.test(value)) return { status: 'wrong', title: ui.infinitiveTitle || 'Change the infinitive.', message: ui.returnFormMessage || 'For “I return”, use vuelvo, not volver.' }
  if (/\bno\s+(tiempo|aquí|allí|ahora)\b/i.test(value)) return { status: 'wrong', title: ui.noPositionTitle || 'Put no before the verb.', message: `${ui.naturalVariant || 'One natural version:'} ${item.answer}` }
  return { status: 'wrong', title: ui.notYetTitle || 'Not quite yet.', message: `${ui.compareVariant || 'Compare it with this version:'} ${item.answer}` }
}

function Composer({ pack, onAward, onFinish }) {
  const [index, setIndex] = useState(0)
  const [value, setValue] = useState('')
  const [result, setResult] = useState(null)
  const [hint, setHint] = useState(false)
  const item = pack.compose[index]
  useEffect(() => setResult(null), [pack.activeLanguage])
  const check = () => setResult(checkWrittenAnswer(value, item, pack.ui))
  const next = () => {
    if (result?.status === 'correct') onAward(12)
    if (index === pack.compose.length - 1) onFinish()
    else { setIndex(index + 1); setValue(''); setResult(null); setHint(false) }
  }

  return <ExerciseFrame kicker={pack.ui?.composerKicker || 'CREATE SENTENCES · NO WORD BANK'} title={item.prompt} current={index + 1} total={pack.compose.length}>
    <div className="compose-card">
      <label htmlFor="sentence-answer">{pack.ui?.yourPhrase || 'Your sentence'}</label>
      <textarea id="sentence-answer" value={value} disabled={result?.status === 'correct'} placeholder={pack.ui?.composePlaceholder || 'Write in Spanish…'} autoCapitalize="sentences" spellCheck="false" onChange={(event) => { setValue(event.target.value); setResult(null) }} />
      <div className="compose-tools">
        <button type="button" className="compose-hint-button" onClick={() => setHint((old) => !old)}><Sparkles size={16} /> {hint ? (pack.ui?.hideHint || 'Hide hint') : (pack.ui?.showHint || 'Need a hint?')}</button>
        <span>{value.trim().split(/\s+/).filter(Boolean).length} {pack.ui?.words || 'words'}</span>
      </div>
      {hint && <div className="compose-hint">{item.hint}</div>}
    </div>
    {result && <div className={`feedback compose-feedback ${result.status === 'correct' ? 'positive' : 'negative'} ${result.status}`}><b>{result.title}</b><p>{result.message}</p></div>}
    {!result || result.status !== 'correct'
      ? <button className="primary lesson-next" disabled={!value.trim()} onClick={check}>{pack.ui?.checkPhrase || 'Check sentence'} <Check size={18} /></button>
      : <button className="primary lesson-next" onClick={next}>{index === pack.compose.length - 1 ? (pack.ui?.finishLesson || 'Finish lesson') : (pack.ui?.nextPhrase || 'Next sentence')} <ArrowRight size={18} /></button>}
  </ExerciseFrame>
}

function formatCreatedSentence(value) {
  const clean = value.replace(/\s+/g, ' ').trim()
  return /[.!?]$/.test(clean) ? clean : `${clean}.`
}

function SentenceCreationFinal({ pack, onAward, onFinish }) {
  const [sentences, setSentences] = usePersistedState(`sg-created-sentences-${pack.id}`, [])
  const [value, setValue] = useState('')
  const [result, setResult] = useState(null)
  const total = pack.creation.total || 10
  const complete = sentences.length >= total

  useEffect(() => setResult(null), [pack.activeLanguage])
  const check = () => {
    const checker = pack.creation.checker === 'core-verbs' ? checkCoreVerbsSentence : checkJoseSentence
    const evaluation = checker(value, sentences, pack.activeLanguage)
    setResult(evaluation)
    if (evaluation.correct && evaluation.counted) {
      setSentences((old) => [...old, formatCreatedSentence(value)].slice(0, total))
      setValue('')
      onAward(15)
    }
  }
  const reset = () => { setSentences([]); setValue(''); setResult(null) }
  const removeSentence = (index) => setSentences((old) => old.filter((_, itemIndex) => itemIndex !== index))

  if (complete) return <ExerciseFrame kicker={pack.ui?.creationCompleteKicker || `YOUR ${total} SENTENCES`} title={pack.ui?.creationCompleteTitle || `You created all ${total}.`} current={total} total={total}>
    <p className="creation-complete-copy">{pack.ui?.creationCompleteBody || 'These are your sentences — not a translated list and not a word-order puzzle.'}</p>
    <ol className="creation-final-list">{sentences.slice(0, total).map((sentence, index) => <li key={`${sentence}-${index}`}><span>{index + 1}</span><b>{sentence}</b><button type="button" aria-label={`${pack.ui?.removeSentence || 'Remove sentence'} ${index + 1}`} onClick={() => removeSentence(index)}><X size={16} /></button></li>)}</ol>
    <div className="creation-final-actions"><button type="button" className="back-button" onClick={reset}><RotateCcw size={17} /> {pack.ui?.newSet || 'Write a new set'}</button><button type="button" className="primary" onClick={onFinish}>{pack.ui?.finishAndSave || 'Finish and save'} <ArrowRight size={18} /></button></div>
  </ExerciseFrame>

  return <ExerciseFrame kicker={pack.ui?.creationKicker || 'CREATE SENTENCES'} title={pack.creation.title} current={sentences.length} total={total}>
    <p className="creation-instruction">{pack.creation.instruction}</p>
    <section className="creation-bank">
      <div className="creation-bank-head"><b>{pack.ui?.wordBank || 'Words in front of you'}</b><span>{sentences.length} / {total}</span></div>
      <div className="creation-word-grid">{pack.creation.bank.map((item) => <span key={item.word}><b>{item.word}</b><small>{item.meaning}</small></span>)}</div>
      <div className="creation-form-strip"><b>{pack.ui?.usefulForms || 'Useful forms'}</b>{pack.creation.forms.map((form) => <span key={form}>{form}</span>)}</div>
    </section>
    <section className="creation-input-card">
      <label htmlFor="free-sentence">{pack.ui?.sentenceNumber || 'Sentence'} {sentences.length + 1} / {total}</label>
      <textarea id="free-sentence" value={value} placeholder={pack.ui?.freePlaceholder || 'Create any sentence with these words…'} autoCapitalize="sentences" spellCheck="false" onChange={(event) => { setValue(event.target.value); setResult(null) }} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && value.trim()) check() }} />
      <button type="button" className="primary" disabled={!value.trim()} onClick={check}>{pack.ui?.checkMySentence || 'Check my sentence'} <Check size={18} /></button>
    </section>
    {result && <div className={`feedback creation-feedback ${result.correct && !result.duplicate ? 'positive' : result.duplicate ? 'close' : 'negative'}`}><b>{result.correct ? (result.duplicate ? (pack.ui?.correctDuplicate || 'Correct, but already counted') : (pack.ui?.createdCorrect || 'Correct — added to your list')) : (pack.ui?.createdWrong || 'This needs a change')}</b><p>{result.reason}</p></div>}
    {sentences.length > 0 && <section className="creation-progress-list"><h3>{pack.ui?.yourCorrectSentences || 'Your correct sentences'} <span>{sentences.length}/{total}</span></h3><ol>{sentences.map((sentence, index) => <li key={`${sentence}-${index}`}><span>{index + 1}</span><b>{sentence}</b><button type="button" aria-label={`${pack.ui?.removeSentence || 'Remove sentence'} ${index + 1}`} onClick={() => removeSentence(index)}><X size={15} /></button></li>)}</ol></section>}
  </ExerciseFrame>
}

function quizFlagItem(pack, item) {
  if (item.flagItem) return item.flagItem
  const matchingWord = pack.words.find((word) => item.prompt.includes(word.es) || item.answer === word.es || item.answer === word.en)
  if (matchingWord) return matchingWord
  return { es: item.prompt.replace('___', item.answer), en: item.explanation || 'Complete this sentence correctly.' }
}

function Vocabulary({ pack, onAward, onFinish }) {
  const vocabPack = useMemo(() => ({ ...pack, words: pack.vocabulary, generatedQuiz: true }), [pack])
  return <Quiz pack={vocabPack} onAward={onAward} onFinish={onFinish} />
}

function Scene({ pack, onAward, onFinish }) {
  const [picked, setPicked] = useState(null); const reply = pack.scene.replies.find((r) => r.text === picked)
  return <ExerciseFrame kicker="REAL-LIFE SCENE" title={pack.scene.place} current={picked ? 1 : 0} total={1}>
    <div className="dialogue"><div className="speaker-avatar">{pack.scene.speaker[0]}</div><div><span>{pack.scene.speaker}</span><p>{pack.scene.line}</p></div><FlagButton pack={pack} item={{ es: pack.scene.line, en: pack.scene.note }} /></div>
    <div className="culture-note"><Sparkles size={18} /><p>{pack.scene.note}</p></div>
    <h3 className="your-turn">What would you say?</h3>
    <div className="options scene-options">{pack.scene.replies.map((r, i) => <div className="scene-option-row" key={r.text}><button className={picked ? r.correct ? 'right' : picked === r.text ? 'wrong' : '' : ''} onClick={() => setPicked(r.text)}><span>{i + 1}</span>{r.text}</button><FlagButton pack={pack} item={{ es: r.text, en: r.feedback }} /></div>)}</div>
    {reply && <div className={`feedback ${reply.correct ? 'positive' : 'negative'}`}><b>{reply.correct ? 'Natural choice!' : 'A memorable choice.'}</b><p>{reply.feedback}</p></div>}
    <button className="primary lesson-next" disabled={!picked} onClick={() => { if (reply.correct) onAward(); onFinish() }}>Finish scene <ArrowRight size={18} /></button>
  </ExerciseFrame>
}

function ReviewPage({ packs, flaggedItems, onBack, onTrain }) {
  const groups = useMemo(() => {
    const byPack = new Map()
    flaggedItems.forEach((item) => {
      const pack = packs.find((candidate) => candidate.id === item.packId) || { id: item.packId, title: item.packTitle, eyebrow: item.packEyebrow, accent: 'mint' }
      if (!byPack.has(item.packId)) byPack.set(item.packId, { pack, items: [] })
      byPack.get(item.packId).items.push(item)
    })
    return [...byPack.values()]
  }, [flaggedItems, packs])

  return <div className="page review-page">
    <button className="back-button review-back" onClick={onBack}><ArrowLeft size={17} /> Back to lessons</button>
    <section className="review-hero">
      <div><span className="kicker">YOUR DIFFICULT POCKET</span><h1>Things that refuse to stick</h1><p>Flag freely. This space keeps the stubborn words close and brings them back at the right moment.</p></div>
      <div className="review-total"><Flag fill="currentColor" /><b>{flaggedItems.length}</b><span>flagged</span></div>
      {flaggedItems.length > 0 && <button className="primary light-button" onClick={() => onTrain(flaggedItems)}><Brain size={18} /> Train everything</button>}
    </section>
    {!flaggedItems.length ? <div className="review-empty"><Flag size={34} /><h2>Nothing is difficult yet</h2><p>Tap the flag beside any phrase or word during a lesson. It will appear here instantly.</p><button className="primary" onClick={onBack}>Find something to learn</button></div> : <section className="review-groups">
      {groups.map(({ pack, items }) => <article className={`review-group ${pack.accent || 'mint'}`} key={pack.id}>
        <header><div><span className="eyebrow">{pack.eyebrow}</span><h2>{pack.title}</h2><p>{items.length} difficult {items.length === 1 ? 'item' : 'items'}</p></div><button className="primary" onClick={() => onTrain(items)}>Focus this lesson <ArrowRight size={17} /></button></header>
        <div className="review-list">{items.map((item) => <div className="review-item" key={item.id}><button className="review-audio" aria-label={`Play ${item.es}`} onClick={() => speakSpanish(item.es)}><Volume2 size={17} /></button><div><b>{item.es}</b><span>{item.en}</span></div><FlagButton pack={pack} item={item} /></div>)}</div>
      </article>)}
    </section>}
    <div className="swipe-hint"><ArrowRight size={16} /> Swipe right to return to lessons</div>
  </div>
}

function makeReviewQueue(items) {
  return shuffle(items.flatMap((item) => [
    { key: `${item.id}:to-es`, item, direction: 'toSpanish' },
    { key: `${item.id}:to-meaning`, item, direction: 'toMeaning' },
  ]))
}

function FlaggedTrainer({ items, onBack, onAward }) {
  const [queue, setQueue] = useState(() => makeReviewQueue(items))
  const [revealed, setRevealed] = useState(false)
  const [mastered, setMastered] = useState(0)
  const total = items.length * 2
  const challenge = queue[0]
  const restart = () => { setQueue(makeReviewQueue(items)); setRevealed(false); setMastered(0) }
  const rate = (rating) => {
    const rest = queue.slice(1)
    if (rating === 'again') rest.splice(Math.min(2, rest.length), 0, challenge)
    else if (rating === 'hard') rest.push(challenge)
    else { setMastered((old) => old + 1); onAward(3) }
    setQueue(rest)
    setRevealed(false)
  }

  if (!challenge) return <div className="review-trainer complete-review"><div className="review-complete-mark"><Trophy /></div><span className="kicker">DIFFICULT POCKET CLEARED</span><h1>These are already less scary.</h1><p>You recalled every flagged item in both directions. Repeat tomorrow and they will have to work much harder to escape.</p><div><button className="back-button" onClick={onBack}><ArrowLeft size={17} /> Review shelf</button><button className="primary" onClick={restart}><RotateCcw size={17} /> Repeat the loop</button></div></div>

  const prompt = challenge.direction === 'toSpanish' ? challenge.item.en : challenge.item.es
  const answer = challenge.direction === 'toSpanish' ? challenge.item.es : challenge.item.en
  const pack = { id: challenge.item.packId, title: challenge.item.packTitle, eyebrow: challenge.item.packEyebrow }
  return <div className="review-trainer">
    <header className="exercise-header"><button className="back-button" onClick={onBack}><X size={20} /> Exit</button><div className="exercise-title"><span>ADAPTIVE FLAG LOOP</span><b>Difficult words</b></div><div className="trainer-queue"><Flag size={15} fill="currentColor" /> {queue.length} left</div></header>
    <main className="exercise-main">
      <ProgressBar current={mastered} total={total} />
      <section className="trainer-card">
        <div className="trainer-top"><span>{challenge.direction === 'toSpanish' ? 'SAY IT IN SPANISH' : 'RECALL THE MEANING'}</span><FlagButton pack={pack} item={challenge.item} /></div>
        <h1>{prompt}</h1>
        {!revealed ? <><p className="trainer-instruction">Say the answer out loud before revealing it. No passive recognition.</p><button className="primary reveal-answer" onClick={() => setRevealed(true)}>Reveal answer <RotateCcw size={18} /></button></> : <div className="trainer-answer"><span>ANSWER</span><div><h2>{answer}</h2><button className="audio-button inline-audio" aria-label="Play Spanish pronunciation" onClick={() => speakSpanish(challenge.item.es)}><Volume2 /></button></div>{challenge.item.example && <p>{challenge.item.example}</p>}</div>}
      </section>
      {revealed && <div className="memory-rating"><p>How did that recall feel?</p><div><button className="again" onClick={() => rate('again')}><RotateCcw size={16} /><b>Again</b><span>soon</span></button><button className="hard" onClick={() => rate('hard')}><Brain size={16} /><b>Hard</b><span>later</span></button><button className="got" onClick={() => rate('got')}><Check size={16} /><b>Got it</b><span>retire</span></button></div></div>}
      <p className="adaptive-note">Again returns after two cards. Hard returns near the end. Got it retires this direction for today.</p>
    </main>
  </div>
}

function ExerciseFrame({ kicker, title, current, total, children }) {
  return <main className="exercise-main"><ProgressBar current={current} total={total} /><section className="exercise-content"><span className="kicker">{kicker}</span><h1>{title}</h1>{children}</section></main>
}

function ImportModal({ onClose, onSave }) {
  const [title, setTitle] = useState(''); const [raw, setRaw] = useState('')
  const submit = (e) => {
    e.preventDefault(); const entries = raw.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
      const [es, en = 'Add a translation with Codex'] = line.split(/\s*[—=-]\s*/, 2); return { es, en, example: `Practica “${es}” en una frase real.` }
    })
    if (!title || !entries.length) return
    onSave({ id: `custom-${Date.now()}`, title, eyebrow: 'Custom material', description: 'A fresh practice set made from your own material.', accent: 'mint', minutes: Math.max(5, entries.length * 2), icon: 'Sparkles', words: entries, quiz: entries.slice(0, 5).map((w) => ({ prompt: `What does “${w.es}” mean?`, options: [w.en, 'Not this one', 'Something else'], answer: w.en })), builder: entries.slice(0, 3).map((w) => ({ translation: w.en, answer: w.es.split(' ') })), scene: { place: `Practice: ${title}`, speaker: 'Tu compañero', line: `¿Puedes usar “${entries[0].es}” en una frase?`, note: 'Custom packs are a starting point. Ask Codex to turn them into a richer interactive lesson.', replies: [{ text: entries[0].example, feedback: 'Great—now make it personal.', correct: true }, { text: 'No sé.', feedback: 'Fair, but let’s give it one brave try.', correct: false }] } })
  }
  return <div className="modal-backdrop" onMouseDown={onClose}><form className="import-modal" onSubmit={submit} onMouseDown={(e) => e.stopPropagation()}><button type="button" className="modal-close" onClick={onClose}><X /></button><span className="kicker">QUICK IMPORT</span><h2>Give the playground<br />something new</h2><p>Paste one item per line. Use a dash when you already have a translation.</p><label>Topic name<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Talking to my landlord" autoFocus /></label><label>Words or phrases<textarea value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={'la fianza — deposit\n¿Están incluidos los gastos? — Are utilities included?'} /></label><button className="primary" type="submit">Create practice pack <Sparkles size={18} /></button><small>For deeper exercises, send the material to Codex in chat and the pack can be expanded directly.</small></form></div>
}

export default App
