import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowRight, BookOpen, Brain, Check, ChevronRight, CircleUserRound,
  Coffee, Flag, Flame, Home, Menu, MessageSquareText, MessagesSquare, Plus, RotateCcw, Settings,
  Sparkles, SquareCheckBig, Target, Volume2, X, Zap,
} from 'lucide-react'
import { starterPacks } from './content/lessonPacks.js'

const icons = { Coffee, MessagesSquare, Sparkles, Brain }
const modes = [
  { id: 'guide', label: 'Clear guide', icon: BookOpen, description: 'Understand the idea first — without grammar fog.', requires: 'guide' },
  { id: 'cards', label: 'Two-way deck', icon: Zap, description: 'Flip through every item in alternating directions.' },
  { id: 'match', label: '4×4 Match', icon: Target, description: 'Connect four Spanish phrases with four meanings, round after round.' },
  { id: 'quiz', label: 'Two-way quiz', icon: Brain, description: 'Choose meanings and Spanish phrases in both directions.' },
  { id: 'builder', label: 'Sentence lab', icon: BookOpen, description: 'Build Spanish with your hands and feel the word order.' },
  { id: 'vocab', label: 'Word focus', icon: Sparkles, description: 'Pull the important individual words out of the full phrases.', requires: 'vocabulary' },
  { id: 'scene', label: 'Real-life scene', icon: MessagesSquare, description: 'Choose what you would actually say in a real moment.', requires: 'scene' },
]

const initialProgress = { xp: 120, streak: 3, completed: [], modeCompletions: {}, mistakes: 4 }
const FlagContext = createContext({ flaggedItems: [], toggleFlag: () => {} })

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

