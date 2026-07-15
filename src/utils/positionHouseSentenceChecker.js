import { normalizeJoseSentence } from './joseSentenceChecker.js'

const text = (language, ru, en) => language === 'ru' ? ru : en

const positionPatterns = [
  'a la izquierda de', 'a la derecha de', 'encima de', 'debajo de', 'delante de', 'detrás de', 'arriba', 'abajo',
]

const singularSubjects = [
  'la mesa', 'la silla', 'la cama', 'la casa', 'la mochila', 'la televisión', 'la gaveta', 'la puerta', 'la ventana',
  'el sofá', 'el ordenador', 'el libro', 'el teléfono', 'el cajón', 'el armario', 'mi casa', 'mi mesa', 'mi cama', 'mi sofá',
]
const pluralSubjects = ['las mesas', 'las sillas', 'las camas', 'las ventanas', 'los libros', 'los teléfonos', 'los cajones']
const targetPhrases = [...singularSubjects, ...pluralSubjects, 'tu ordenador', 'tu mochila', 'tu teléfono']

function hasInternalSentenceBreak(value) {
  return /[.!?]\s*\S/.test(value.trim().replace(/[.!?]+$/, ''))
}

export function extractPositionExpressions(value) {
  const normalized = normalizeJoseSentence(value).replace(/\bdel\b/g, 'de el')
  return positionPatterns.filter((position) => normalized.includes(position))
}

function parseRelation(segment, language) {
  if (segment === 'arriba' || segment === 'abajo') return { correct: true, position: segment, target: '' }
  const position = positionPatterns.find((candidate) => segment.startsWith(`${candidate} `))
  if (!position) return { correct: false, reason: text(language, 'Каждая часть после está должна начинаться с позиции: arriba, abajo, encima de, debajo de, delante de, detrás de, a la izquierda de или a la derecha de.', 'Each part after está must begin with a position: arriba, abajo, encima de, debajo de, delante de, detrás de, a la izquierda de or a la derecha de.') }
  const target = segment.slice(position.length + 1).trim()
  if (!targetPhrases.includes(target)) return { correct: false, reason: text(language, `После «${position}» назови предмет с правильным артиклем: la mesa, el sofá, mi cama, el cajón…`, `After “${position}”, name an object with the correct article: la mesa, el sofá, mi cama, el cajón…`) }
  return { correct: true, position, target }
}

export function checkPositionHouseSentence(value, existingSentences = [], language = 'ru') {
  const raw = value.trim()
  if (!raw) return { correct: false, reason: text(language, 'Сначала напиши одно предложение о доме.', 'Write one sentence about your home first.') }
  if (hasInternalSentenceBreak(raw)) return { correct: false, reason: text(language, 'Отправляй по одному предложению. Внутри него можно соединить две позиции через y.', 'Submit one sentence at a time. Inside it, you may connect two positions with y.') }

  const normalized = normalizeJoseSentence(raw)
  const accentMap = { esta: 'está', estan: 'están', detras: 'detrás', telefono: 'teléfono', sofa: 'sofá', television: 'televisión', cajon: 'cajón', aqui: 'aquí', alli: 'allí' }
  const missingAccents = normalized.split(' ').filter((word) => accentMap[word]).map((word) => accentMap[word])
  if (missingAccents.length) return { correct: false, reason: text(language, `Проверь письменное ударение: нужно ${[...new Set(missingAccents)].join(', ')}.`, `Check the written accent: use ${[...new Set(missingAccents)].join(', ')}.`) }
  if (/\bde el\b/.test(normalized)) return { correct: false, reason: text(language, 'De + el обязательно сливаются: del sofá, del cajón, del ordenador.', 'De + el must contract: del sofá, del cajón, del ordenador.') }

  const duplicate = existingSentences.some((sentence) => normalizeJoseSentence(sentence) === normalized)
  if (duplicate) return { correct: true, counted: false, duplicate: true, reason: text(language, 'Предложение правильное, но оно уже есть в списке. Напиши другое.', 'The sentence is correct, but it is already in the list. Write a different one.') }

  const parseable = normalized.replace(/^en mi casa\s+/, '').replace(/\bdel\b/g, 'de el')
  const verbMatch = parseable.match(/^(.*?)\s+(está|están)\s+(.+)$/)
  if (!verbMatch) return { correct: false, reason: text(language, 'Используй схему «предмет + está + позиция»: La mesa está delante de la ventana.', 'Use “object + está + position”: La mesa está delante de la ventana.') }
  const [, subject, verb, relationText] = verbMatch
  const isSingular = singularSubjects.includes(subject)
  const isPlural = pluralSubjects.includes(subject)
  if (!isSingular && !isPlural) return { correct: false, reason: text(language, 'Начни с предмета дома: la mesa, el sofá, la cama, mi casa, los libros…', 'Begin with an object in the home: la mesa, el sofá, la cama, mi casa, los libros…') }
  if (isSingular && verb !== 'está') return { correct: false, reason: text(language, `«${subject}» — единственное число, поэтому нужно está.`, `“${subject}” is singular, so use está.`) }
  if (isPlural && verb !== 'están') return { correct: false, reason: text(language, `«${subject}» — множественное число, поэтому нужно están.`, `“${subject}” is plural, so use están.`) }

  const relationSegments = relationText.split(/\s+y\s+/)
  if (relationSegments.length < 2) return { correct: false, validSentence: true, reason: text(language, 'Грамматика основы верная, но для этого задания добавь вторую позицию через y: …encima de la mesa y a la izquierda del sofá.', 'The base grammar is correct, but this task needs a second position joined with y: …encima de la mesa y a la izquierda del sofá.') }
  if (relationSegments.length > 3) return { correct: false, reason: text(language, 'Оставь две или три ясные позиции в одном предложении — так его будет легче прочитать Хосе.', 'Keep two or three clear positions in one sentence so it is easy to read to José.') }
  const parsedRelations = relationSegments.map((segment) => parseRelation(segment, language))
  const failed = parsedRelations.find((result) => !result.correct)
  if (failed) return failed

  const positions = [...new Set(parsedRelations.map((result) => result.position))]
  if (positions.length < 2) return { correct: true, counted: false, reason: text(language, 'Предложение грамматически правильное, но одна позиция повторяется. Используй две разные конструкции.', 'The sentence is grammatically correct, but one position is repeated. Use two different position expressions.') }

  const usedBefore = new Set(existingSentences.flatMap(extractPositionExpressions))
  const combined = new Set([...usedBefore, ...positions])
  if (existingSentences.length === 1 && combined.size < 4) {
    const newPositions = positions.filter((position) => !usedBefore.has(position))
    return { correct: true, counted: false, reason: text(language, `Предложение правильное, но итог пока даёт только ${combined.size} разные позиции. Во втором предложении используй две новые конструкции; новых сейчас: ${newPositions.length}.`, `The sentence is correct, but the total currently has only ${combined.size} different positions. Use two new expressions in the second sentence; new ones here: ${newPositions.length}.`) }
  }

  const agreement = isSingular ? 'está' : 'están'
  return { correct: true, counted: true, positions, reason: text(language, `Правильно: «${subject}» согласовано с ${agreement}, позиционные конструкции оформлены полностью, а y естественно соединяет описания.`, `Correct: “${subject}” agrees with ${agreement}, the position expressions are complete, and y naturally connects the descriptions.`) }
}
