import { starterPacks } from './lessonPacks.js'

const l = (ru, en) => ({ ru, en })

export const dictionaryCopy = {
  bilingual: true,
  title: l('Мой испанский словарь', 'My Spanish dictionary'),
  subtitle: l('Все слова и важные выражения из пройденных уроков.', 'Every word and useful expression from the lessons you have studied.'),
  search: l('Искать на испанском, русском или английском…', 'Search in Spanish, Russian or English…'),
  result: l('слов и выражений', 'words and expressions'),
  noResults: l('Ничего не нашлось. Попробуй другую форму слова.', 'Nothing found. Try another form of the word.'),
  all: l('Все источники', 'All sources'),
  source: l('Источник', 'Source'),
  example: l('Пример', 'Example'),
  note: l('Пояснение', 'Note'),
  tapHint: l('Нажми на строку, чтобы увидеть пример и источник.', 'Select a row to see its example and source.'),
  spanish: 'Español',
  russian: 'Русский',
  english: 'English',
  sortOptions: [
    { value: 'course', label: l('По порядку добавления', 'Dictionary order') },
    { value: 'es-asc', label: l('Испанский: A–Z', 'Spanish: A–Z') },
    { value: 'es-desc', label: l('Испанский: Z–A', 'Spanish: Z–A') },
    { value: 'ru-asc', label: l('Русский: А–Я', 'Russian: A–Я') },
    { value: 'en-asc', label: l('Английский: A–Z', 'English: A–Z') },
  ],
  categories: [
    { value: 'jose', label: l('Уроки с Хосе', 'Lessons with José') },
    { value: 'everyday', label: l('Живой испанский', 'Everyday Spanish') },
    { value: 'grammar', label: l('Грамматика', 'Grammar') },
    { value: 'songs', label: l('Песни', 'Songs') },
  ],
}

const everydayRussian = {
  pasar: 'случаться / проходить', acaso: 'случай / возможность', igual: 'одинаковый / всё равно', sonar: 'звучать',
  poco: 'мало / немного', claro: 'ясно / конечно', parecer: 'казаться', ganas: 'желание', 'echar de menos': 'скучать',
  guay: 'крутой / классный', pena: 'жалость / печаль', provecho: 'польза; в «buen provecho»', entender: 'понимать', repetir: 'повторять',
  despacio: 'медленно', bano: 'туалет / ванная', costar: 'стоить', cuenta: 'счёт', estacion: 'станция', llamarse: 'называться',
  recomendar: 'рекомендовать', ayudar: 'помогать', abrir: 'открывать', cerrar: 'закрывать', cambio: 'сдача / обмен', billete: 'билет / банкнота',
  buscar: 'искать', distancia: 'расстояние', tarjeta: 'карта', reserva: 'бронь', preocuparse: 'беспокоиться', 'dejar pasar': 'пропустить',
  lastima: 'жалость / обида', cuidarse: 'беречь себя',
}

const phraseRussian = {
  quisiera: 'я бы хотел', 'cuanto cuesta': 'сколько стоит', 'para llevar': 'с собой / навынос', 'la cuenta': 'счёт', perdona: 'извини', vale: 'хорошо / ладно',
  'me llamo': 'меня зовут', 'soy de': 'я из', 'vivo en': 'я живу в', 'a que te dedicas': 'чем ты занимаешься?',
  'hemos sido enganados': 'нас обманули', engano: 'обман / мошенничество',
}

