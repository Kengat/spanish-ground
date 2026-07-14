import { normalizeJoseSentence } from './joseSentenceChecker.js'

const text = (language, ru, en) => language === 'ru' ? ru : en

const forms = {
  tengo: ['tener', 'yo'], tienes: ['tener', 'tú'],
  quiero: ['querer', 'yo'], quieres: ['querer', 'tú'],
  puedo: ['poder', 'yo'], puedes: ['poder', 'tú'],
  hago: ['hacer', 'yo'], haces: ['hacer', 'tú'],
  voy: ['ir', 'yo'], vas: ['ir', 'tú'], iré: ['ir-future', 'yo'],
  vengo: ['venir', 'yo'], vienes: ['venir', 'tú'], ven: ['venir-command', 'tú'],
  estoy: ['estar', 'yo'], estás: ['estar', 'tú'],
  soy: ['ser', 'yo'], eres: ['ser', 'tú'],
  estudio: ['estudiar', 'yo'], estudias: ['estudiar', 'tú'],
  trabajo: ['trabajar', 'yo'], trabajas: ['trabajar', 'tú'],
  vivo: ['vivir', 'yo'], vives: ['vivir', 'tú'],
  vuelvo: ['volver', 'yo'], vuelves: ['volver', 'tú'],
  entiendo: ['entender', 'yo'], entiendes: ['entender', 'tú'],
  veo: ['ver', 'yo'], ves: ['ver', 'tú'],
}

const firstPerson = Object.entries(forms).filter(([, value]) => value[1] === 'yo').map(([form]) => form)
const secondPerson = Object.entries(forms).filter(([, value]) => value[1] === 'tú').map(([form]) => form)
const infinitives = ['tener', 'querer', 'poder', 'hacer', 'ir', 'venir', 'estar', 'ser', 'estudiar', 'trabajar', 'vivir', 'volver', 'entender', 'ver', 'aprender', 'amar']

function hasInternalSentenceBreak(value) {
  return /[.!?]\s*\S/.test(value.trim().replace(/[.!?]+$/, ''))
}

function validPrefix(prefix) {
  const patterns = [
    '', 'yo', 'tú', 'ahora', 'yo ahora', 'tú ahora', 'ahora yo', 'ahora tú', 'no',
    'yo no', 'tú no', 'ahora no', 'ahora yo no', 'ahora tú no', 'yo ahora no', 'tú ahora no',
  ]
  return patterns.includes(prefix.join(' '))
}

function validateInfinitivePhrase(tokens) {
  const joined = tokens.join(' ')
  const accepted = [
    'estudiar', 'estudiar ahora', 'estudiar aquí', 'estudiar allí', 'estudiar mucho',
    'trabajar', 'trabajar ahora', 'trabajar aquí', 'trabajar allí', 'trabajar mucho', 'trabajar en españa', 'trabajar en barcelona',
    'venir', 'venir ahora', 'venir mañana', 'venir aquí', 'venir a casa',
    'ir', 'ir ahora', 'ir mañana', 'ir a casa', 'ir a la playa', 'ir al trabajo', 'ir a barcelona',
    'hacer', 'hacer ejercicio', 'hacer la tarea', 'hacer café',
    'volver', 'volver ahora', 'volver mañana', 'volver a casa',
    'aprender español', 'vivir aquí', 'vivir allí', 'vivir en españa', 'vivir en barcelona',
    'amar',
  ]
  return accepted.includes(joined)
}