function App() {
  const [customPacks, setCustomPacks] = usePersistedState('sg-custom-packs', [])
  const [progress, setProgress] = usePersistedState('sg-progress', initialProgress)
  const [flaggedItems, setFlaggedItems] = usePersistedState('sg-flagged-items', [])
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

  if (activePack && activeMode) return <FlagContext.Provider value={{ flaggedItems, toggleFlag }}><Exercise pack={activePack} mode={activeMode} onBack={() => setActiveMode(null)} onAward={award} onFinish={finish} /></FlagContext.Provider>
  if (reviewItems) return <FlagContext.Provider value={{ flaggedItems, toggleFlag }}><FlaggedTrainer items={reviewItems} onBack={() => setReviewItems(null)} onAward={award} /></FlagContext.Provider>

  return (
    <FlagContext.Provider value={{ flaggedItems, toggleFlag }}>
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
    </FlagContext.Provider>
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
          <h2>{featured.title}</h2>
          <p>{featured.description}</p>
          <div className="lesson-chip"><span>Phrase of the day</span><small>{featured.minutes} min</small></div>
          <button className="primary light-button" aria-label={`Open ${featured.title}`} onClick={() => onOpen(featured)}><ArrowRight size={19} /></button>
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
  const Icon = icons[pack.icon] || BookOpen
  return (
    <button className={`pack-card ${pack.accent}`} onClick={onClick}>
      <div className="pack-icon"><Icon /></div>
      <span className="eyebrow">{pack.eyebrow}</span>
      <h3>{pack.title}</h3><p>{pack.description}</p>
      <div className="pack-meta"><span>{pack.minutes} min</span><span>•</span><span>{pack.words.length} words</span>{mastery > 0 && <span className="completed">{mastery === 100 && <Check size={13} />}{mastery === 100 ? 'Done' : `${mastery}%`}</span>}<ArrowRight size={18} /></div>
    </button>
  )
}

function PackOverview({ pack, progress, onBack, onStart }) {
  const Icon = icons[pack.icon] || BookOpen
  const availableModes = availableModesFor(pack)
  const completedModes = completedModesFor(progress, pack.id).filter((modeId) => availableModes.some((mode) => mode.id === modeId))
  const mastery = masteryFor(progress, pack)
  return (
    <div className="page pack-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={17} /> Back to playground</button>
      <section className={`pack-hero ${pack.accent}`}>
        <div className="pack-hero-icon"><Icon /></div><div><span className="eyebrow">{pack.eyebrow}</span><h1>{pack.title}</h1><p>{pack.description}</p></div>
        <div className="pack-score"><b>{mastery}%</b><span>mastery · {completedModes.length}/{availableModes.length} modes</span></div>
      </section>
      <div className="section-heading"><div><span className="kicker">CHOOSE A MODE</span><h2>How do you want to practise?</h2></div></div>
      <section className="mode-grid">
        {availableModes.map((mode, index) => { const IconMode = mode.icon; return (
          <button key={mode.id} className="mode-card" onClick={() => onStart(mode.id)}>
            <span className="mode-number">0{index + 1}</span><span className="mode-icon"><IconMode /></span><h3>{mode.label}</h3>
            <p>{mode.description}</p>
            <span className={`mode-start ${completedModes.includes(mode.id) ? 'mode-complete' : ''}`}>{completedModes.includes(mode.id) ? <><Check size={17} /> Completed</> : <>Start <ArrowRight size={17} /></>}</span>
          </button>
        )})}
      </section>
    </div>
  )
}

function Exercise({ pack, mode, onBack, onAward, onFinish }) {
  return (
    <div className="exercise-shell">
      <header className="exercise-header"><button className="back-button" onClick={onBack}><X size={20} /> Exit</button><div className="exercise-title"><span>{pack.eyebrow}</span><b>{modes.find((m) => m.id === mode)?.label}</b></div><div className="xp-chip"><Sparkles size={16} /> +10 XP</div></header>
      {mode === 'cards' && <Cards pack={pack} onAward={onAward} onFinish={onFinish} />}
      {mode === 'guide' && <GrammarGuide pack={pack} onAward={onAward} onFinish={onFinish} />}
      {mode === 'match' && <Match pack={pack} onAward={onAward} onFinish={onFinish} />}
      {mode === 'quiz' && <Quiz pack={pack} onAward={onAward} onFinish={onFinish} />}
      {mode === 'builder' && <Builder pack={pack} onAward={onAward} onFinish={onFinish} />}
      {mode === 'vocab' && <Vocabulary pack={pack} onAward={onAward} onFinish={onFinish} />}
      {mode === 'scene' && <Scene pack={pack} onAward={onAward} onFinish={onFinish} />}
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
  return <ExerciseFrame kicker="SER VS ESTAR · THE MAP" title={page.title} current={index + 1} total={pack.guide.length}>
    <div className="grammar-guide">
      <p className="guide-body">{page.body}</p>
      <div className="guide-rule">{page.rule}</div>
      <div className="guide-examples">{page.examples.map(([spanish, note]) => <div key={spanish}><b>{spanish}</b><span>{note}</span><FlagButton pack={pack} item={{ es: spanish, en: note }} /></div>)}</div>
    </div>
    <div className="guide-actions">
      <button className="back-button" disabled={index === 0} onClick={() => setIndex(index - 1)}><ArrowLeft size={17} /> Previous</button>
      <button className="primary" onClick={next}>{index === pack.guide.length - 1 ? 'Start practising' : 'I understand'} <ArrowRight size={18} /></button>
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
  const items = useMemo(() => shuffle(pack.words), [pack])
  const word = items[index]
  const next = () => { onAward(); if (index === pack.words.length - 1) onFinish(); else { setIndex(index + 1); setFlipped(false) } }
  return <ExerciseFrame kicker="MAKE IT STICK" title="Say it before you reveal it" current={index + 1} total={pack.words.length}>
    <div className={`flashcard ${flipped ? 'flipped' : ''}`} role="button" tabIndex={0} onClick={() => setFlipped(!flipped)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setFlipped(!flipped) }}>
      <FlagButton pack={pack} item={word} className="card-flag" />
      <span className="card-label">{flipped ? 'MEANING & CONTEXT' : 'SPANISH → ENGLISH'}</span>
      <h2>{flipped ? word.en : word.es}</h2>
      {flipped ? <p>“{word.example}”</p> : <span className="flip-hint"><RotateCcw size={17} /> Recall it, then reveal</span>}
      <button className="audio-button" aria-label="Play Spanish pronunciation" onClick={(event) => { event.stopPropagation(); speakSpanish(word.es) }}><Volume2 /></button>
    </div>
    <button className="primary lesson-next" disabled={!flipped} onClick={next}>{index === pack.words.length - 1 ? 'Finish' : 'Got it'} <ArrowRight size={18} /></button>
  </ExerciseFrame>
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
  const items = useMemo(() => shuffle(pack.words), [pack])
  const [round, setRound] = useState(0)
  const [leftPick, setLeftPick] = useState(null)
  const [rightPick, setRightPick] = useState(null)
  const [matched, setMatched] = useState([])
  const [message, setMessage] = useState('')
  const batch = items.slice(round * 4, round * 4 + 4)
  const meanings = useMemo(() => shuffle(batch), [round, items])
  const totalRounds = Math.ceil(items.length / 4)

  const assess = (left, right) => {
    if (!left || !right) return
    if (left.es === right.es) {
      setMatched((old) => [...old, left.es])
      setMessage('¡Sí! That pair belongs together.')
      onAward(3)
    } else setMessage('Not this pair — try the other meaning.')
    setLeftPick(null)
    setRightPick(null)
  }
  const pickLeft = (item) => { setLeftPick(item); setMessage(''); if (rightPick) assess(item, rightPick) }
  const pickRight = (item) => { setRightPick(item); setMessage(''); if (leftPick) assess(leftPick, item) }
  const nextRound = () => {
    if (round === totalRounds - 1) onFinish()
    else { setRound(round + 1); setMatched([]); setMessage(''); setLeftPick(null); setRightPick(null) }
  }

  return <ExerciseFrame kicker="4 × 4 MATCH" title={`Connect the pairs · Round ${round + 1} of ${totalRounds}`} current={round * 4 + matched.length} total={items.length}>
    <div className="match-board">
      <div>{batch.map((item) => <div className="match-item" key={item.es}><button disabled={matched.includes(item.es)} className={leftPick?.es === item.es ? 'selected' : ''} onClick={() => pickLeft(item)}>{item.es}</button><FlagButton pack={pack} item={item} /></div>)}</div>
      <div>{meanings.map((item) => <button key={item.es} disabled={matched.includes(item.es)} className={rightPick?.es === item.es ? 'selected' : ''} onClick={() => pickRight(item)}>{item.en}</button>)}</div>
    </div>
    <div className={`match-message ${message.startsWith('¡') ? 'good' : ''}`}>{message || `${matched.length} of ${batch.length} matched`}</div>
    <button className="primary lesson-next" disabled={matched.length !== batch.length} onClick={nextRound}>{round === totalRounds - 1 ? 'Finish all 60' : 'Next four'} <ArrowRight size={18} /></button>
  </ExerciseFrame>
}

function Quiz({ pack, onAward, onFinish }) {
  const [index, setIndex] = useState(0); const [picked, setPicked] = useState(null)
  const items = useMemo(() => pack.generatedQuiz ? generatedQuiz(pack.words) : pack.quiz, [pack])
  const item = items[index]; const correct = picked === item.answer
  const flagItem = quizFlagItem(pack, item)
  const next = () => { if (correct) onAward(); if (index === items.length - 1) onFinish(); else { setIndex(index + 1); setPicked(null) } }
  return <ExerciseFrame kicker="TWO-WAY QUIZ" title={item.prompt} current={index + 1} total={items.length}>
    <div className="exercise-flag"><FlagButton pack={pack} item={flagItem} /><span>Hard one?</span></div>
    <div className="options">{item.options.map((option, i) => <button key={option} className={`${picked ? (option === item.answer ? 'right' : option === picked ? 'wrong' : '') : ''}`} onClick={() => setPicked(option)}><span>{String.fromCharCode(65 + i)}</span>{option}</button>)}</div>
    {picked && <div className={`feedback ${correct ? 'positive' : 'negative'}`}><b>{correct ? '¡Muy bien!' : 'Not quite yet.'}</b><p>{item.explanation || (correct ? 'That is the natural answer.' : `The answer is “${item.answer}”. Say it once out loud.`)}</p></div>}
    <button className="primary lesson-next" disabled={!picked} onClick={next}>{index === items.length - 1 ? 'Finish' : 'Next'} <ArrowRight size={18} /></button>
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
  return <ExerciseFrame kicker="SENTENCE LAB" title={item.translation} current={index + 1} total={items.length}>
    <div className="exercise-flag"><FlagButton pack={pack} item={{ es: prepared.canonical, en: item.translation }} /><span>Hard one?</span></div>
    <div className="sentence-pattern" aria-label="Sentence punctuation pattern">{prepared.pattern}</div>
    <div className={`sentence-drop ${checked ? correct ? 'right' : 'wrong' : ''}`}>{chosen.length ? chosen.map((word, i) => <button key={`${word}-${i}`} onClick={() => !checked && setChosen(chosen.filter((_, n) => n !== i))}>{word}</button>) : <span>Build the sentence here…</span>}</div>
    <div className="word-bank">{shuffled.map((word, i) => { const used = chosen.filter((x) => x === word).length >= shuffled.slice(0, i + 1).filter((x) => x === word).length; return <button key={`${word}-${i}`} disabled={used || checked} onClick={() => setChosen([...chosen, word])}>{word}</button> })}</div>
    {checked && <div className={`feedback ${correct ? 'positive' : 'negative'}`}><b>{correct ? '¡Perfecto!' : 'Almost—look at the word order.'}</b><p>{prepared.canonical}</p></div>}
    {!checked ? <button className="primary lesson-next" disabled={!chosen.length} onClick={() => setChecked(true)}>Check sentence <Check size={18} /></button> : <button className="primary lesson-next" onClick={next}>{index === items.length - 1 ? 'Finish' : 'Next'} <ArrowRight size={18} /></button>}
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
