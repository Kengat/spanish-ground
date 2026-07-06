import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, ArrowRight, BookOpen, Brain, Check, ChevronRight, CircleUserRound,
  Coffee, Flame, Home, Library, Menu, MessagesSquare, Plus, RotateCcw, Settings,
  Sparkles, Target, Trophy, Volume2, X, Zap,
} from 'lucide-react'
import { starterPacks } from './content/lessonPacks.js'

const icons = { Coffee, MessagesSquare, Sparkles }
const modes = [
  { id: 'cards', label: 'Two-way deck', icon: Zap, description: 'Flip through every item in alternating directions.' },
  { id: 'match', label: '4×4 Match', icon: Target, description: 'Connect four Spanish phrases with four meanings, round after round.' },
  { id: 'quiz', label: 'Two-way quiz', icon: Brain, description: 'Choose meanings and Spanish phrases in both directions.' },
  { id: 'builder', label: 'Sentence lab', icon: BookOpen, description: 'Build Spanish with your hands and feel the word order.' },
  { id: 'vocab', label: 'Word focus', icon: Sparkles, description: 'Pull the important individual words out of the full phrases.', requires: 'vocabulary' },
  { id: 'scene', label: 'Real-life scene', icon: MessagesSquare, description: 'Choose what you would actually say in a real moment.', requires: 'scene' },
]

const initialProgress = { xp: 120, streak: 3, completed: [], mistakes: 4 }

function usePersistedState(key, fallback) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
  })
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value])
  return [value, setValue]
}