const manualEntries = [
  ['yo', 'я', 'I'], ['tú', 'ты', 'you'], ['él / ella / usted', 'он / она / Вы', 'he / she / you formal'], ['nosotros', 'мы', 'we'], ['vosotros', 'вы', 'you plural, informal (Spain)'], ['ellos / ellas / ustedes', 'они / Вы', 'they / you plural'],
  ['café', 'кофе', 'coffee'], ['la playa', 'пляж', 'beach'], ['la universidad', 'университет', 'university'], ['la mochila', 'рюкзак', 'backpack'], ['el teléfono', 'телефон', 'phone'], ['la ayuda', 'помощь', 'help'],
  ['el libro', 'книга', 'book'], ['el ordenador', 'компьютер', 'computer'], ['la clase', 'занятие / класс', 'class'], ['el día', 'день', 'day'], ['el dinero', 'деньги', 'money'], ['la puerta', 'дверь', 'door'],
  ['el ejercicio', 'упражнение', 'exercise'], ['la tarea', 'домашнее задание', 'homework / task'], ['el arquitecto / la arquitecta', 'архитектор', 'architect'], ['el estudiante / la estudiante', 'студент / студентка', 'student'], ['el avión', 'самолёт', 'plane'],
  ['el máster', 'магистратура', "master's programme"], ['el sombrero', 'шляпа', 'hat'], ['la idea', 'идея', 'idea'], ['la lección', 'урок', 'lesson'], ['la ropa', 'одежда', 'clothes'], ['la persona', 'человек', 'person'],
  ['la ciudad', 'город', 'city'], ['español', 'испанский язык', 'Spanish'], ['inglés', 'английский язык', 'English'], ['la mesa', 'стол', 'table'], ['la silla', 'стул', 'chair'], ['el sofá', 'диван', 'sofa'], ['la cama', 'кровать', 'bed'], ['la ventana', 'окно', 'window'],
  ['hablar', 'говорить', 'to speak'], ['estudiar', 'учиться', 'to study'], ['vivir', 'жить', 'to live'], ['comer', 'есть', 'to eat'], ['leer', 'читать', 'to read'], ['escribir', 'писать', 'to write'], ['caminar', 'ходить пешком', 'to walk'],
  ['pedir', 'просить / заказывать', 'to ask for / order'], ['caer', 'падать', 'to fall'], ['oír', 'слышать', 'to hear'], ['ayer', 'вчера', 'yesterday'], ['hoy', 'сегодня', 'today'], ['mañana', 'завтра / утро', 'tomorrow / morning'],
  ['este', 'этот', 'this, masculine'], ['esta', 'эта', 'this, feminine'], ['esto', 'это', 'this, neutral pronoun'], ['estos', 'эти, мужской род', 'these, masculine'], ['estas', 'эти, женский род', 'these, feminine'],
  ['el gerundio', 'герундий', 'gerund'], ['el presente', 'настоящее время', 'present tense'], ['el pretérito indefinido', 'простое завершённое прошедшее', 'preterite / simple past'], ['el futuro simple', 'простое будущее', 'simple future'],
].map(([es, ru, en]) => ({ es, ru, en, category: 'grammar', sourceRu: 'Грамматика и записи уроков', sourceEn: 'Grammar and lesson notes' }))

const joseReflexiveEntries = [
  {
    es: 'la ducha', ru: 'душ', en: 'shower (noun)', example: 'La ducha está libre.',
    noteRu: 'Существительное женского рода: la ducha. Глагол — duchar; «принимать душ» — ducharse.',
    noteEn: 'Feminine noun: la ducha. The verb is duchar; “to take a shower” is ducharse.',
  },
  {
    es: 'duchar', ru: 'мыть под душем / купать кого-то', en: 'to shower / wash someone', example: 'Voy a duchar al perro.',
    noteRu: 'Обычный переходный глагол: действие направлено на другого. Когда моешься сам, используй ducharse.',
    noteEn: 'The non-reflexive verb acts on someone else. Use ducharse when the subject showers themself.',
  },
  {
    es: 'levantarse', ru: 'вставать / подниматься', en: 'to get up', example: 'Me levanto a las siete.',
    noteRu: 'При спряжении: me levanto, te levantas, se levanta.',
    noteEn: 'Conjugated as: me levanto, te levantas, se levanta.',
  },
  {
    es: 'ducharse', ru: 'принимать душ', en: 'to take a shower', example: 'Me ducho por la mañana.',
    noteRu: 'Возвратная форма: me ducho, te duchas, se ducha.',
    noteEn: 'Reflexive form: me ducho, te duchas, se ducha.',
  },
  {
    es: 'relajarse', ru: 'расслабляться / отдыхать', en: 'to relax', example: 'Nos relajamos después de estudiar.',
    noteRu: 'Возвратное местоимение показывает, что человек приводит в расслабленное состояние себя.',
    noteEn: 'The reflexive pronoun shows that the subject relaxes themself.',
  },
  {
    es: 'acostarse', ru: 'ложиться спать', en: 'to go to bed', example: 'Ella se acuesta a las diez.',
    noteRu: 'Глагол меняет корень: me acuesto, te acuestas, se acuesta; nosotros nos acostamos.',
    noteEn: 'Stem-changing verb: me acuesto, te acuestas, se acuesta; nosotros nos acostamos.',
  },
  {
    es: 'prepararse', ru: 'готовиться / собираться', en: 'to get ready / prepare oneself', example: 'Me preparo para la clase.',
    noteRu: 'Обычно: prepararse para algo — готовиться к чему-то.',
    noteEn: 'Usually used as prepararse para algo — to prepare for something.',
  },
  {
    es: 'organizarse', ru: 'организоваться / организовать свои дела', en: 'to organize oneself / get organized', example: 'Necesito organizarme mejor.',
    noteRu: 'После инфинитива местоимение присоединяется к нему: necesito organizarme.',
    noteEn: 'After an infinitive, the pronoun attaches to it: necesito organizarme.',
  },
  {
    es: 'concentrarse', ru: 'сосредотачиваться', en: 'to concentrate', example: 'Me concentro durante la clase.',
    noteRu: 'Обычно: concentrarse en algo — сосредоточиться на чём-то.',
    noteEn: 'Usually used as concentrarse en algo — to concentrate on something.',
  },
  {
    es: 'conectarse', ru: 'подключаться / входить в систему', en: 'to connect / log in', example: 'Me conecto a la plataforma.',
    noteRu: 'Обычно: conectarse a una red / a una plataforma.',
    noteEn: 'Usually used as conectarse a una red / a una plataforma.',
  },
  {
    es: 'equivocarse', ru: 'ошибаться / быть неправым', en: 'to make a mistake / be wrong', example: 'Me equivoco a veces.',
    noteRu: 'Испанский выражает «ошибаться» возвратным глаголом: me equivoco, no soy equivocado.',
    noteEn: 'Spanish uses the reflexive verb for “to be wrong”: me equivoco, not soy equivocado.',
  },
  {
    es: 'comunicarse', ru: 'общаться / связываться', en: 'to communicate', example: 'Nos comunicamos en español.',
    noteRu: 'Можно сказать comunicarse con alguien — общаться с кем-то.',
    noteEn: 'Use comunicarse con alguien for “to communicate with someone.”',
  },
].map((entry) => ({
  ...entry,
  category: 'jose',
  sourceRu: 'Урок с Хосе: возвратные глаголы',
  sourceEn: 'Lesson with José: reflexive verbs',
}))

