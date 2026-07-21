import { normalizeJoseSentence } from './joseSentenceChecker.js'

const text = (language, ru, en) => language === 'ru' ? ru : en

const targetForms = {
  abrir: ['abro', 'abres', 'abre', 'abrimos', 'abrís', 'abren'],
  aprender: ['aprendo', 'aprendes', 'aprende', 'aprendemos', 'aprendéis', 'aprenden'],
  cambiar: ['cambio', 'cambias', 'cambia', 'cambiamos', 'cambiáis', 'cambian'],
  conocer: ['conozco', 'conoces', 'conoce', 'conocemos', 'conocéis', 'conocen'],
  creer: ['creo', 'crees', 'cree', 'creemos', 'creéis', 'creen'],
  decir: ['digo', 'dices', 'dice', 'decimos', 'decís', 'dicen'],
  empezar: ['empiezo', 'empiezas', 'empieza', 'empezamos', 'empezáis', 'empiezan'],
  hacer: ['hago', 'haces', 'hace', 'hacemos', 'hacéis', 'hacen'],
  llegar: ['llego', 'llegas', 'llega', 'llegamos', 'llegáis', 'llegan', 'llegaré'],
  trabajar: ['trabajo', 'trabajas', 'trabaja', 'trabajamos', 'trabajáis', 'trabajan'],
}

const subjectForms = {
  yo: ['abro', 'aprendo', 'cambio', 'conozco', 'creo', 'digo', 'empiezo', 'hago', 'llego', 'llegaré', 'trabajo', 'quiero', 'estoy'],
  tú: ['abres', 'aprendes', 'cambias', 'conoces', 'crees', 'dices', 'empiezas', 'haces', 'llegas', 'trabajas', 'quieres', 'estás'],
  nosotros: ['abrimos', 'aprendemos', 'cambiamos', 'conocemos', 'creemos', 'decimos', 'empezamos', 'hacemos', 'llegamos', 'trabajamos', 'queremos', 'estamos'],
  vosotros: ['abrís', 'aprendéis', 'cambiáis', 'conocéis', 'creéis', 'decís', 'empezáis', 'hacéis', 'llegáis', 'trabajáis', 'queréis', 'estáis'],
}

const formToLemma = Object.fromEntries(
  Object.entries(targetForms).flatMap(([lemma, forms]) => forms.map((form) => [form, lemma])),
)

const targetInfinitives = Object.keys(targetForms)
const finiteHelpers = ['quiero', 'quieres', 'quiere', 'queremos', 'queréis', 'quieren', 'estoy', 'estás', 'está', 'estamos', 'estáis', 'están']
const allFiniteForms = [...Object.keys(formToLemma), ...finiteHelpers]

function hasInternalSentenceBreak(value) {
  return /[.!?]\s*\S/.test(value.trim().replace(/[.!?]+$/, ''))
}

export function extractLearningChangeVerbs(value) {
  const words = normalizeJoseSentence(value).split(' ')
  return [...new Set(words.flatMap((word) => {
    if (formToLemma[word]) return [formToLemma[word]]
    if (targetInfinitives.includes(word)) return [word]
    if (word === 'empezando') return ['empezar']
    return []
  }))]
}

function agreementError(words, language) {
  const subject = words.find((word) => Object.keys(subjectForms).includes(word))
  if (!subject) return null
  const finite = words.find((word) => allFiniteForms.includes(word))
  if (!finite || subjectForms[subject].includes(finite)) return null
  const lemma = formToLemma[finite]
  const suggestion = lemma
    ? targetForms[lemma][{ yo: 0, tú: 1, nosotros: 3, vosotros: 4 }[subject]]
    : null
  return text(
    language,
    `«${finite}» не согласуется с ${subject}. Используй ${suggestion || `форму для ${subject}`}.`,
    `“${finite}” does not agree with ${subject}. Use ${suggestion || `the ${subject} form`}.`,
  )
}