function validateTail(lemma, tail, language) {
  const joined = tail.join(' ')
  if (lemma === 'tener') {
    if (!['tiempo', 'mucho tiempo', 'tiempo ahora', 'mucho tiempo ahora'].includes(joined)) return { correct: false, reason: text(language, 'После tengo/tienes назови, что есть: tiempo или mucho tiempo.', 'After tengo/tienes, say what is available: tiempo or mucho tiempo.') }
    return { correct: true, reason: text(language, 'Форма tener согласована с лицом, а tiempo правильно называет то, что есть.', 'The form of tener agrees with the person, and tiempo correctly names what is available.') }
  }
  if (lemma === 'querer') {
    if (['', 'café', 'un café', 'tiempo', 'trabajo', 'trabajo en españa'].includes(joined)) return { correct: true, reason: text(language, 'Querer правильно согласован, а после него стоит предмет желания.', 'Querer is correctly conjugated, followed by the thing that is wanted.') }
    if (!validateInfinitivePhrase(tail)) return { correct: false, reason: text(language, 'После quiero/quieres поставь предмет или инфинитив: café, aprender, trabajar, ir, venir…', 'After quiero/quieres, use a thing or an infinitive: café, aprender, trabajar, ir, venir…') }
    return { correct: true, reason: text(language, 'После формы querer правильно стоит инфинитив: он называет желаемое действие.', 'The conjugated form of querer is correctly followed by an infinitive naming the desired action.') }
  }
  if (lemma === 'poder') {
    if (joined === '' || joined === 'ahora') return { correct: true, reason: text(language, 'Puedo/puedes может использоваться отдельно, когда действие понятно из контекста.', 'Puedo/puedes can stand alone when the action is clear from context.') }
    if (!validateInfinitivePhrase(tail)) return { correct: false, reason: text(language, 'После puedo/puedes нужен инфинитив: puedo estudiar, puedes venir. Не используй вторую готовую форму вроде vengo.', 'Puedo/puedes must be followed by an infinitive: puedo estudiar, puedes venir. Do not use a second conjugated form such as vengo.') }
    return { correct: true, reason: text(language, 'Poder согласован с лицом, а следующее действие правильно оставлено в инфинитиве.', 'Poder agrees with the person, and the following action correctly stays in the infinitive.') }
  }
  if (lemma === 'hacer') {
    if (!['ejercicio', 'la tarea', 'café', 'ejercicio ahora', 'la tarea ahora', 'café ahora'].includes(joined)) return { correct: false, reason: text(language, 'После hago/haces здесь подходят ejercicio, la tarea или café.', 'After hago/haces, use ejercicio, la tarea or café in this lesson.') }
    return { correct: true, reason: text(language, 'Hago/haces — правильная форма hacer; дополнение показывает, что именно делается.', 'Hago/haces is the correct form of hacer, and the object says what is being done or made.') }
  }
  if (lemma === 'ir' || lemma === 'ir-future') {
    const destinations = ['', 'ahora', 'mañana', 'a casa', 'a la playa', 'al trabajo', 'a barcelona', 'a casa ahora', 'a la playa ahora', 'al trabajo ahora', 'a casa mañana', 'a la playa mañana']
    if (!destinations.includes(joined)) return { correct: false, reason: text(language, 'После voy/vas/iré укажи время или направление: ahora, a casa, a la playa, al trabajo. Перед местом нужна a.', 'After voy/vas/iré, add a time or destination: ahora, a casa, a la playa, al trabajo. A is required before a destination.') }
    return { correct: true, reason: lemma === 'ir-future'
      ? text(language, 'Iré — правильная будущая форма «я пойду»; направление оформлено через a/al.', 'Iré is the correct future form “I will go”, and the destination is introduced with a/al.')
      : text(language, 'Voy/vas правильно выражает движение сейчас, а направление оформлено через a или al.', 'Voy/vas correctly expresses movement in the present, and the destination uses a or al.') }
  }
  if (lemma === 'venir' || lemma === 'venir-command') {
    if (!['', 'ahora', 'mañana', 'aquí', 'a casa', 'aquí ahora', 'aquí mañana'].includes(joined)) return { correct: false, reason: text(language, 'После vengo/vienes/ven добавь время или место: mañana, ahora, aquí, a casa.', 'After vengo/vienes/ven, add a time or place: mañana, ahora, aquí, a casa.') }
    return { correct: true, reason: lemma === 'venir-command'
      ? text(language, 'Ven — правильная команда для tú: «приходи».', 'Ven is the correct tú command meaning “come”.')
      : text(language, 'Vengo/vienes — правильная личная форма venir; время или место добавлено естественно.', 'Vengo/vienes is the correct personal form of venir, with a natural time or place.') }
  }
  if (lemma === 'estar') {
    if (!['aquí', 'allí', 'bien', 'en casa', 'en barcelona', 'aquí ahora', 'allí ahora', 'bien ahora', 'en casa ahora'].includes(joined)) return { correct: false, reason: text(language, 'После estoy/estás укажи место или состояние: aquí, bien, en casa.', 'After estoy/estás, give a location or state: aquí, bien, en casa.') }
    return { correct: true, reason: text(language, 'Estar согласован с лицом и правильно описывает место или состояние.', 'Estar agrees with the person and correctly describes a location or state.') }
  }
  if (lemma === 'ser') {
    if (!['estudiante', 'arquitecto', 'arquitecta', 'de ucrania'].includes(joined)) return { correct: false, reason: text(language, 'После soy/eres назови роль или происхождение: estudiante, arquitecto, de Ucrania.', 'After soy/eres, give a role or origin: estudiante, arquitecto, de Ucrania.') }
    return { correct: true, reason: text(language, 'Ser согласован с лицом и правильно описывает роль или происхождение.', 'Ser agrees with the person and correctly describes a role or origin.') }
  }
  if (lemma === 'estudiar') {
    if (!['', 'ahora', 'aquí', 'allí', 'mucho', 'mucho ahora', 'mucho aquí', 'mucho allí'].includes(joined)) return { correct: false, reason: text(language, 'После estudio/estudias используй ahora, aquí, allí или mucho.', 'After estudio/estudias, use ahora, aquí, allí or mucho.') }
    return { correct: true, reason: text(language, 'Форма estudiar согласована с yo/tú, а дополнительная информация стоит естественно.', 'The form of estudiar agrees with yo/tú, and the extra information is placed naturally.') }
  }
  if (lemma === 'trabajar') {
    if (!['', 'ahora', 'aquí', 'allí', 'mucho', 'en españa', 'en barcelona', 'mucho ahora', 'mucho aquí', 'mucho allí', 'mucho en españa', 'mucho en barcelona'].includes(joined)) return { correct: false, reason: text(language, 'После trabajo/trabajas используй ahora, aquí, mucho или en España.', 'After trabajo/trabajas, use ahora, aquí, mucho or en España.') }
    return { correct: true, reason: text(language, 'Форма trabajar согласована с yo/tú; место, время или mucho добавлено естественно.', 'The form of trabajar agrees with yo/tú, with a natural place, time or mucho.') }
  }
  if (lemma === 'vivir') {
    if (!['aquí', 'allí', 'en españa', 'en barcelona'].includes(joined)) return { correct: false, reason: text(language, 'После vivo/vives укажи место: aquí, allí, en España, en Barcelona.', 'After vivo/vives, give a location: aquí, allí, en España, en Barcelona.') }
    return { correct: true, reason: text(language, 'Vivo/vives согласован с лицом, а место правильно оформлено.', 'Vivo/vives agrees with the person, and the location is correctly expressed.') }
  }
  if (lemma === 'volver') {
    if (!['', 'ahora', 'mañana', 'a casa', 'a casa ahora', 'a casa mañana'].includes(joined)) return { correct: false, reason: text(language, 'После vuelvo/vuelves добавь ahora, mañana или a casa.', 'After vuelvo/vuelves, add ahora, mañana or a casa.') }
    return { correct: true, reason: text(language, 'Vuelvo/vuelves — правильная форма volver; время или направление добавлено правильно.', 'Vuelvo/vuelves is the correct form of volver, with a correct time or direction.') }
  }
  if (lemma === 'entender') {
    if (!['', 'ahora'].includes(joined)) return { correct: false, reason: text(language, 'Entiendo/entiendes здесь достаточно использовать отдельно или с ahora.', 'Use entiendo/entiendes on its own or with ahora here.') }
    return { correct: true, reason: text(language, 'Entiendo/entiendes правильно согласован с лицом.', 'Entiendo/entiendes correctly agrees with the person.') }
  }
  if (lemma === 'ver') {
    if (joined !== 'ningún avión') return { correct: false, reason: text(language, 'В примере с ver используй: veo ningún avión; с отрицанием — no veo ningún avión.', 'In this ver example, use veo ningún avión; with negation: no veo ningún avión.') }
    return { correct: true, reason: text(language, 'Veo — форма для yo; ningún avión правильно стоит после отрицания no veo.', 'Veo is the yo form, and ningún avión correctly follows the negative no veo.') }
  }
  return { correct: false, reason: text(language, 'Эта конструкция пока не распознана в словаре урока.', 'This construction is not recognised in this lesson yet.') }
}