const normalize = (value) => value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u00bf?\u00a1!.,«»]/g, '').trim()
const packTitle = (pack, language) => typeof pack.title === 'string' ? pack.title : pack.title?.[language] || pack.title?.en || pack.id

function sourceCategory(pack) {
  if (pack.id.includes('song')) return 'songs'
  if (pack.id.startsWith('jose-')) return 'jose'
  return 'everyday'
}

function entryFromItem(item, pack) {
  const bilingual = item.en && typeof item.en === 'object' && 'ru' in item.en && 'en' in item.en
  const category = sourceCategory(pack)
  const fallbackRu = pack.id === 'everyday-60' ? everydayRussian[normalize(item.es)] : phraseRussian[normalize(item.es)]
  const note = item.example && typeof item.example === 'object' ? item.example : null
  return {
    es: item.es,
    ru: bilingual ? item.en.ru : fallbackRu,
    en: bilingual ? item.en.en : item.en,
    example: typeof item.example === 'string' ? item.example : '',
    noteRu: note?.ru || '',
    noteEn: note?.en || '',
    category,
    sourceRu: packTitle(pack, 'ru'),
    sourceEn: packTitle(pack, 'en'),
  }
}

const collected = [...manualEntries, ...joseReflexiveEntries]

for (const pack of starterPacks) {
  const isSong = pack.id.includes('song')
  const isJose = pack.id.startsWith('jose-')
  const isEverydayVocabulary = pack.id === 'everyday-60'
  const isStarterPhrasePack = ['barcelona-first-week', 'meet-people', 'meme-break'].includes(pack.id)
  const items = isSong || isEverydayVocabulary ? (pack.vocabulary || []) : isJose || isStarterPhrasePack ? (pack.words || []) : []
  collected.push(...items.map((item) => entryFromItem(item, pack)))
}

const entriesBySpanish = new Map()
for (const entry of collected) {
  if (!entry.es || !entry.ru || !entry.en) continue
  const key = normalize(entry.es)
  const saved = entriesBySpanish.get(key)
  if (!saved) entriesBySpanish.set(key, { ...entry })
  else {
    if (!saved.example && entry.example) saved.example = entry.example
    if (!saved.noteRu && entry.noteRu) saved.noteRu = entry.noteRu
    if (!saved.noteEn && entry.noteEn) saved.noteEn = entry.noteEn
  }
}

export const dictionaryEntries = [...entriesBySpanish.values()].map((entry, order) => ({ ...entry, id: `word-${order + 1}`, order }))