function validLessonSentence(normalized, language) {
  const s = normalized.replace(/^(yo|tú|nosotros|vosotros)\s+/, '')

  if (/^qué (aprendes|aprende|aprendéis|aprenden)$/.test(s)) return text(language, 'Qué с ударением задаёт вопрос, а форма aprender согласована с собеседником.', 'Qué introduces the question, and the form of aprender agrees with the person addressed.')
  if (/^a quién (quieres|quiere|queréis|quieren) conocer$/.test(s)) return text(language, 'В вопросе о человеке нужны личное a и quién с ударением; после querer остаётся инфинитив conocer.', 'A question about a person needs personal a and accented quién; conocer stays infinitive after querer.')
  if (/^cuándo (llegas|llega|llegáis|llegan|llegamos)$/.test(s)) return text(language, 'Cuándo с ударением задаёт вопрос, а llegar стоит в личной форме.', 'Cuándo introduces the question, and llegar is in a personal form.')
  if (/^cómo se dice (.+ )?en español$/.test(s)) return text(language, 'Устойчивая конструкция «¿Cómo se dice…?» оформлена правильно: cómo имеет ударение, а dice употребляется с se.', 'The fixed pattern “¿Cómo se dice…?” is correct: cómo takes an accent and dice is used with se.')
  if (/^qué (haces|hace|hacéis|hacen|hacemos)( ahora)?$/.test(s)) return text(language, 'Qué с ударением вводит вопрос; форма hacer выбрана правильно.', 'Qué introduces the question, and the form of hacer is correct.')

  if (/^(estoy|estás|está|estamos|estáis|están) empezando (la clase|el máster)( ahora| en barcelona)?$/.test(s)) return text(language, 'Estar + empezando правильно описывает действие, которое уже начинается; в герундии нет изменения e→ie.', 'Estar + empezando correctly describes an action already in progress; the gerund has no e→ie stem change.')

  if (/^(quiero|quieres|quiere|queremos|queréis|quieren) (abrir|aprender|cambiar|conocer|decir|empezar|hacer|llegar|trabajar)(\s+.+)?$/.test(s)) {
    return text(language, 'После querer второй глагол правильно остаётся в инфинитиве; дополнение завершает мысль.', 'After querer, the second verb correctly stays in the infinitive, and the complement completes the idea.')
  }

  if (/^(aprendo|aprendes|aprende|aprendemos|aprendéis|aprenden) (español|más|mucho|algo nuevo|en la clase)$/.test(s)) return text(language, 'Aprender стоит в личной форме; дополнение употреблено естественно.', 'Aprender is conjugated for a person, and the complement is natural.')
  if (/^(empiezo|empiezas|empieza|empezamos|empezáis|empiezan) (la clase|el máster|el trabajo|la tarea)( ahora| en barcelona| mañana)?$/.test(s)) return text(language, 'Форма empezar согласована правильно. В ударных формах появляется e→ie, а у nosotros/vosotros остаётся empez-.', 'The form of empezar agrees correctly. Stressed forms use e→ie, while nosotros/vosotros keep empez-.')
  if (/^(me |te |se |nos |os )?(cambio|cambias|cambia|cambiamos|cambiáis|cambian) (de ciudad|de casa|de ropa|mi horario|el horario|mi sombrero|el sombrero|la hora)$/.test(s)) return text(language, 'Форма cambiar согласована. Для одежды «me cambio de ropa / me cambio el sombrero» показывает, что переодеваешься ты сам.', 'Cambiar agrees correctly. With clothing, “me cambio de ropa / me cambio el sombrero” shows that you are changing what you wear.')
  if (/^(digo|dices|dice|decimos|decís|dicen) (algo|gracias|la verdad|que .+)$/.test(s)) return text(language, 'Decir употреблён в личной форме и имеет ясное содержание сообщения.', 'Decir is conjugated for a person and has a clear message as its complement.')
  if (/^(creo|crees|cree|creemos|creéis|creen) que .+$/.test(s)) return text(language, 'После creer правильно используется que и полная мысль: «считаю, что…».', 'Creer is correctly followed by que and a complete idea: “I believe that…”.')
  if (/^(conozco|conoces|conoce|conocemos|conocéis|conocen) (barcelona|madrid|españa|la ciudad|este lugar|a (una|otra|esta) persona( nueva)?|a [a-záéíóúüñ]+)$/.test(s)) return text(language, 'Conocer стоит в личной форме; перед конкретным человеком правильно используется личное a, а перед местом оно не нужно.', 'Conocer is conjugated correctly; personal a is used before a person and omitted before a place.')
  if (/^(llego|llegas|llega|llegamos|llegáis|llegan|llegaré) ((a|al) (casa|barcelona|madrid|la clase|la universidad|el trabajo)|mañana|ahora|tarde)( mañana| ahora| tarde)?$/.test(s)) return text(language, 'Llegar стоит в личной форме; направление вводится через a/al, а время добавлено естественно.', 'Llegar is conjugated; a/al introduces the destination, and the time expression is placed naturally.')
  if (/^(abro|abres|abre|abrimos|abrís|abren) (la puerta|el ordenador|la ventana|el libro|mi ordenador|mi libro|mi mochila)$/.test(s)) return text(language, 'Abrir согласован правильно, а артикль или притяжательное слово подходит к предмету.', 'Abrir agrees correctly, and the article or possessive matches the object.')
  if (/^(hago|haces|hace|hacemos|hacéis|hacen) (la tarea|ejercicio|café|el trabajo|mucho|algo)( ahora)?$/.test(s)) return text(language, 'Hacer употреблён в правильной личной форме; дополнение образует естественное выражение.', 'Hacer is in the correct personal form, and the complement forms a natural expression.')
  if (/^(trabajo|trabajas|trabaja|trabajamos|trabajáis|trabajan)( mucho| aquí| allí| en españa| en barcelona| durante el día| ahora)+$/.test(s)) return text(language, 'Trabajar согласован правильно, а место, время или mucho естественно дополняют фразу.', 'Trabajar agrees correctly, and the place, time or mucho naturally completes the sentence.')

  return null
}