function App() {
  const [customPacks, setCustomPacks] = usePersistedState('sg-custom-packs', [])
  const [progress, setProgress] = usePersistedState('sg-progress', initialProgress)
  const [activePack, setActivePack] = useState(null)
  const [activeMode, setActiveMode] = useState(null)
  const [showImport, setShowImport] = useState(false)
  const packs = useMemo(() => [...starterPacks, ...customPacks], [customPacks])

  const award = (amount = 10) => setProgress((old) => ({ ...old, xp: old.xp + amount }))
  const finish = () => {
    setProgress((old) => ({
      ...old,
      xp: old.xp + 30,
      completed: old.completed.includes(activePack.id) ? old.completed : [...old.completed, activePack.id],
    }))
    setActiveMode(null)
  }

  if (activePack && activeMode) {
    return <Exercise pack={activePack} mode={activeMode} onBack={() => setActiveMode(null)} onAward={award} onFinish={finish} />
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        <Topbar progress={progress} />
        {!activePack ? (
          <Dashboard
            packs={packs}
            progress={progress}
            onOpen={setActivePack}
            onImport={() => setShowImport(true)}
          />
        ) : (
          <PackOverview pack={activePack} progress={progress} onBack={() => setActivePack(null)} onStart={setActiveMode} />
        )}
      </main>
      {showImport && <ImportModal onClose={() => setShowImport(false)} onSave={(pack) => { setCustomPacks((old) => [...old, pack]); setShowImport(false) }} />}
    </div>
  )
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">ñ</span><span>Spanish<br /><b>Ground</b></span></div>
      <nav>
        <button className="nav-item active"><Home size={20} /> Today</button>
        <button className="nav-item"><Library size={20} /> My library</button>
        <button className="nav-item"><Target size={20} /> Review</button>
        <button className="nav-item"><Trophy size={20} /> Progress</button>
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

function Dashboard({ packs, progress, onOpen, onImport }) {
  const featured = packs.find((pack) => pack.id === 'everyday-60') || packs[0]
  return (
    <div className="page dashboard">
      <section className="hero">
        <div>
          <span className="kicker">LUNES · YOUR LEARNING GROUND</span>
          <h1>Hola, Illia <span>👋</span></h1>
          <p>Small steps, real Spanish. What are we exploring today?</p>
        </div>
        <div className="daily-ring"><div><strong>2</strong><span>/ 3</span></div><small>today’s<br />activities</small></div>
      </section>

      <section className="continue-card">
        <div className="continue-copy">
          <span className="eyebrow light">READY WHEN YOU ARE</span>
          <h2>{featured.title}</h2>
          <p>{featured.description}</p>
          <button className="primary light-button" onClick={() => onOpen(featured)}>Start marathon <ArrowRight size={18} /></button>
        </div>
        <div className="scene-art" aria-hidden="true">
          <div className="sun" /><div className="awning"><i /><i /><i /><i /><i /></div>
          <div className="window"><span>CAFÉ</span></div><div className="plant">♧</div>
          <div className="table"><span>☕</span></div><div className="chair" />
        </div>
        <div className="continue-progress"><span style={{ width: '58%' }} /></div>
      </section>

      <div className="section-heading"><div><span className="kicker">PICK YOUR PATH</span><h2>Explore your playground</h2></div><button className="text-button" onClick={onImport}><Plus size={17} /> Add material</button></div>
      <section className="pack-grid">
        {packs.map((pack) => <PackCard key={pack.id} pack={pack} completed={progress.completed.includes(pack.id)} onClick={() => onOpen(pack)} />)}
        <button className="new-pack-card" onClick={onImport}><span><Plus /></span><b>Drop in something new</b><small>Words, phrases, a topic or any text</small></button>
      </section>

      <section className="insight-row">
        <div className="insight-card"><span className="insight-icon"><Brain /></span><div><span className="kicker">SMART REVIEW</span><h3>{progress.mistakes} things worth another look</h3><p>Mistakes aren’t debt. They’re your next lesson plan.</p></div><button className="round-button"><ArrowRight /></button></div>
        <div className="quote-card"><Sparkles /><blockquote>“Poco a poco se llega lejos.”</blockquote><p>Little by little, you go far.</p></div>
      </section>
    </div>
  )
}

function PackCard({ pack, completed, onClick }) {
  const Icon = icons[pack.icon] || BookOpen
  return (
    <button className={`pack-card ${pack.accent}`} onClick={onClick}>
      <div className="pack-icon"><Icon /></div>
      <span className="eyebrow">{pack.eyebrow}</span>
      <h3>{pack.title}</h3><p>{pack.description}</p>
      <div className="pack-meta"><span>{pack.minutes} min</span><span>•</span><span>{pack.words.length} words</span>{completed && <span className="completed"><Check size={13} /> Done</span>}<ArrowRight size={18} /></div>
    </button>
  )
}

function PackOverview({ pack, progress, onBack, onStart }) {
  const Icon = icons[pack.icon] || BookOpen
  const availableModes = modes.filter((mode) => !mode.requires || pack[mode.requires])
  return (
    <div className="page pack-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={17} /> Back to playground</button>
      <section className={`pack-hero ${pack.accent}`}>
        <div className="pack-hero-icon"><Icon /></div><div><span className="eyebrow">{pack.eyebrow}</span><h1>{pack.title}</h1><p>{pack.description}</p></div>
        <div className="pack-score"><b>{progress.completed.includes(pack.id) ? '100%' : '0%'}</b><span>mastery</span></div>
      </section>
      <div className="section-heading"><div><span className="kicker">CHOOSE A MODE</span><h2>How do you want to practise?</h2></div></div>
      <section className="mode-grid">
        {availableModes.map((mode, index) => { const IconMode = mode.icon; return (
          <button key={mode.id} className="mode-card" onClick={() => onStart(mode.id)}>
            <span className="mode-number">0{index + 1}</span><span className="mode-icon"><IconMode /></span><h3>{mode.label}</h3>
            <p>{mode.description}</p>
            <span className="mode-start">Start <ArrowRight size={17} /></span>
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
      {mode === 'match' && <Match pack={pack} onAward={onAward} onFinish={onFinish} />}
      {mode === 'quiz' && <Quiz pack={pack} onAward={onAward} onFinish={onFinish} />}
      {mode === 'builder' && <Builder pack={pack} onAward={onAward} onFinish={onFinish} />}
      {mode === 'vocab' && <Vocabulary pack={pack} onAward={onAward} onFinish={onFinish} />}
      {mode === 'scene' && <Scene pack={pack} onAward={onAward} onFinish={onFinish} />}
    </div>
  )
}

function ProgressBar({ current, total }) { return <div className="lesson-progress"><span style={{ width: `${(current / total) * 100}%` }} /></div> }

function Cards({ pack, onAward, onFinish }) {
  const [index, setIndex] = useState(0); const [flipped, setFlipped] = useState(false)
  const items = useMemo(() => shuffle(pack.words), [pack])
  const word = items[index]
  const reversed = index % 2 === 1
  const next = () => { onAward(); if (index === pack.words.length - 1) onFinish(); else { setIndex(index + 1); setFlipped(false) } }
  return <ExerciseFrame kicker="MAKE IT STICK" title="Say it before you reveal it" current={index + 1} total={pack.words.length}>
    <div className={`flashcard ${flipped ? 'flipped' : ''}`} role="button" tabIndex={0} onClick={() => setFlipped(!flipped)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setFlipped(!flipped) }}>
      <span className="card-label">{flipped ? (reversed ? 'SPANISH & CONTEXT' : 'MEANING & CONTEXT') : (reversed ? 'ENGLISH → SPANISH' : 'SPANISH → ENGLISH')}</span>
      <h2>{flipped ? (reversed ? word.es : word.en) : (reversed ? word.en : word.es)}</h2>
      {flipped ? <p>“{word.example}”</p> : <span className="flip-hint"><RotateCcw size={17} /> Recall it, then reveal</span>}
      <button className="audio-button" onClick={(e) => { e.stopPropagation(); speechSynthesis?.speak(new SpeechSynthesisUtterance(word.es)) }}><Volume2 /></button>
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
      ? { prompt: `Choose the Spanish for “${word.en}”`, options: makeOptions(word.es, words.map((item) => item.es)), answer: word.es }
      : { prompt: `What does “${word.es}” mean?`, options: makeOptions(word.en, words.map((item) => item.en)), answer: word.en }
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
      <div>{batch.map((item) => <button key={item.es} disabled={matched.includes(item.es)} className={leftPick?.es === item.es ? 'selected' : ''} onClick={() => pickLeft(item)}>{item.es}</button>)}</div>
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
  const next = () => { if (correct) onAward(); if (index === items.length - 1) onFinish(); else { setIndex(index + 1); setPicked(null) } }
  return <ExerciseFrame kicker="TWO-WAY QUIZ" title={item.prompt} current={index + 1} total={items.length}>
    <div className="options">{item.options.map((option, i) => <button key={option} className={`${picked ? (option === item.answer ? 'right' : option === picked ? 'wrong' : '') : ''}`} onClick={() => setPicked(option)}><span>{String.fromCharCode(65 + i)}</span>{option}</button>)}</div>
    {picked && <div className={`feedback ${correct ? 'positive' : 'negative'}`}><b>{correct ? '¡Muy bien!' : 'Not quite yet.'}</b><p>{correct ? 'That is the natural answer.' : `The answer is “${item.answer}”. Say it once out loud.`}</p></div>}
    <button className="primary lesson-next" disabled={!picked} onClick={next}>{index === items.length - 1 ? 'Finish' : 'Next'} <ArrowRight size={18} /></button>
  </ExerciseFrame>
}

function Builder({ pack, onAward, onFinish }) {
  const [index, setIndex] = useState(0); const [chosen, setChosen] = useState([]); const [checked, setChecked] = useState(false)
  const items = useMemo(() => pack.generatedBuilder ? shuffle(pack.words).map((word) => ({ translation: word.en, answer: word.es.split(' ') })) : pack.builder, [pack])
  const item = items[index]; const shuffled = useMemo(() => shuffle(item.answer), [item]); const correct = chosen.join(' ') === item.answer.join(' ')
  const next = () => { if (correct) onAward(); if (index === items.length - 1) onFinish(); else { setIndex(index + 1); setChosen([]); setChecked(false) } }
  return <ExerciseFrame kicker="SENTENCE LAB" title={item.translation} current={index + 1} total={items.length}>
    <div className={`sentence-drop ${checked ? correct ? 'right' : 'wrong' : ''}`}>{chosen.length ? chosen.map((word, i) => <button key={`${word}-${i}`} onClick={() => !checked && setChosen(chosen.filter((_, n) => n !== i))}>{word}</button>) : <span>Build the sentence here…</span>}</div>
    <div className="word-bank">{shuffled.map((word, i) => { const used = chosen.filter((x) => x === word).length >= shuffled.slice(0, i + 1).filter((x) => x === word).length; return <button key={`${word}-${i}`} disabled={used || checked} onClick={() => setChosen([...chosen, word])}>{word}</button> })}</div>
    {checked && !correct && <div className="feedback negative"><b>Almost—look at the word order.</b><p>{item.answer.join(' ')}</p></div>}
    {!checked ? <button className="primary lesson-next" disabled={!chosen.length} onClick={() => setChecked(true)}>Check sentence <Check size={18} /></button> : <button className="primary lesson-next" onClick={next}>{index === items.length - 1 ? 'Finish' : 'Next'} <ArrowRight size={18} /></button>}
  </ExerciseFrame>
}

function Vocabulary({ pack, onAward, onFinish }) {
  const vocabPack = useMemo(() => ({ ...pack, words: pack.vocabulary, generatedQuiz: true }), [pack])
  return <Quiz pack={vocabPack} onAward={onAward} onFinish={onFinish} />
}

function Scene({ pack, onAward, onFinish }) {
  const [picked, setPicked] = useState(null); const reply = pack.scene.replies.find((r) => r.text === picked)
  return <ExerciseFrame kicker="REAL-LIFE SCENE" title={pack.scene.place} current={picked ? 1 : 0} total={1}>
    <div className="dialogue"><div className="speaker-avatar">{pack.scene.speaker[0]}</div><div><span>{pack.scene.speaker}</span><p>{pack.scene.line}</p></div></div>
    <div className="culture-note"><Sparkles size={18} /><p>{pack.scene.note}</p></div>
    <h3 className="your-turn">What would you say?</h3>
    <div className="options scene-options">{pack.scene.replies.map((r, i) => <button key={r.text} className={picked ? r.correct ? 'right' : picked === r.text ? 'wrong' : '' : ''} onClick={() => setPicked(r.text)}><span>{i + 1}</span>{r.text}</button>)}</div>
    {reply && <div className={`feedback ${reply.correct ? 'positive' : 'negative'}`}><b>{reply.correct ? 'Natural choice!' : 'A memorable choice.'}</b><p>{reply.feedback}</p></div>}
    <button className="primary lesson-next" disabled={!picked} onClick={() => { if (reply.correct) onAward(); onFinish() }}>Finish scene <ArrowRight size={18} /></button>
  </ExerciseFrame>
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