function validateClause(tokens, language) {
  const joined = tokens.join(' ')
  if (joined === 'qué haces ahora' || joined === 'qué haces') return { correct: true, reason: text(language, 'Qué с ударением задаёт вопрос, а haces — правильная форма hacer для tú.', 'Qué with an accent introduces the question, and haces is the correct tú form of hacer.') }
  if (joined.includes('a el')) return { correct: false, reason: text(language, 'A + el обязательно сливаются: не a el trabajo, а al trabajo.', 'A + el must contract: use al trabajo, not a el trabajo.') }
  if (joined.includes('voy la ') || joined.includes('vas la ')) return { correct: false, reason: text(language, 'Перед направлением нужна a: voy a la playa.', 'A destination needs a: voy a la playa.') }

  const verbIndex = tokens.findIndex((token) => forms[token])
  if (verbIndex < 0) {
    const infinitive = tokens.find((token) => infinitives.includes(token))
    if (infinitive) {
      const suggestion = { tener: 'tengo/tienes', querer: 'quiero/quieres', poder: 'puedo/puedes', hacer: 'hago/haces', ir: 'voy/vas', venir: 'vengo/vienes', estar: 'estoy/estás', ser: 'soy/eres', estudiar: 'estudio/estudias', trabajar: 'trabajo/trabajas', vivir: 'vivo/vives', volver: 'vuelvo/vuelves', entender: 'entiendo/entiendes', ver: 'veo/ves', aprender: 'quiero aprender', amar: 'quiero amar' }[infinitive]
      return { correct: false, reason: text(language, `${infinitive} — инфинитив. Для полной фразы выбери личную форму: ${suggestion}.`, `${infinitive} is an infinitive. A complete sentence needs a personal form: ${suggestion}.`) }
    }
    return { correct: false, reason: text(language, 'Нужна личная форма глагола: tengo, quieres, puedo, haces, voy, vienes…', 'Use a conjugated verb form: tengo, quieres, puedo, haces, voy, vienes…') }
  }

  const prefix = tokens.slice(0, verbIndex)
  if (prefix.includes('no') && prefix.at(-1) !== 'no') return { correct: false, reason: text(language, 'No должно стоять прямо перед глаголом: yo no puedo, tú no quieres.', 'No must stand directly before the verb: yo no puedo, tú no quieres.') }
  if (!validPrefix(prefix)) return { correct: false, reason: text(language, 'Перед глаголом здесь допустимы yo/tú, ahora и no в естественном порядке.', 'Before the verb, use yo/tú, ahora and no in a natural order.') }

  const form = tokens[verbIndex]
  const [lemma, person] = forms[form]
  if (prefix.includes('yo') && person === 'tú') return { correct: false, reason: text(language, `С yo форма ${form} не подходит. Нужна форма первого лица: ${firstPerson.find((candidate) => forms[candidate][0] === lemma) || 'другая форма yo'}.`, `The form ${form} does not agree with yo. Use the first-person form: ${firstPerson.find((candidate) => forms[candidate][0] === lemma) || 'the matching yo form'}.`) }
  if (prefix.includes('tú') && person === 'yo') return { correct: false, reason: text(language, `С tú форма ${form} не подходит. Нужна форма второго лица: ${secondPerson.find((candidate) => forms[candidate][0] === lemma) || 'другая форма tú'}.`, `The form ${form} does not agree with tú. Use the second-person form: ${secondPerson.find((candidate) => forms[candidate][0] === lemma) || 'the matching tú form'}.`) }

  const tailResult = validateTail(lemma, tokens.slice(verbIndex + 1), language)
  if (!tailResult.correct) return tailResult
  if (lemma === 'ver' && !prefix.includes('no')) return { correct: false, reason: text(language, 'С ningún нужна отрицательная конструкция: No veo ningún avión.', 'Ningún needs the negative construction here: No veo ningún avión.') }
  const notes = [tailResult.reason]
  if (prefix.includes('no')) notes.push(text(language, 'No стоит прямо перед глаголом и правильно создаёт отрицание.', 'No stands directly before the verb and correctly creates the negative.'))
  if (prefix.includes('ahora')) notes.push(text(language, 'Ahora естественно задаёт время действия.', 'Ahora naturally gives the time of the action.'))
  if (prefix.includes('yo') || prefix.includes('tú')) notes.push(text(language, 'Местоимение можно опустить, но оно правильно согласовано с глаголом.', 'The pronoun can be omitted, but it agrees correctly with the verb.'))
  return { correct: true, reason: notes.join(' ') }
}