function validOpenLessonSentence(normalized, language) {
  const words = normalized.replace(/^(yo|tú|nosotros|vosotros|él|ella|ellos|ellas)\s+/, '').split(' ')
  const verbIndex = words.findIndex((word) => formToLemma[word])
  if (verbIndex < 0) return null
  const prefix = words.slice(0, verbIndex)
  if (prefix.some((word) => !['no', 'ahora', 'hoy', 'siempre', 'también'].includes(word))) return null
  const form = words[verbIndex]
  const lemma = formToLemma[form]
  const tail = words.slice(verbIndex + 1)
  const joined = tail.join(' ')

  if (tail.some((word) => targetInfinitives.includes(word))) return null
  if (lemma === 'llegar' && joined && !/^(a |al |mañana$|ahora$|hoy$|tarde$|pronto$)/.test(joined)) return null
  if (lemma === 'conocer' && /^(un|una|el|la) (hombre|mujer|persona|profesor|profesora|estudiante|amigo|amiga)\b/.test(joined)) return null
  if (lemma === 'creer' && joined && !/^(que|en)\s+/.test(joined)) return null
  if (lemma === 'abrir' && joined && !/^(el|la|los|las|un|una|mi|mis|tu|tus|su|sus)\s+/.test(joined)) return null
  if (lemma === 'cambiar' && joined && !/^(de|el|la|los|las|un|una|mi|mis|tu|tus|su|sus)\s+/.test(joined)) return null
  if (!joined && !['trabajar', 'llegar'].includes(lemma)) return null

  return text(
    language,
    `Форма ${form} правильно спрягает ${lemma}; порядок слов и дополнение образуют полноценную фразу.`,
    `${form} correctly conjugates ${lemma}; the word order and complement form a complete sentence.`,
  )
}

