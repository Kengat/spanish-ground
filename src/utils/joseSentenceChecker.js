const text = (language, ru, en) => language === 'ru' ? ru : en

export function normalizeJoseSentence(value) {
  return value
    .normalize('NFC')
    .toLocaleLowerCase('es')
    .replace(/[¡¿]/g, '')
    .replace(/[.,!?;:«»“”"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function hasInternalSentenceBreak(value) {
  return /[.!?]\s*\S/.test(value.trim().replace(/[.!?]+$/, ''))
}

function validPrefix(prefix) {
  const patterns = ['', 'yo', 'ahora', 'yo ahora', 'ahora yo', 'no', 'yo no', 'ahora no', 'ahora yo no', 'yo ahora no']
  return patterns.includes(prefix.join(' '))
}

function validWorkTail(tail) {
  const atoms = []
  for (let index = 0; index < tail.length; index += 1) {
    if (tail[index] === 'en' && tail[index + 1] === 'barcelona') { atoms.push('en barcelona'); index += 1 }
    else atoms.push(tail[index])
  }
  if (atoms.some((atom) => !['mucho', 'aquí', 'allí', 'ahora', 'en barcelona'].includes(atom))) return false
  if (new Set(atoms).size !== atoms.length) return false
  const locations = atoms.filter((atom) => ['aquí', 'allí', 'en barcelona'].includes(atom))
  if (locations.length > 1) return false
  if (atoms.includes('mucho') && locations.length && atoms.indexOf('mucho') > atoms.indexOf(locations[0])) return false
  return true
}

function validStudyTail(tail) {
  if (tail.some((token) => !['mucho', 'aquí', 'allí', 'ahora'].includes(token))) return false
  if (new Set(tail).size !== tail.length) return false
  const locations = tail.filter((token) => ['aquí', 'allí'].includes(token))
  if (locations.length > 1) return false
  if (tail.includes('mucho') && locations.length && tail.indexOf('mucho') > tail.indexOf(locations[0])) return false
  return true
}

function validateClause(tokens, language) {
  const joined = tokens.join(' ')
  const locationPatterns = [
    'aquí está mi casa', 'allí está mi casa', 'aquí está la universidad', 'allí está la universidad',
    'mi casa está aquí', 'mi casa está allí', 'la universidad está aquí', 'la universidad está allí',
  ]
  if (locationPatterns.includes(joined)) return { correct: true, kind: 'location', reason: text(language, 'Está правильно согласован с местом, а aquí/allí естественно указывает, где находится дом или университет.', 'Está correctly expresses location, and aquí/allí naturally shows where the home or university is.') }
  if (joined === 'y es una conjunción') return { correct: true, kind: 'definition', reason: text(language, 'Это полное определение: y — подлежащее, es — глагол, una conjunción — информация о нём.', 'This is a complete definition: y is the subject, es is the verb, and una conjunción gives the information about it.') }

  const verbs = ['entiendo', 'quiero', 'puedo', 'tengo', 'tienes', 'trabajo', 'estudio', 'vuelvo', 'estoy', 'está']
  const verbIndex = tokens.findIndex((token) => verbs.includes(token))
  if (verbIndex < 0) return { correct: false, reason: text(language, 'Здесь нет спрягаемого глагола. Для полной фразы используй, например, trabajo, vuelvo, tengo, estoy или está.', 'There is no conjugated verb here. For a complete sentence, use a form such as trabajo, vuelvo, tengo, estoy or está.') }

  const rawPrefix = tokens.slice(0, verbIndex)
  const frontLocations = rawPrefix.filter((token) => ['aquí', 'allí'].includes(token))
  if (frontLocations.length > 1) return { correct: false, reason: text(language, 'Выбери одно место: aquí или allí.', 'Choose one location: aquí or allí.') }
  if (rawPrefix.includes('no') && rawPrefix.at(-1) !== 'no') return { correct: false, reason: text(language, 'No должно стоять прямо перед глаголом: aquí no trabajo, ahora no tengo.', 'No must stand directly before the verb: aquí no trabajo, ahora no tengo.') }
  const frontLocation = frontLocations[0] || ''
  const prefix = rawPrefix.filter((token) => !['aquí', 'allí'].includes(token))
  const verb = tokens[verbIndex]
  const tail = tokens.slice(verbIndex + 1)
  if (!validPrefix(prefix)) {
    if (prefix.includes('no')) return { correct: false, reason: text(language, 'No должно стоять непосредственно перед глагольной частью: no trabajo, no tengo, no vuelvo.', 'No must stand directly before the verb phrase: no trabajo, no tengo, no vuelvo.') }
    return { correct: false, reason: text(language, 'Перед глаголом здесь допустимы только yo, ahora и no в естественном порядке.', 'Before the verb, this lesson allows yo, ahora and no in a natural order.') }
  }

  const prefixHasNow = prefix.includes('ahora')
  if (prefixHasNow && tail.includes('ahora')) return { correct: false, reason: text(language, 'Ahora достаточно использовать один раз — в начале или в конце фразы.', 'Use ahora only once — either at the beginning or at the end.') }

  if (['entiendo', 'quiero', 'puedo'].includes(verb)) {
    if (frontLocation) return { correct: false, reason: text(language, `Для базовой фразы с ${verb} убери указание места или используй его с trabajo/estudio.`, `For this basic ${verb} sentence, remove the location or use it with trabajo/estudio.`) }
    if (tail.length && !(tail.length === 1 && tail[0] === 'ahora')) return { correct: false, reason: text(language, `После ${verb} в этой конструкции лишняя или неизвестная часть. Оставь ${verb} отдельно либо добавь ahora.`, `The part after ${verb} does not fit this construction. Use ${verb} on its own or add ahora.`) }
    return { correct: true, kind: verb, reason: text(language, `${verb[0].toUpperCase() + verb.slice(1)} — правильная форма для yo; само yo можно не писать.`, `${verb[0].toUpperCase() + verb.slice(1)} is the correct yo form; the pronoun yo can be omitted.`) }
  }

  if (verb === 'trabajo') {
    const modifiers = frontLocation ? [...tail, frontLocation] : tail
    if (!validWorkTail(modifiers)) return { correct: false, reason: text(language, 'С trabajo используй mucho, aquí, allí, ahora или en Barcelona. Mucho ставится раньше указания места; aquí и allí вместе не нужны.', 'With trabajo, use mucho, aquí, allí, ahora or en Barcelona. Mucho comes before the location, and aquí and allí should not appear together.') }
    return { correct: true, kind: 'work', reason: text(language, 'Trabajo — правильная форма «я работаю»; дополнительная информация стоит в естественном месте.', 'Trabajo is the correct form for “I work”, and the extra information is in a natural position.') }
  }

  if (verb === 'estudio') {
    const modifiers = frontLocation ? [...tail, frontLocation] : tail
    if (!validStudyTail(modifiers)) return { correct: false, reason: text(language, 'С estudio здесь подходят mucho, aquí, allí или ahora. Mucho ставится раньше указания места.', 'With estudio, this lesson allows mucho, aquí, allí or ahora. Mucho comes before the location.') }
    return { correct: true, kind: 'study', reason: text(language, 'Estudio — правильная форма «я учусь»; дополнение не нарушает порядок слов.', 'Estudio is the correct form for “I study”, and the added information keeps a natural word order.') }
  }

  if (verb === 'tengo' || verb === 'tienes') {
    const timeTail = [...tail, ...(frontLocation ? [frontLocation] : [])]
    const hasMucho = timeTail[0] === 'mucho'
    const rest = timeTail.slice(hasMucho ? 2 : 1)
    const hasTiempo = timeTail[hasMucho ? 1 : 0] === 'tiempo'
    const restAllowed = rest.every((token) => ['ahora', 'aquí', 'allí'].includes(token))
      && new Set(rest).size === rest.length
      && rest.filter((token) => ['aquí', 'allí'].includes(token)).length <= 1
    if (!hasTiempo || !restAllowed) return { correct: false, reason: text(language, `После ${verb} назови, что есть: ${verb} tiempo или ${verb} mucho tiempo; затем можно добавить ahora, aquí или allí.`, `After ${verb}, name what is available: ${verb} tiempo or ${verb} mucho tiempo; then you may add ahora, aquí or allí.`) }
    const person = verb === 'tengo' ? 'yo' : 'tú'
    return { correct: true, kind: 'time', reason: text(language, `${verb[0].toUpperCase() + verb.slice(1)} — правильная форма для ${person}, а tiempo завершает мысль о наличии времени.`, `${verb[0].toUpperCase() + verb.slice(1)} is the correct ${person} form, and tiempo completes the idea of having time.`) }
  }

  if (verb === 'vuelvo') {
    const tailText = [...tail, ...(frontLocation ? [frontLocation] : [])].join(' ')
    const options = ['', 'ahora', 'mañana', 'a casa', 'aquí', 'allí', 'a casa ahora', 'ahora a casa', 'a casa mañana', 'mañana a casa', 'aquí ahora', 'allí ahora', 'ahora aquí', 'ahora allí']
    if (!options.includes(tailText)) return { correct: false, reason: text(language, 'После vuelvo добавь время или направление: ahora, mañana, aquí, allí либо a casa.', 'After vuelvo, add a time or direction: ahora, mañana, aquí, allí or a casa.') }
    return { correct: true, kind: 'return', reason: text(language, 'Vuelvo — правильная форма глагола volver для yo; время или направление добавлено естественно.', 'Vuelvo is the correct yo form of volver, and the time or direction is added naturally.') }
  }

  if (verb === 'estoy') {
    const locationTail = [...tail, ...(frontLocation ? [frontLocation] : [])].join(' ')
    if (!['aquí', 'allí', 'aquí ahora', 'allí ahora', 'ahora aquí', 'ahora allí'].includes(locationTail)) return { correct: false, reason: text(language, 'Estoy требует здесь указания места: estoy aquí или estoy allí.', 'Here, estoy needs a location: estoy aquí or estoy allí.') }
    return { correct: true, kind: 'personal-location', reason: text(language, 'Estoy — правильная форма для yo, а aquí/allí отвечает на вопрос «где?».', 'Estoy is the correct yo form, and aquí/allí answers the question “where?”.') }
  }

  if (verb === 'está') {
    const locationTail = [...tail, ...(frontLocation ? [frontLocation] : [])].join(' ')
    if (!['aquí', 'allí'].includes(locationTail)) return { correct: false, reason: text(language, 'После está укажи место: está aquí или está allí. Также можно назвать предмет: La universidad está allí.', 'After está, give a location: está aquí or está allí. You can also name the thing: La universidad está allí.') }
    return { correct: true, kind: 'location', reason: text(language, 'Está правильно выражает местоположение, а aquí/allí указывает место.', 'Está correctly expresses location, and aquí/allí gives the place.') }
  }

  return { correct: false, reason: text(language, 'Эта конструкция пока не распознана.', 'This construction is not recognised yet.') }
}

export function checkJoseSentence(value, existingSentences = [], language = 'ru') {
  const raw = value.trim()
  if (!raw) return { correct: false, reason: text(language, 'Сначала напиши одну фразу.', 'Write one sentence first.') }
  if (hasInternalSentenceBreak(raw)) return { correct: false, reason: text(language, 'Отправляй по одной фразе, чтобы каждая получила отдельное объяснение.', 'Submit one sentence at a time so each one gets its own explanation.') }

  const normalized = normalizeJoseSentence(raw)
  if (!normalized) return { correct: false, reason: text(language, 'В этой строке пока нет слов.', 'There are no words in this line yet.') }
  if (/\b(si|aqui|alli|conjuncion|manana)\b/.test(normalized)) {
    const corrections = normalized.match(/\b(si|aqui|alli|conjuncion|manana)\b/g)?.map((word) => ({ si: 'sí', aqui: 'aquí', alli: 'allí', conjuncion: 'conjunción', manana: 'mañana' })[word])
    return { correct: false, reason: text(language, `Проверь ударение: нужно ${[...new Set(corrections)].join(', ')}.`, `Check the written accent: use ${[...new Set(corrections)].join(', ')}.`) }
  }
  if (/\b(trabajar|volver)\b/.test(normalized)) {
    const form = normalized.includes('trabajar') ? 'trabajo' : 'vuelvo'
    return { correct: false, reason: text(language, `Это инфинитив. Для фразы от первого лица нужна готовая форма ${form}.`, `That is an infinitive. A first-person sentence needs the conjugated form ${form}.`) }
  }
  if (/\b(mucha tiempo|mucho gracias)\b/.test(normalized)) return { correct: false, reason: text(language, 'Согласуй mucho: mucho tiempo, но muchas gracias.', 'Make mucho agree: mucho tiempo, but muchas gracias.') }
  if (['sí', 'no', 'aquí', 'allí', 'ahora no', 'muchas gracias', 'mucho tiempo'].includes(normalized)) return { correct: false, validPhrase: true, reason: text(language, 'Это правильный короткий ответ или выражение, но в финале нужна полная фраза с глаголом.', 'This is a correct short answer or expression, but the final challenge requires a complete sentence with a verb.') }

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
  if (clauses.some((clause) => !clause.trim())) return { correct: false, reason: text(language, 'Союз y должен соединять две законченные части: фраза + y + фраза.', 'The conjunction y must connect two complete parts: sentence + y + sentence.') }
  const results = clauses.map((clause) => validateClause(clause.trim().split(' '), language))
  const failed = results.find((result) => !result.correct)
  if (failed) return failed

  const duplicate = existingSentences.some((sentence) => normalizeJoseSentence(sentence) === normalized)
  if (duplicate) return { correct: true, counted: false, duplicate: true, reason: text(language, 'Фраза написана правильно, но она уже есть в твоём списке. Для прогресса создай другую.', 'The sentence is correct, but it is already in your list. Create a different one to make progress.') }

  const joinReason = clauses.length > 1
    ? text(language, `Правильно: y соединяет ${clauses.length} законченные части, и в каждой есть подходящая форма глагола.`, `Correct: y connects ${clauses.length} complete parts, each with an appropriate verb form.`)
    : results[0].reason
  const discourseReason = discourse
    ? text(language, ` ${discourse === 'sí' ? 'Sí подтверждает ответ' : 'No оформляет короткий ответ'}, а основная часть остаётся полной.`, ` ${discourse === 'sí' ? 'Sí confirms the answer' : 'No works as a short response'}, while the main clause remains complete.`)
    : ''
  const detailNotes = []
  if (/\bno\s+(entiendo|quiero|puedo|tengo|tienes|trabajo|estudio|vuelvo|estoy|está)\b/.test(working)) detailNotes.push(text(language, 'No стоит перед глаголом и правильно делает фразу отрицательной.', 'No stands before the verb and correctly makes the sentence negative.'))
  if (/\bahora\b/.test(working)) detailNotes.push(text(language, 'Ahora стоит в естественной позиции и задаёт время действия.', 'Ahora is in a natural position and gives the time of the action.'))
  if (/\byo\b/.test(working)) detailNotes.push(text(language, 'Yo можно опустить, но его явное использование здесь тоже правильно.', 'Yo can be omitted, but using it explicitly here is also correct.'))
  const detailReason = detailNotes.length ? ` ${detailNotes.join(' ')}` : ''
  return { correct: true, counted: true, reason: `${joinReason}${discourseReason}${detailReason}` }
}
