import { sixtyPhrasesPack } from './sixtyPhrases.js'
import { serEstarPack } from './serEstar.js'
import { joseSentenceLesson } from './joseSentenceLesson.js'
import { joseCoreVerbsLesson } from './joseCoreVerbsLesson.js'
import { joseActionsPositionsLesson } from './joseActionsPositionsLesson.js'
import { joseLearningChangesLesson } from './joseLearningChangesLesson.js'
import { hareLoQuePuedaSongLesson } from './hareLoQuePuedaSongLesson.js'

// Add future material here. The exercise engine reads the same shape for every pack.
export const starterPacks = [
  hareLoQuePuedaSongLesson,
  joseLearningChangesLesson,
  joseActionsPositionsLesson,
  joseCoreVerbsLesson,
  joseSentenceLesson,
  {
    id: 'barcelona-first-week',
    title: 'Your first week in Barcelona',
    eyebrow: 'Survival Spanish · A0',
    description: 'Order coffee, ask for prices and handle tiny everyday conversations.',
    accent: 'coral',
    minutes: 18,
    icon: 'Coffee',
    words: [
      { es: 'quisiera', en: 'I would like', example: 'Quisiera un café con leche, por favor.' },
      { es: 'cuánto cuesta', en: 'how much does it cost', example: '¿Cuánto cuesta esto?' },
      { es: 'para llevar', en: 'to take away', example: 'Un café para llevar.' },
      { es: 'la cuenta', en: 'the bill', example: 'La cuenta, por favor.' },
      { es: 'perdona', en: 'excuse me / sorry', example: 'Perdona, ¿hablas inglés?' },
      { es: 'vale', en: 'okay / sounds good', example: 'Vale, perfecto.' },
    ],
    quiz: [
      { prompt: 'How do you politely say “I would like a coffee”?', options: ['Quiero café', 'Quisiera un café', 'Tengo un café'], answer: 'Quisiera un café' },
      { prompt: 'What does “para llevar” mean?', options: ['For here', 'To take away', 'The bill'], answer: 'To take away' },
      { prompt: 'Choose the natural phrase for asking the price.', options: ['¿Dónde cuesta?', '¿Qué cuesta tú?', '¿Cuánto cuesta?'], answer: '¿Cuánto cuesta?' },
    ],
    builder: [
      { translation: 'I would like a coffee with milk, please.', answer: ['Quisiera', 'un', 'café', 'con', 'leche,', 'por', 'favor.'] },
      { translation: 'Excuse me, how much does this cost?', answer: ['Perdona,', '¿cuánto', 'cuesta', 'esto?'] },
    ],
    scene: {
      place: 'A small café in Gràcia',
      speaker: 'Camarero',
      line: 'Hola, buenas. ¿Qué te pongo?',
      note: '“¿Qué te pongo?” is a very common way to ask what you want to order.',
      replies: [
        { text: 'Quisiera un café con leche, por favor.', feedback: 'Perfecto. Polite, natural and useful everywhere.', correct: true },
        { text: 'Soy un café con leche.', feedback: 'That means “I am a coffee with milk.” Charming, but alarming.', correct: false },
        { text: '¿Dónde está Barcelona?', feedback: 'Grammatically possible, but your waiter may need a moment.', correct: false },
      ],
    },
  },
  sixtyPhrasesPack,
  serEstarPack,
  {
    id: 'meet-people',
    title: 'Meet people without sounding robotic',
    eyebrow: 'Conversation · A0–A1',
    description: 'Introduce yourself, ask follow-ups and keep a first conversation alive.',
    accent: 'blue',
    minutes: 14,
    icon: 'MessagesSquare',
    words: [
      { es: 'me llamo', en: 'my name is', example: 'Me llamo Illia.' },
      { es: 'soy de', en: 'I am from', example: 'Soy de Ucrania.' },
      { es: 'vivo en', en: 'I live in', example: 'Vivo en Barcelona.' },
      { es: '¿a qué te dedicas?', en: 'what do you do?', example: '¿A qué te dedicas?' },
    ],
    quiz: [
      { prompt: 'Which phrase asks what somebody does?', options: ['¿Dónde te llamas?', '¿A qué te dedicas?', '¿Cuánto vives?'], answer: '¿A qué te dedicas?' },
    ],
    builder: [
      { translation: 'I live in Barcelona and I study architecture.', answer: ['Vivo', 'en', 'Barcelona', 'y', 'estudio', 'arquitectura.'] },
    ],
    scene: {
      place: 'University welcome event',
      speaker: 'Marta',
      line: '¡Hola! ¿Eres nuevo aquí?',
      note: 'Use “nuevo” if you identify as male and “nueva” if you identify as female.',
      replies: [
        { text: 'Sí, acabo de llegar. Me llamo Illia.', feedback: 'Natural and friendly. Now ask her name back!', correct: true },
        { text: 'Sí, eres nuevo.', feedback: 'You just told Marta that she is new.', correct: false },
      ],
    },
  },
  {
    id: 'meme-break',
    title: 'Emosido engañado',
    eyebrow: 'Culture break · Meme',
    description: 'Learn why a misspelled phrase became immortal Spanish internet culture.',
    accent: 'yellow',
    minutes: 6,
    icon: 'Sparkles',
    words: [
      { es: 'hemos sido engañados', en: 'we have been deceived', example: 'La forma correcta es: hemos sido engañados.' },
      { es: 'engaño', en: 'deception / scam', example: 'Todo fue un engaño.' },
    ],
    quiz: [
      { prompt: 'Which is the grammatically correct version?', options: ['Emosido engañado', 'Hemos sido engañados', 'Hemos ser engaño'], answer: 'Hemos sido engañados' },
    ],
    builder: [
      { translation: 'We have been deceived.', answer: ['Hemos', 'sido', 'engañados.'] },
    ],
    scene: {
      place: 'Spanish group chat',
      speaker: 'Dani',
      line: 'El tráiler era mejor que la película 😭',
      note: 'This is the perfect habitat for “Emosido engañado”.',
      replies: [
        { text: 'Emosido engañado.', feedback: 'Culturally perfect. Grammatically criminal. Exactly the point.', correct: true },
        { text: 'La cuenta, por favor.', feedback: 'A bold attempt to leave the group chat.', correct: false },
      ],
    },
  },
]