export function checkLearningChangesSentence(value, existingSentences = [], language = 'ru') {
  const raw = value.trim()
  if (!raw) return { correct: false, reason: text(language, 'Сначала напиши одно предложение.', 'Write one sentence first.') }
  if (hasInternalSentenceBreak(raw)) return { correct: false, reason: text(language, 'Отправляй по одному предложению, чтобы каждое получило отдельную проверку и объяснение.', 'Submit one sentence at a time so each receives its own check and explanation.') }

  const normalized = normalizeJoseSentence(raw)
  const accentMap = { espanol: 'español', leccion: 'lección', 'leccíon': 'lección', master: 'máster', mas: 'más', quien: 'quién', cuando: 'cuándo', como: 'cómo', que: 'qué', barcelona: null }
  const questionStart = /^[¿]?\s*(a\s+)?(que|quien|cuando|como)\b/i.test(raw)
  const missing = normalized.split(' ').flatMap((word, index) => {
    const correction = accentMap[word]
    if (!correction) return []
    if (['quien', 'cuando', 'como', 'que'].includes(word) && !questionStart) return []
    if (word === 'mas' && !/aprender mas/.test(normalized)) return []
    return [correction]
  })
  if (missing.length) return { correct: false, reason: text(language, `Проверь письменное ударение: нужно ${[...new Set(missing)].join(', ')}.`, `Check the written accent: use ${[...new Set(missing)].join(', ')}.`) }

  const agreement = agreementError(normalized.split(' '), language)
  if (agreement) return { correct: false, reason: agreement }
  if (/\b(conozco|conoces|conoce|conocemos|conocéis|conocen) (una|un|esta|otra) persona\b/.test(normalized)) return { correct: false, reason: text(language, 'Перед человеком с conocer нужно личное a: «Conozco a una persona nueva».', 'Conocer needs personal a before a person: “Conozco a una persona nueva”.') }
  if (/\b(llego|llegas|llega|llegamos|llegáis|llegan|llegaré) (casa|barcelona|madrid|la clase|la universidad|el trabajo)\b/.test(normalized)) return { correct: false, reason: text(language, 'Направление после llegar вводится через a: «Llego a casa», «Llego a Barcelona».', 'A destination after llegar needs a: “Llego a casa”, “Llego a Barcelona”.') }
  if (/\b(abro|abres|abre|abrimos|abrís|abren) el puerta\b/.test(normalized)) return { correct: false, reason: text(language, 'Puerta — женского рода: «Abro la puerta».', 'Puerta is feminine: “Abro la puerta”.') }

  const finite = normalized.split(' ').some((word) => allFiniteForms.includes(word))
  const bareInfinitive = normalized.split(' ').find((word) => targetInfinitives.includes(word))
  if (!finite && bareInfinitive) return { correct: false, reason: text(language, `«${bareInfinitive}» — инфинитив. Для самостоятельного предложения нужна личная форма, например ${targetForms[bareInfinitive][0]}.`, `“${bareInfinitive}” is an infinitive. A standalone sentence needs a personal form, such as ${targetForms[bareInfinitive][0]}.`) }

  const compoundParts = normalized.split(/\s+y\s+/)
  const isCompound = compoundParts.length > 1 && compoundParts.every((part) => part.split(' ').some((word) => formToLemma[word]))
  let reason
  let compoundFailure = null
  if (isCompound) {
    const partResults = compoundParts.map((part) => {
      const partAgreement = agreementError(part.split(' '), language)
      if (partAgreement) return { correct: false, reason: partAgreement }
      const partReason = validLessonSentence(part, language) || validOpenLessonSentence(part, language)
      return partReason ? { correct: true, reason: partReason } : { correct: false, reason: null }
    })
    compoundFailure = partResults.find((result) => !result.correct)
    if (!compoundFailure) reason = text(language, `Y правильно соединяет ${compoundParts.length} самостоятельные части; формы глаголов и дополнения в каждой части проверены.`, `Y correctly joins ${compoundParts.length} complete clauses; the verb forms and complements in each clause are valid.`)
  } else {
    reason = validLessonSentence(normalized, language) || validOpenLessonSentence(normalized, language)
  }
  if (compoundFailure?.reason) return { correct: false, reason: compoundFailure.reason }
  if (!reason) return { correct: false, reason: text(language, 'Фраза пока не совпадает с изученными конструкциями. Проверь личную форму глагола, нужный предлог, артикль и дополнение. Например: «Quiero aprender más» или «Llego a casa mañana».', 'The sentence does not yet match the lesson patterns. Check the personal verb form, preposition, article and complement. For example: “Quiero aprender más” or “Llego a casa mañana”.') }

  if (existingSentences.some((sentence) => normalizeJoseSentence(sentence) === normalized)) return { correct: true, counted: false, duplicate: true, reason: text(language, 'Предложение правильное, но уже засчитано. Напиши другое с новым глаголом.', 'The sentence is correct, but it has already been counted. Write another one with a new verb.') }

  const verbs = extractLearningChangeVerbs(normalized)
  const usedBefore = new Set(existingSentences.flatMap(extractLearningChangeVerbs))
  const newVerbs = verbs.filter((verb) => !usedBefore.has(verb))
  if (!newVerbs.length) return { correct: true, counted: false, reason: text(language, `Грамматически правильно, но все глаголы этой фразы уже использованы: ${verbs.join(', ')}. Для зачёта выбери новый глагол из урока.`, `Grammatically correct, but every target verb here was already used: ${verbs.join(', ')}. Use a new lesson verb for this sentence to count.`) }

  return { correct: true, counted: true, verbs, reason: `${reason} ${text(language, `Новый глагол для итогового набора: ${newVerbs.join(', ')}.`, `New verb for the final set: ${newVerbs.join(', ')}.`)}` }
}