export function checkCoreVerbsSentence(value, existingSentences = [], language = 'ru') {
  const raw = value.trim()
  if (!raw) return { correct: false, reason: text(language, 'Сначала напиши одно предложение.', 'Write one sentence first.') }
  if (hasInternalSentenceBreak(raw)) return { correct: false, reason: text(language, 'Отправляй по одному предложению, чтобы каждое получило отдельное объяснение.', 'Submit one sentence at a time so each gets its own explanation.') }
  const normalized = normalizeJoseSentence(raw)

  const accentMap = { si: 'sí', tu: 'tú', cafe: 'café', espanol: 'español', espana: 'España', aqui: 'aquí', alli: 'allí', estas: 'estás', que: 'qué', ningun: 'ningún', avion: 'avión', manana: 'mañana', ire: 'iré' }
  const missingAccents = normalized.split(' ').filter((word) => accentMap[word]).map((word) => accentMap[word])
  if (missingAccents.length) return { correct: false, reason: text(language, `Проверь письменное ударение: нужно ${[...new Set(missingAccents)].join(', ')}.`, `Check the written accent: use ${[...new Set(missingAccents)].join(', ')}.`) }
  if (['yo', 'tú', 'sí', 'no', 'aquí', 'allí', 'ahora', 'mucho tiempo', 'muchas gracias'].includes(normalized)) return { correct: false, validPhrase: true, reason: text(language, 'Это слово или короткий ответ правильны, но для финала нужно предложение с личной формой глагола.', 'This word or short answer is valid, but the final requires a sentence with a conjugated verb.') }

  let working = normalized
  let discourse = ''
  const commaPrefix = raw.normalize('NFC').toLocaleLowerCase('es').match(/^\s*(sí|no)\s*,/)
  if (commaPrefix) {
    discourse = commaPrefix[1]
    working = working.replace(new RegExp(`^${discourse}\\s+`), '')
  } else if (working.startsWith('sí ')) {
    discourse = 'sí'
    working = working.slice(3)
  }

  const clauses = working.split(/\s+y\s+/)
  if (clauses.some((clause) => !clause.trim())) return { correct: false, reason: text(language, 'Y должно соединять две полные части: предложение + y + предложение.', 'Y must connect two complete parts: sentence + y + sentence.') }
  const results = clauses.map((clause) => validateClause(clause.trim().split(' '), language))
  const failed = results.find((result) => !result.correct)
  if (failed) return failed

  const duplicate = existingSentences.some((sentence) => normalizeJoseSentence(sentence) === normalized)
  if (duplicate) return { correct: true, counted: false, duplicate: true, reason: text(language, 'Грамматически правильно, но эта фраза уже засчитана. Напиши другую.', 'Grammatically correct, but this sentence is already counted. Write a different one.') }

  const reason = clauses.length > 1
    ? text(language, `Правильно: y соединяет ${clauses.length} полноценные части, и каждая прошла проверку формы и порядка слов.`, `Correct: y connects ${clauses.length} complete clauses, each with valid agreement and word order.`)
    : results[0].reason
  const discourseReason = discourse ? text(language, ' Начальный ответ оформлен правильно, а основная часть остаётся полной.', ' The opening response is correct, and the main clause remains complete.') : ''
  return { correct: true, counted: true, reason: `${reason}${discourseReason}` }
}
