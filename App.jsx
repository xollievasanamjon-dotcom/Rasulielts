import React, { useState, useEffect, useMemo, useRef } from 'react';


const ENGNOVATE_LINKS = [
  { id: 'listening', title: 'Listening', sub: 'Engnovate Audio', url: 'https://engnovate.com/ielts-listening-tests/ielts-vol-9-academic-listening-test-6/' },
  { id: 'reading', title: 'Reading', sub: 'Passages & Headings', url: 'https://engnovate.com/mini-ielts-exercises/ielts-academic-reading-matching-headings-practice-exercises/' },
  { id: 'writing', title: 'Writing', sub: 'Task 1 & Task 2', url: 'https://engnovate.com/ielts-writing-tests/ielts-simulation-tests-academic-writing-test-10/' },
  { id: 'speaking', title: 'Speaking', sub: 'Full Sim + AI', url: 'https://engnovate.com/ielts-speaking-tests/cambridge-ielts-21-academic-speaking-test-1/' }
];

const EXTRA_PRACTICE_LINKS = [
  { label: 'Все тесты Engnovate', url: 'https://engnovate.com/ielts-tests/' },
  { label: 'Daily Exams', url: 'https://engnovate.com/ielts-exam-events/' },
  { label: 'Mini Exercises', url: 'https://engnovate.com/mini-ielts-exercises/' },
  { label: 'Forecast Topics', url: 'https://engnovate.com/ielts-exam-topics/' },
  { label: 'IELTS.org Samples', url: 'https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test' }
];

const ERROR_TYPES = [
  'Reading: T/F/NG & Y/N/NG',
  'Reading: Matching Headings',
  'Reading: Не хватило времени на P3',
  'Listening: Self-Correction (P1-2)',
  'Listening: Part 3 MCQ перефраз',
  'Listening: Part 4 орфография / -s',
  'Writing: Слабый Overview (Task 1)',
  'Writing: Нет чёткой позиции (Task 2)',
  'Writing: Клише / бедная грамматика',
  'Speaking: Паузы на Part 2 (2 мин)'
];

const BEAST_28_DAYS = Array.from({ length: 28 }, (_, idx) => {
  const day = idx + 1;
  const week = Math.floor(idx / 7) + 1;
  const dow = idx % 7; // 0=Mon ... 6=Sun

  if (dow === 6) {
    return {
      day,
      week,
      tag: 'Разгрузка',
      title: `День ${day} • Отдых + Погружение`,
      blocks: [
        'Никаких тестов и таймеров — мозгу нужно закрепить связи.',
        'Посмотри 1 фильм или 2 серии Netflix / Anime EN Dub из вкладки «Медиа» чисто в кайф.',
        'Выпиши 3–5 реально крутых фраз, которые зацепили слух.'
      ]
    };
  }

  if (dow === 5) {
    return {
      day,
      week,
      tag: 'Full Mock',
      title: `День ${day} • Субботний Full Mock`,
      blocks: [
        'Сдай полный экзамен подряд на Engnovate (Listening + Reading + Writing, 2ч 40м без пауз).',
        'Запиши свежие баллы через кнопку «+ Мок» и отметь главные ошибки в Error Wall.',
        'Вечером 20 мин лёгкого Speaking Part 1–2.'
      ]
    };
  }

  const weekThemes = {
    1: {
      focus: 'Фундамент и закрытие дыр 5.5',
      wTask: '1 Task 2 (Opinion / Discussion) по 12-предложенной схеме без жёсткого таймера — фокус на 100% логику и 0 клише.',
      lrTask: dow % 2 === 0
        ? 'Reading на Engnovate: фокус на T/F/NG и Gap Fill (выписывай доказательство из текста).'
        : 'Listening на Engnovate: цель 19–20/20 в Parts 1–2, лови все self-correction ловушки.'
    },
    2: {
      focus: 'Все типы Writing + Тайминг 15/20/25',
      wTask: dow < 3
        ? '1 Task 2 (Adv/Disadv, Problem/Sol или Two-Part) за 45 минут + проверка чек-листом.'
        : '1 Task 1 (Line / Bar / Pie / Table) за 20 минут — железный Overview без цифр.',
      lrTask: dow % 2 === 0
        ? 'Reading строго по сплит-таймеру 15 / 20 / 25 мин + 1 блок Matching Headings.'
        : 'Listening полный тест + разбор всех ошибок Part 3 MCQ.'
    },
    3: {
      focus: 'Апгрейд до 7.0–7.5+ (Сложные части)',
      wTask: 'Task 1 (20 мин) + Task 2 (40 мин) с обязательными 1 Noun Clause + 1 Concession + 1 Inversion.',
      lrTask: dow % 2 === 0
        ? 'Reading Passage 3 на время + 1 эссе на Aeon/Psyche с выпиской 5 коллокаций.'
        : 'Listening Parts 3–4 на скорости 1.15x + диктовка сложных слов Part 4.'
    },
    4: {
      focus: 'Экзаменационная полировка',
      wTask: 'Полный Writing за 60 мин + прогон через Gemini Examiner (или чек-лист 4 критериев).',
      lrTask: 'Симуляция L+R подряд без перерыва + точечный добив топ-2 ошибок из Error Wall.'
    }
  };

  const t = weekThemes[week];
  return {
    day,
    week,
    tag: `Неделя ${week}`,
    title: `День ${day} • ${t.focus}`,
    blocks: [
      `Блок 1 — Writing (90 мин): ${t.wTask}`,
      `Блок 2 — L/R Практика (75 мин): ${t.lrTask}`,
      'Блок 3 — Разбор ошибок + Словарь (45 мин): разбери каждую ошибку по причине и запиши 5 живых коллокаций.',
      'Блок 4 — Speaking (30 мин): 1 Cue Card (1+2 мин таймер) + 3 вопроса Part 3 вслух.'
    ]
  };
});

const TASK2_TYPES = [
  {
    id: 'opinion',
    name: 'Agree / Disagree',
    prompt: 'Some people believe AI tutors will eventually replace human teachers in secondary schools. To what extent do you agree or disagree?',
    steps: [
      { id: 'S1', part: 'Intro', title: 'Перефраз темы (без копирования)', example: 'As adaptive AI platforms rapidly enter classrooms, many argue that human educators could soon become obsolete.' },
      { id: 'S2', part: 'Intro', title: 'Чёткая позиция + 2 причины сразу', example: 'While AI excels at routine drills, I firmly disagree that it can replace teachers, as teenage learning relies heavily on emotional mentorship and classroom accountability.' },
      { id: 'S3', part: 'Body 1', title: 'Topic Sentence (1 идея + Noun Clause)', example: 'What makes human teachers irreplaceable is that adolescents require empathy and tailored psychological support.' },
      { id: 'S4', part: 'Body 1', title: 'Механизм (Why / How)', example: 'Unlike algorithms that only track right or wrong answers, an attentive teacher notices subtle signs of burnout or quiet self-doubt.' },
      { id: 'S5', part: 'Body 1', title: 'Конкретный жизненный пример', example: 'For instance, a teenager struggling with exam anxiety often needs a brief, encouraging conversation after class rather than another automated worksheet.' },
      { id: 'S6', part: 'Body 1', title: 'Последствие / Связка к тезису', example: 'Without this human connection, many students lose intrinsic motivation and treat studying as a mechanical chore.' },
      { id: 'S7', part: 'Body 2', title: 'Уступка (Concession)', example: 'Admittedly, AI platforms bring undeniable efficiency to secondary education.' },
      { id: 'S8', part: 'Body 2', title: 'Развитие уступки (Inversion)', example: 'Not only can software grade essays in seconds, but it also adapts exercises to each student\'s individual pace.' },
      { id: 'S9', part: 'Body 2', title: 'Поворот к своей позиции', example: 'However, secondary school is not merely about transferring facts; it is where young people learn to debate, collaborate, and read social cues.' },
      { id: 'S10', part: 'Body 2', title: 'Пример + Итог абзаца', example: 'Spontaneous group discussions guided by a skilled teacher build critical thinking and resilience in ways a screen cannot replicate.' },
      { id: 'S11', part: 'Conclusion', title: 'Перефраз позиции (без "In conclusion")', example: 'Ultimately, although AI is a powerful teaching assistant, it cannot substitute for human mentorship.' },
      { id: 'S12', part: 'Conclusion', title: 'Финальный практический вывод', example: 'The smartest path forward is a hybrid classroom where technology handles repetitive grading so teachers can focus on inspiring students.' }
    ]
  },
  {
    id: 'discuss',
    name: 'Discuss Both Views',
    prompt: 'Some people think students should study only subjects they enjoy, while others believe they should study a broad range of subjects. Discuss both views and give your own opinion.',
    steps: [
      { id: 'S1', part: 'Intro', title: 'Обе стороны в одном предложении', example: 'While some contend that teenagers thrive when allowed to focus solely on favorite subjects, others insist that a broad curriculum remains essential.' },
      { id: 'S2', part: 'Intro', title: 'Твоя позиция СРАЗУ (не прячь до конца)', example: 'Although passion undeniably boosts engagement, I believe a well-rounded foundation serves students far better in the long run.' },
      { id: 'S3–S6', part: 'Body 1', title: 'Чужая сторона (4 предл.) + мягкий переход', example: 'Proponents of early specialization point out that genuine curiosity accelerates mastery... Yet narrowing a teenager\'s horizons too early carries a serious blind spot.' },
      { id: 'S7–S10', part: 'Body 2', title: 'ТВОЯ сторона (5 предл. + Noun Clause)', example: 'What makes a broad curriculum far more valuable is that adolescents\' career interests evolve rapidly, and cross-disciplinary skills open far more doors.' },
      { id: 'S11–S12', part: 'Conclusion', title: 'Баланс + подтверждение твоего выбора', example: 'In short, electives should nurture personal passion, yet core general education must remain non-negotiable.' }
    ]
  },
  {
    id: 'adv',
    name: 'Adv / Disadv (Outweigh)',
    prompt: 'More young people are choosing remote freelance careers over traditional office jobs. Do the advantages outweigh the disadvantages?',
    steps: [
      { id: 'S1–S2', part: 'Intro', title: 'Перефраз + прямой ответ на OUTWEIGH', example: 'Although remote freelancing introduces income instability, I believe its long-term advantages decisively outweigh the drawbacks.' },
      { id: 'S3–S6', part: 'Body 1', title: 'Меньшая сторона (Минусы, 4 предл.)', example: 'Granted, working independently carries tangible risks, particularly irregular paychecks and isolation—yet these hurdles can be managed with discipline.' },
      { id: 'S7–S10', part: 'Body 2', title: 'Главная сторона (Плюсы + Inversion)', example: 'Not only can graduates in smaller cities compete for global clients, but they also reclaim hours lost to exhausting daily commutes.' },
      { id: 'S11–S12', part: 'Conclusion', title: 'Итоговый перевес', example: 'Ultimately, the autonomy and global earning ceiling of remote work far outweigh its manageable early risks.' }
    ]
  },
  {
    id: 'problem',
    name: 'Problem / Solution',
    prompt: 'Traffic congestion in major cities is worsening every year. What are the main causes, and what measures can tackle it?',
    steps: [
      { id: 'S1–S2', part: 'Intro', title: 'Перефраз проблемы + краткий анонс причин и мер', example: 'Severe urban gridlock stems largely from unreliable public transit and sprawling suburbs, yet targeted infrastructure investment and congestion pricing can reverse it.' },
      { id: 'S3–S6', part: 'Body 1', title: '2 конкретные причины с механизмом', example: 'When buses are slow and overcrowded, commuters treat private cars as a necessity rather than a luxury.' },
      { id: 'S7–S10', part: 'Body 2', title: 'Решения, бьющие РОВНО в причины Body 1', example: 'Faced with dedicated bus lanes, reliable metro networks, and peak-hour city center tolls, drivers naturally switch to public transport—as demonstrated in Singapore.' },
      { id: 'S11–S12', part: 'Conclusion', title: 'Связка причины → решения', example: 'Only by making public transit faster and cheaper than driving can cities truly unclog their roads.' }
    ]
  },
  {
    id: 'twopart',
    name: 'Two-Part Question',
    prompt: 'People spend far less time with their neighbors than in the past. Why is this happening, and is it a positive or negative development?',
    steps: [
      { id: 'S1–S2', part: 'Intro', title: 'Ответ на ОБА вопроса в одном Intro', example: 'Frequent relocation and digital socializing have weakened neighborhood ties, which I view as a largely negative shift for community resilience.' },
      { id: 'S3–S6', part: 'Body 1', title: 'Полный ответ на 1-й вопрос (Why?)', example: 'Young professionals move apartments every few years for work, leaving little incentive to build lasting local friendships.' },
      { id: 'S7–S10', part: 'Body 2', title: 'Полный ответ на 2-й вопрос (Pos / Neg)', example: 'While reduced contact offers greater privacy, the erosion of local trust leaves residents—especially elderly ones—isolated during emergencies.' },
      { id: 'S11–S12', part: 'Conclusion', title: 'Итог по обеим частям', example: 'Restoring casual neighborhood spaces is vital to counter the quiet loneliness of modern urban life.' }
    ]
  }
];

const TASK1_TYPES = [
  { name: 'Line Graph', overview: 'Overall, digital video courses surged dramatically and overtook printed textbooks, which declined steadily throughout the period.', vocab: ['surged / climbed steadily / plateaued / plummeted', 'overtook X in 2020', 'narrowed the gap'] },
  { name: 'Bar Chart', overview: 'Overall, Norway consistently maintained the highest renewable share, whereas the UK recorded the steepest relative expansion.', vocab: ['accounted for the largest share', 'lagged well behind', 'roughly three times as high as', 'respectively'] },
  { name: 'Pie Charts', overview: 'Overall, housing and food remained the two dominant household expenses in both years, while spending on entertainment nearly doubled.', vocab: ['comprised / constituted', 'just over a quarter (26%)', 'a negligible fraction (2%)'] },
  { name: 'Table', overview: 'Overall, European nations outperformed Asian counterparts across all three metrics, with the widest disparity seen in research funding.', vocab: ['outperformed all other nations', 'stood at / hovered around', 'a stark disparity between X and Y'] },
  { name: 'Process Diagram', overview: 'Overall, the linear manufacturing process consists of seven main stages, beginning with harvesting raw beans and culminating in retail packaging.', vocab: ['Initially / Subsequently / Once dried, the material is...', 'undergoes a process of', 'is fed into'] },
  { name: 'Map (Before/After)', overview: 'Overall, the quiet coastal village was transformed into a modern tourist hub with upgraded roads, while the northern forest remained untouched.', vocab: ['was demolished to make way for', 'has been converted into', 'remained intact', 'adjacent to / directly opposite'] }
];

const STARTER_FRAMES = [
  { label: '+ Noun Clause', text: 'What many observers overlook is that ' },
  { label: '+ Inversion', text: 'Not only does this approach cut costs, but it also ' },
  { label: '+ Concession', text: 'While it is tempting to assume that , the reality is far more nuanced.' },
  { label: '+ Participle', text: 'Faced with mounting pressure, ' },
  { label: '+ Cleft', text: 'It is consistent daily practice, rather than raw talent, that ' }
];

const GRAMMAR_WEAPONS = [
  { name: 'Noun Clauses', formula: 'What + [verb phrase] + is that + [clause]', bad: 'It is very important that teens sleep enough.', good: 'What many parents overlook is that chronic sleep loss directly impairs teenage memory.' },
  { name: 'Negative Inversion', formula: 'Not only + does/do/can + S + V, but S + also...', bad: 'Remote work saves time and lowers stress.', good: 'Not only does remote work eliminate exhausting commutes, but it also boosts autonomy.' },
  { name: 'Participle Clauses', formula: 'Faced with + [noun], S + V...', bad: 'Because cities face severe traffic, they build metros.', good: 'Faced with crippling congestion, cities are investing heavily in rapid transit.' },
  { name: 'Cleft Sentences', formula: 'It is [X], rather than [Y], that + [verb]', bad: 'Lack of practice causes low scores, not lack of talent.', good: 'It is inconsistent practice, rather than a lack of talent, that holds candidates back.' },
  { name: 'Natural Hedging', formula: 'While it is tempting to assume..., the reality is...', bad: 'Social media completely destroys real friendships.', good: 'While it is tempting to assume social media erodes friendships, it often sustains distant ties.' }
];

const WRITING_CHECKLIST = [
  { id: 'c1', crit: 'TR/TA', text: 'Ответил на ВСЕ части вопроса (мнение чётко есть в Intro и Conclusion).' },
  { id: 'c2', crit: 'TR/TA', text: 'Task 1: есть Overview БЕЗ цифр. Task 2: минимум 260 слов.' },
  { id: 'c3', crit: 'CC', text: '4 абзаца, 1 абзац = 1 идея. Нет роботских Firstly / Moreover / Nowadays.' },
  { id: 'c4', crit: 'LR', text: 'Убраны very good / very bad / big problem / a lot of.' },
  { id: 'c5', crit: 'GRA', text: 'Вставлены 1 Noun Clause, 1 Inversion или Participle и 1 Concession.' },
  { id: 'c6', crit: 'GRA', text: 'Проверил артикли (a/the), окончания -s и орфографию.' }
];

const SKILL_PLAYBOOKS = {
  reading: [
    { tag: 'Тайминг 15 / 20 / 25', title: 'Никогда не дели 60 минут поровну', items: ['Passage 1 (15 мин): самый прямой — сразу сканируй по якорям (имена, даты, термины).', 'Passage 2 (20 мин): Matching Headings решай ПОСЛЕ остальных вопросов к этому пассажу.', 'Passage 3 (25 мин): читай абзацы вдумчиво, лови тон автора (merely, scarcely, arguably, ironically).'] },
    { tag: 'T/F/NG vs Y/N/NG', title: '3-шаговый тест против слива баллов', items: ['TRUE/YES: та же мысль, но перефразированная синонимами.', 'FALSE/NO: в тексте есть ПРЯМОЕ противоречие (можно ткнуть пальцем в строку).', 'NOT GIVEN: факта нет или добавили сравнение (cheaper, faster, first), которого нет в тексте.'] }
  ],
  listening: [
    { tag: 'Parts 1–2 (Цель 20/20)', title: 'Ловушка Self-Correction', items: ['Жди до конца фразы: спикер называет цену/дату и тут же правит себя ("Oh wait, actually...", "It used to be...").', 'Следи за лимитом слов (ONE WORD ONLY) и орфографией (accommodation, government, environment, Wednesday).'] },
    { tag: 'Parts 3–4', title: 'Перефраз и предсказание', items: ['В Part 3 точное слово из варианта A часто ловушка — слушай согласие ВТОРОГО студента.', 'За 30 сек до Part 4 подпиши часть речи в каждом пропуске и проверяй множественное число (-s).'] }
  ],
  speaking: [
    { tag: 'Part 2 (Cue Card)', title: 'Правило PPF на 2 минуты без пауз', items: ['Past (35 сек): как всё началось и предыстория.', 'Present (45 сек): детали, эмоции, почему это круто сейчас.', 'Future (35 сек): как это поможет дальше или что планируешь.'] },
    { tag: 'Part 3 (Band 7.5–8.5)', title: 'Живой ответ вместо эссе', items: ['Формула: Позиция ("Honestly, it cuts both ways...") → Причина ("mainly because...") → Контраст ("That said, for older generations...").', 'Замени "In my humble opinion / Firstly" на "To be completely honest / Off the top of my head / That said".'] }
  ]
};

const INTERESTS = [
  { id: 'netflix', label: 'Netflix / HBO' },
  { id: 'anime', label: 'Аниме' },
  { id: 'movies', label: 'Фильмы' },
  { id: 'sports', label: 'Спорт' },
  { id: 'gaming', label: 'Игры & Tech' },
  { id: 'books', label: 'Книги' },
  { id: 'articles', label: 'Статьи & Эссе' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'podcasts', label: 'Подкасты' }
];

const MEDIA_DB = [
  { id: 'n1', cat: 'netflix', plat: 'Netflix', skills: ['listening', 'speaking'], band: '7.5–8.5', title: 'Peaky Blinders', why: 'Мощная прокачка сложных британских акцентов. После Томми Шелби IELTS Listening кажется лёгкой прогулкой.', take: ['call the shots — принимать решения', 'on thin ice — на тонком льду'] },
  { id: 'n2', cat: 'netflix', plat: 'Netflix', skills: ['listening', 'speaking'], band: '7.0–8.5', title: 'Breaking Bad', why: 'Идеальный баланс разговорного американского и точной научной/жизненной лексики.', take: ['cross the line — перейти черту', 'take full responsibility — взять ответственность'] },
  { id: 'n3', cat: 'netflix', plat: 'Netflix', skills: ['speaking', 'writing'], band: '7.5–9.0', title: 'Better Call Saul', why: 'Юридические дебаты и филигранная аргументация — школа для Speaking Part 3 и Task 2.', take: ['bend the rules — обходить правила', 'make a compelling case — привести сильный аргумент'] },
  { id: 'n4', cat: 'netflix', plat: 'Netflix', skills: ['listening', 'writing'], band: '7.0–8.5', title: 'Black Mirror', why: 'Каждая серия — готовый банк аргументов для эссе про ИИ, соцсети и приватность.', take: ['unintended consequences — непредвиденные последствия', 'slippery slope — скользкая дорожка'] },
  { id: 'n5', cat: 'netflix', plat: 'Netflix', skills: ['listening', 'speaking'], band: '7.5–8.5', title: 'Mindhunter', why: 'Глубокие психологические интервью — крутая тренировка академической лексики.', take: ['underlying motive — скрытый мотив', 'draw a parallel — провести параллель'] },
  { id: 'n6', cat: 'netflix', plat: 'Netflix', skills: ['listening'], band: '7.5–9.0', title: 'The Crown', why: 'Эталонный классический британский и богатейший C1/C2 словарь политики.', take: ['uphold tradition — сохранять традицию', 'constitutional crisis — конституционный кризис'] },
  { id: 'n7', cat: 'netflix', plat: 'BBC', skills: ['listening'], band: '7.5–8.5', title: 'Sherlock (BBC)', why: 'Сверхбыстрая британская речь — после неё аудио IELTS Part 4 кажется замедленным.', take: ['jump to conclusions — делать поспешные выводы', 'plain sight — на самом виду'] },
  { id: 'n8', cat: 'netflix', plat: 'Apple TV+', skills: ['speaking', 'listening'], band: '6.5–8.0', title: 'Ted Lasso', why: 'Лучший сериал для естественного Speaking + идеальный контраст US и UK акцентов.', take: ['be on the same page — быть на одной волне', 'take it on the chin — стойко принять удар'] },
  { id: 'n9', cat: 'netflix', plat: 'HBO', skills: ['speaking', 'writing'], band: '8.0–9.0', title: 'Succession', why: 'Элитный C2 английский, переговоры, медиа и корпоративные конфликты.', take: ['read the room — чувствовать обстановку', 'leverage an advantage — использовать преимущество'] },
  { id: 'n10', cat: 'netflix', plat: 'Apple TV+', skills: ['listening', 'writing'], band: '7.0–8.5', title: 'Severance', why: 'Острая тема work-life balance и корпоративной культуры — хит в Task 2.', take: ['blur the boundary — размыть границу', 'mental compartmentalization — разделение сфер'] },
  { id: 'a1', cat: 'anime', plat: 'EN Dub', skills: ['listening', 'writing'], band: '7.0–8.5', title: 'Code Geass (English Dub)', why: 'Эталонный английский дубляж с лексикой политики, морали и стратегии.', take: ['justify the means — оправдывать средства', 'shift the balance of power — изменить баланс сил'] },
  { id: 'a2', cat: 'anime', plat: 'EN Dub', skills: ['listening', 'speaking'], band: '6.5–8.0', title: 'Death Note (English Dub)', why: 'Логика, дедукция и Conditionals в каждом диалоге L и Лайта.', take: ['draw a conclusion — сделать вывод', 'leap of logic — скачок в логике'] },
  { id: 'a3', cat: 'anime', plat: 'EN Dub', skills: ['listening', 'writing'], band: '7.0–8.5', title: 'Monster (English Dub)', why: 'Взрослый психологический триллер с размеренной чистой речью и моральными дилеммами.', take: ['moral compass — моральный компас', 'erode one\'s humanity — разрушать человечность'] },
  { id: 'a4', cat: 'anime', plat: 'EN Dub', skills: ['listening', 'speaking'], band: '7.0–8.5', title: 'Vinland Saga (English Dub)', why: 'Философские диалоги о насилии, мире и свободе — мощный словарь для эссе.', take: ['break the cycle — разорвать порочный круг', 'at any cost — любой ценой'] },
  { id: 'a5', cat: 'anime', plat: 'Netflix EN', skills: ['listening', 'speaking'], band: '7.0–8.5', title: 'Arcane (Original English)', why: 'Живая эмоциональная речь с разными акцентами и современными идиомами.', take: ['bridge the gap — сократить разрыв', 'tip the scales — перевесить чашу весов'] },
  { id: 'a6', cat: 'anime', plat: 'Netflix EN', skills: ['listening', 'speaking'], band: '6.5–8.0', title: 'Cyberpunk: Edgerunners (EN Dub)', why: 'Быстрый современный сленг + темы технологий и социального неравенства.', take: ['pay the price — заплатить цену', 'burn out — выгореть'] },
  { id: 'm1', cat: 'movies', plat: 'Film', skills: ['listening', 'writing'], band: '7.0–8.5', title: 'The Social Network', why: 'Молниеносные диалоги — лучший тренажёр скорости слуха + словарь стартапов.', take: ['intellectual property — интеллектуальная собственность', 'gain traction — набирать обороты'] },
  { id: 'm2', cat: 'movies', plat: 'Film', skills: ['listening', 'writing'], band: '7.5–8.5', title: 'Oppenheimer', why: 'Наука, этика и политика — 100% совпадение с серьёзными темами Listening Part 4.', take: ['ethical dilemma — этическая дилемма', 'point of no return — точка невозврата'] },
  { id: 'm3', cat: 'movies', plat: 'Film', skills: ['listening', 'writing'], band: '7.0–8.5', title: 'The Big Short', why: 'Сложная экономика объяснена живым языком — словарь по финансам и кризисам.', take: ['systemic failure — системный сбой', 'turn a blind eye — закрывать глаза'] },
  { id: 'm4', cat: 'movies', plat: 'Film', skills: ['listening', 'writing'], band: '6.5–8.0', title: 'Interstellar', why: 'Климат, ресурсы и наука — частые темы Reading Passage 3.', take: ['finite resources — ограниченные ресурсы', 'against all odds — вопреки всему'] },
  { id: 'm5', cat: 'movies', plat: 'Film', skills: ['speaking', 'listening'], band: '6.5–8.0', title: 'Moneyball', why: 'Аналитика, спорт и решения против системы — тонна живых фраз.', take: ['buck the trend — идти против тренда', 'undervalued asset — недооценённый ресурс'] },
  { id: 'm6', cat: 'movies', plat: 'Film', skills: ['listening', 'writing'], band: '7.0–8.5', title: 'Dune (Part One & Two)', why: 'Чёткая дикция, экология, политика и власть.', take: ['scarce resource — дефицитный ресурс', 'long-term vision — долгосрочное видение'] },
  { id: 'sp1', cat: 'sports', plat: 'YouTube', skills: ['listening', 'writing'], band: '6.5–8.0', title: 'Tifo Football / The Athletic', why: 'Аналитический британский с графиками — 1-в-1 под Listening Part 4 и Task 1.', take: ['marginal gains — небольшие решающие улучшения', 'outperform expectations — превзойти ожидания'] },
  { id: 'sp2', cat: 'sports', plat: 'Netflix', skills: ['listening', 'speaking'], band: '6.5–8.0', title: 'Formula 1: Drive to Survive', why: 'Микс британского, австралийского и европейского акцентов под давлением.', take: ['under immense pressure — под огромным давлением', 'pay off in the long run — окупиться в долгую'] },
  { id: 'sp3', cat: 'sports', plat: 'Netflix', skills: ['speaking', 'listening'], band: '7.0–8.0', title: 'The Last Dance', why: 'Мощный сторителлинг про дисциплину и лидерство — готовые примеры для Part 2.', take: ['relentless drive — неудержимое стремление', 'rise to the occasion — проявить себя'] },
  { id: 'sp4', cat: 'sports', plat: 'Prime Video', skills: ['listening', 'speaking'], band: '6.5–8.0', title: 'All or Nothing (Arsenal / Man City)', why: 'Реальная раздевалка, британский акцент тренеров без сценария.', take: ['bounce back — быстро оправиться', 'keep one\'s composure — сохранять хладнокровие'] },
  { id: 'g1', cat: 'gaming', plat: 'YouTube', skills: ['listening', 'writing'], band: '7.5–9.0', title: 'Jacob Geller (Video Essays)', why: 'Интеллектуальные видео-эссе про игры и архитектуру — уровень Band 8.5–9.0.', take: ['evoke a sense of — вызывать ощущение', 'subvert expectations — ломать ожидания'] },
  { id: 'g2', cat: 'gaming', plat: 'YouTube', skills: ['listening', 'speaking'], band: '6.5–8.0', title: 'MKBHD (Marques Brownlee)', why: 'Кристальный американский и идеальная структура аргументации.', take: ['diminishing returns — убывающая отдача', 'practical trade-off — практический компромисс'] },
  { id: 'g3', cat: 'gaming', plat: 'YouTube', skills: ['listening', 'writing'], band: '7.0–8.5', title: 'ColdFusion', why: 'Документалки про Apple, Nvidia, ИИ и экономику — идеальный формат для Part 4.', take: ['disrupt an industry — перевернуть индустрию', 'at a breakneck pace — в бешеном темпе'] },
  { id: 'g4', cat: 'gaming', plat: 'YouTube', skills: ['listening'], band: '7.0–8.0', title: 'Game Maker\'s Toolkit (GMTK)', why: 'Чистейший британский разбор систем и дизайна.', take: ['core loop — базовый цикл', 'intuitive design — интуитивный дизайн'] },
  { id: 'b1', cat: 'books', plat: 'Book', skills: ['reading', 'writing', 'speaking'], band: '6.5–8.0', title: 'Atomic Habits — James Clear', why: 'Лёгкий старт чтения на английском + тонна идей для эссе про дисциплину.', take: ['compound effect — накопительный эффект', 'frictionless environment — среда без трения'] },
  { id: 'b2', cat: 'books', plat: 'Book', skills: ['reading', 'writing'], band: '7.5–9.0', title: 'Sapiens — Yuval Noah Harari', why: 'Язык и глубина абзацев 1-в-1 как IELTS Reading Passage 3.', take: ['cognitive revolution — когнитивная революция', 'collective fiction — коллективный миф'] },
  { id: 'b3', cat: 'books', plat: 'Book', skills: ['reading', 'writing'], band: '7.5–9.0', title: 'Thinking, Fast and Slow — Kahneman', why: 'Когнитивные искажения — из этой книги буквально берут темы для Reading.', take: ['cognitive bias — когнитивное искажение', 'jump to conclusions — поспешные выводы'] },
  { id: 'b4', cat: 'books', plat: 'Book', skills: ['reading', 'speaking'], band: '7.0–8.5', title: '1984 — George Orwell', why: 'Короткая классика, качающая понимание подтекста и словарь по Government & Privacy.', take: ['constant surveillance — постоянная слежка', 'distort the truth — искажать правду'] },
  { id: 'b5', cat: 'books', plat: 'Book', skills: ['reading', 'speaking'], band: '6.5–8.0', title: 'Project Hail Mary — Andy Weir', why: 'Динамичный сай-фай — читается запоем и разгоняет скорость Reading.', take: ['trial and error — метод проб и ошибок', 'viable solution — рабочее решение'] },
  { id: 'ar1', cat: 'articles', plat: 'Web', skills: ['reading', 'writing'], band: '7.5–9.0', title: 'Aeon Essays', why: 'Золотой стандарт для выхода на Reading 8.5+. Читай 1 эссе раз в 2 дня.', take: ['erode trust — подрывать доверие', 'empirical evidence — эмпирические данные'], url: 'https://aeon.co/essays' },
  { id: 'ar2', cat: 'articles', plat: 'Web', skills: ['reading', 'speaking'], band: '7.0–8.5', title: 'Psyche Guides', why: 'Короче и живее Aeon, но с сочным C1 словарём про психологию.', take: ['mental bandwidth — ментальный ресурс', 'cognitive overload — когнитивная перегрузка'], url: 'https://psyche.co/guides' },
  { id: 'ar3', cat: 'articles', plat: 'Web', skills: ['reading', 'writing'], band: '7.5–9.0', title: 'The Guardian Long Reads', why: 'Эталонная британская журналистика про климат, города и технологии.', take: ['stark contrast — резкий контраст', 'systemic issue — системная проблема'] },
  { id: 'ar4', cat: 'articles', plat: 'Web', skills: ['reading', 'writing'], band: '7.0–8.5', title: 'Wait But Why', why: 'Длинные умные статьи про ИИ и прокрастинацию живым языком.', take: ['instant gratification — мгновенное удовольствие', 'exponential growth — экспоненциальный рост'] },
  { id: 'y1', cat: 'youtube', plat: 'YouTube', skills: ['listening', 'writing'], band: '7.0–8.5', title: 'Veritasium', why: 'Научные расследования на 15–20 минут — тренажёр концентрации для Part 4.', take: ['counterintuitive — вопреки интуиции', 'underlying mechanism — скрытый механизм'] },
  { id: 'y2', cat: 'youtube', plat: 'YouTube', skills: ['listening', 'writing'], band: '6.5–8.0', title: 'Kurzgesagt – In a Nutshell', why: 'Кристальный голос диктора, плотный академический словарь.', take: ['existential threat — экзистенциальная угроза', 'unprecedented scale — беспрецедентный масштаб'] },
  { id: 'y3', cat: 'youtube', plat: 'YouTube', skills: ['listening', 'writing'], band: '7.0–8.5', title: 'Vox Explainers', why: 'Короткие разборы урбанистики, экономики и истории — клад для Task 1 & 2.', take: ['root cause — первопричина', 'ripple effect — эффект домино'] },
  { id: 'y4', cat: 'youtube', plat: 'YouTube', skills: ['listening', 'speaking'], band: '7.5–8.5', title: 'LEMMiNO', why: 'Атмосферные мини-документалки с чистым, спокойным языком.', take: ['shrouded in mystery — окутано тайной', 'compelling evidence — веские доказательства'] },
  { id: 'p1', cat: 'podcasts', plat: 'Podcast', skills: ['listening', 'speaking'], band: '7.0–8.5', title: 'TED Talks Daily', why: '10–15 минут в день, разные мировые акценты и актуальные темы экзамена.', take: ['rethink our approach — пересмотреть подход', 'tangible impact — ощутимый эффект'] },
  { id: 'p2', cat: 'podcasts', plat: 'BBC', skills: ['listening', 'speaking'], band: '6.5–8.0', title: 'BBC 6 Minute English', why: 'Быстрый утренний разогрев на британском с разбором 6 выражений.', take: ['strike a balance — найти баланс', 'food for thought — пища для размышлений'] },
  { id: 'p3', cat: 'podcasts', plat: 'Podcast', skills: ['listening', 'speaking'], band: '7.0–8.5', title: 'The Diary of a CEO (Clips)', why: 'Живой британский разговорный английский про карьеру и привычки.', take: ['move the needle — реально изменить ситуацию', 'non-negotiable — не подлежит обсуждению'] }
];

const CLICHE_RULES = [
  { regex: /\bnowadays\b/gi, bad: 'nowadays', fix: 'in recent decades / increasingly' },
  { regex: /\bfirstly\b/gi, bad: 'firstly', fix: 'связывай по смыслу без нумерации (e.g. A primary driver is...)' },
  { regex: /\bsecondly\b/gi, bad: 'secondly', fix: 'Beyond this / Equally important' },
  { regex: /\bmoreover\b/gi, bad: 'moreover', fix: 'Furthermore / This is compounded by' },
  { regex: /\bin conclusion\b/gi, bad: 'in conclusion', fix: 'Ultimately / Overall' },
  { regex: /\bin my humble opinion\b/gi, bad: 'in my humble opinion', fix: 'I firmly believe / Honestly (Speaking)' },
  { regex: /\bvery bad\b/gi, bad: 'very bad', fix: 'genuinely detrimental / deeply harmful' },
  { regex: /\bvery good\b/gi, bad: 'very good', fix: 'remarkably effective / highly beneficial' },
  { regex: /\bbig problem\b/gi, bad: 'big problem', fix: 'pressing challenge / acute issue' },
  { regex: /\ba lot of\b/gi, bad: 'a lot of', fix: 'a substantial share of / numerous' }
];

function analyzeEssayLocally(text, taskMode = 'task2') {
  const clean = text.trim();
  const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
  const paragraphs = clean ? clean.split(/\n+/).filter(p => p.trim().length > 0).length : 0;
  const minWords = taskMode === 'task1' ? 150 : 250;

  const clichésFound = [];
  CLICHE_RULES.forEach(rule => {
    if (rule.regex.test(clean)) {
      clichésFound.push({ bad: rule.bad, fix: rule.fix });
    }
  });

  const hasNounClause = /what\s+\w+.*is\s+that|whether\s+\w+/i.test(clean);
  const hasInversion = /not only\s+(does|do|did|can|will|have)|rarely\s+have/i.test(clean);
  const hasConcession = /\b(while|although|admittedly|granted|whereas)\b/i.test(clean);
  const hasOverview = /\boverall\b/i.test(clean);

  return {
    words,
    minWords,
    paragraphs,
    clichésFound,
    hasNounClause,
    hasInversion,
    hasConcession,
    hasOverview
  };
}

function playTimerChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.46);
  } catch (e) {}
}

async function gradeWithGemini({ apiKey, text, mode, prompt }) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('NO_KEY');
  }

  const systemInstruction =
    mode === 'speaking'
      ? `You are a strict, realistic IELTS Speaking Examiner. Evaluate the candidate's spoken answer in Russian (keeping English examples natural US/UK Band 8.0+ without robotic essay linkers). Return concise Markdown with:
1) Estimated Band (FC, LR, GRA, Overall)
2) 3 concrete weaknesses
3) A natural, non-robotic Band 8.0 rewrite of the candidate's exact ideas.`
      : `You are a strict, official IELTS Academic Writing Examiner. Evaluate the candidate's ${mode === 'task1' ? 'Task 1' : 'Task 2'} response in Russian (with English rewrites). Return structured Markdown with:
1) Band Scores: TR/TA, CC, LR, GRA, Overall (realistic, no inflation)
2) Top 3 specific score-killers in their text
3) Exact upgraded rewrites of 2–3 of their weakest sentences into natural Band 8.0 English (using Noun Clauses, Inversion, or Concession where natural).`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemInstruction}\n\nPrompt: ${prompt || 'General IELTS Academic task'}\n\nCandidate response:\n${text}`
            }
          ]
        }
      ],
      generationConfig: { temperature: 0.4 }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API ${res.status}: ${errText.slice(0, 140)}`);
  }

  const data = await res.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) throw new Error('Пустой ответ от Gemini API');
  return reply;
}

const STORAGE_KEY = 'ielts_rasul_pwa_v1';

const DEFAULT_STATE = {
  theme: 'dark',
  apiKey: '',
  targetBand: 7.0,
  scores: { listening: 6.5, reading: 6.5, writing: 5.5, speaking: 7.0 },
  history: [{ date: 'Старт', overall: 6.5, l: 6.5, r: 6.5, w: 5.5, s: 7.0, note: 'Стартовая база' }],
  completedDays: [],
  selectedDay: 1,
  errorLog: {
    'Writing: Клише / бедная грамматика': 2,
    'Reading: T/F/NG & Y/N/NG': 1
  },
  writingDraft: '',
  writingChecklist: {},
  savedMedia: []
};

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      scores: { ...DEFAULT_STATE.scores, ...(parsed.scores || {}) },
      errorLog: parsed.errorLog || DEFAULT_STATE.errorLog,
      history: Array.isArray(parsed.history) && parsed.history.length ? parsed.history : DEFAULT_STATE.history
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function roundBand(v) {
  return Math.round(v * 2) / 2;
}

function formatSec(total) {
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function App() {
  const [data, setData] = useState(loadSavedState);
  const [tab, setTab] = useState('plan');
  const [toast, setToast] = useState('');

  // Modals
  const [showLogModal, setShowLogModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [logForm, setLogForm] = useState({ l: 6.5, r: 6.5, w: 5.5, s: 7.0, note: '', errorTag: '' });
  const [keyInput, setKeyInput] = useState('');

  // Writing state
  const [wSub, setWSub] = useState('builder'); // builder | task1 | grammar | check
  const [t2Idx, setT2Idx] = useState(0);
  const [t1Idx, setT1Idx] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState('');
  const [aiError, setAiError] = useState('');
  const editorRef = useRef(null);

  // Timers & L/R/S state
  const [timerMode, setTimerMode] = useState('reading'); // reading | writing | speaking
  const [timerPhase, setTimerPhase] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [playbookTab, setPlaybookTab] = useState('reading');
  const [speakingText, setSpeakingText] = useState('');
  const [speakingFeedback, setSpeakingFeedback] = useState('');
  const [speakingLoading, setSpeakingLoading] = useState(false);

  // Media state
  const [mediaQuery, setMediaQuery] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [mediaSkill, setMediaSkill] = useState('all');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [data]);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2300);
  };

  const overall = useMemo(() => {
    const { listening, reading, writing, speaking } = data.scores;
    return roundBand((listening + reading + writing + speaking) / 4);
  }, [data.scores]);

  const weakest = useMemo(() => {
    return Object.entries(data.scores).sort((a, b) => a[1] - b[1])[0];
  }, [data.scores]);

  const isDark = data.theme === 'dark';
  const ui = isDark
    ? {
        bg: 'bg-[#0b0b0d] text-zinc-100',
        outer: 'bg-[#070709]',
        header: 'bg-[#0b0b0d]/95 border-[#202027]',
        card: 'bg-[#141418] border-[#26262f]',
        cardSub: 'bg-[#0e0e11] border-[#222229]',
        pill: 'bg-[#1c1c22] border-[#2a2a34] text-zinc-200',
        btnPrimary: 'bg-[#fafafa] text-[#09090b]',
        muted: 'text-zinc-400',
        dock: 'bg-[#141418] border-[#2c2c35]',
        navActive: 'bg-[#23232b] text-white',
        input: 'bg-[#0e0e11] border-[#2a2a34] text-zinc-100 placeholder-zinc-500'
      }
    : {
        bg: 'bg-[#f6f5f2] text-zinc-900',
        outer: 'bg-[#e7e5e0]',
        header: 'bg-[#f6f5f2]/95 border-[#e2e0d8]',
        card: 'bg-white border-[#e4e2da] shadow-sm',
        cardSub: 'bg-[#f7f6f2] border-[#e6e4dc]',
        pill: 'bg-[#efeee9] border-[#dedcd3] text-zinc-800',
        btnPrimary: 'bg-[#111113] text-white',
        muted: 'text-zinc-500',
        dock: 'bg-white border-[#dfddd4] shadow-xl',
        navActive: 'bg-[#111113] text-white',
        input: 'bg-[#f7f6f2] border-[#dcdad1] text-zinc-900 placeholder-zinc-400'
      };

  // Timer phases config
  const timerConfigs = {
    reading: {
      label: 'Reading Split (15 / 20 / 25)',
      phases: [
        { name: 'Passage 1', sec: 15 * 60 },
        { name: 'Passage 2', sec: 20 * 60 },
        { name: 'Passage 3', sec: 25 * 60 }
      ]
    },
    writing: {
      label: 'Writing (20 / 40)',
      phases: [
        { name: 'Task 1 (150+ слов)', sec: 20 * 60 },
        { name: 'Task 2 (250+ слов)', sec: 40 * 60 }
      ]
    },
    speaking: {
      label: 'Speaking Cue Card (1 + 2)',
      phases: [
        { name: 'Подготовка (заметки PPF)', sec: 60 },
        { name: 'Ответ вслух (2 минуты)', sec: 120 }
      ]
    }
  };

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        playTimerChime();
        const phases = timerConfigs[timerMode].phases;
        if (timerPhase + 1 < phases.length) {
          const next = timerPhase + 1;
          setTimerPhase(next);
          notify(`Переход: ${phases[next].name}!`);
          return phases[next].sec;
        }
        setTimerRunning(false);
        notify('Время блока вышло!');
        return 0;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, timerMode, timerPhase]);

  const selectTimerMode = (mode) => {
    setTimerRunning(false);
    setTimerMode(mode);
    setTimerPhase(0);
    setSecondsLeft(timerConfigs[mode].phases[0].sec);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerPhase(0);
    setSecondsLeft(timerConfigs[timerMode].phases[0].sec);
  };

  // Local Essay Analysis
  const essayStats = useMemo(() => analyzeEssayLocally(data.writingDraft, 'task2'), [data.writingDraft]);

  const insertFrame = (frameText) => {
    const next = data.writingDraft
      ? `${data.writingDraft.trimEnd()}\n\n${frameText}`
      : frameText;
    setData((d) => ({ ...d, writingDraft: next }));
    notify('Рамка вставлена в редактор');
    if (editorRef.current) editorRef.current.focus();
  };

  const runGeminiWritingCheck = async () => {
    setAiError('');
    if (essayStats.words < 30) {
      notify('Напиши хотя бы 30 слов для проверки');
      return;
    }
    if (!data.apiKey) {
      setKeyInput('');
      setShowSettings(true);
      notify('Вставь бесплатный Gemini API ключ для живой проверки');
      return;
    }
    setAiLoading(true);
    try {
      const reply = await gradeWithGemini({
        apiKey: data.apiKey,
        text: data.writingDraft,
        mode: 'task2',
        prompt: TASK2_TYPES[t2Idx].prompt
      });
      setAiReport(reply);
    } catch (err) {
      setAiError(err.message === 'NO_KEY' ? 'Добавь Gemini API ключ в настройках.' : `Ошибка API: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const runGeminiSpeakingCheck = async () => {
    if (speakingText.trim().length < 20) {
      notify('Введи ответ Speaking (хотя бы 2–3 предложения)');
      return;
    }
    if (!data.apiKey) {
      setKeyInput('');
      setShowSettings(true);
      notify('Вставь бесплатный Gemini API ключ в настройках');
      return;
    }
    setSpeakingLoading(true);
    try {
      const reply = await gradeWithGemini({
        apiKey: data.apiKey,
        text: speakingText,
        mode: 'speaking',
        prompt: 'IELTS Speaking Part 2 / Part 3 response'
      });
      setSpeakingFeedback(reply);
    } catch (err) {
      setSpeakingFeedback(`Ошибка API: ${err.message}`);
    } finally {
      setSpeakingLoading(false);
    }
  };

  const toggleDayDone = (dayNum) => {
    setData((d) => {
      const exists = d.completedDays.includes(dayNum);
      const next = exists
        ? d.completedDays.filter((x) => x !== dayNum)
        : [...d.completedDays, dayNum];
      return { ...d, completedDays: next };
    });
  };

  const handleSaveMock = () => {
    const l = parseFloat(logForm.l);
    const r = parseFloat(logForm.r);
    const w = parseFloat(logForm.w);
    const s = parseFloat(logForm.s);
    const ov = roundBand((l + r + w + s) / 4);
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}`;

    setData((d) => {
      const nextErrors = { ...d.errorLog };
      if (logForm.errorTag) {
        nextErrors[logForm.errorTag] = (nextErrors[logForm.errorTag] || 0) + 1;
      }
      return {
        ...d,
        scores: { listening: l, reading: r, writing: w, speaking: s },
        history: [...d.history, { date: dateStr, overall: ov, l, r, w, s, note: logForm.note.trim() }],
        errorLog: nextErrors
      };
    });
    setShowLogModal(false);
    notify(`Сохранено! Overall: ${ov.toFixed(1)}`);
  };

  const filteredMedia = useMemo(() => {
    const q = mediaQuery.toLowerCase().trim();
    return MEDIA_DB.filter((m) => {
      const okInt = !selectedInterests.length || selectedInterests.includes(m.cat);
      const okSkill =
        mediaSkill === 'all'
          ? true
          : mediaSkill === 'saved'
          ? data.savedMedia.includes(m.id)
          : m.skills.includes(mediaSkill);
      const okQ = !q || `${m.title} ${m.plat} ${m.why} ${m.take.join(' ')}`.toLowerCase().includes(q);
      return okInt && okSkill && okQ;
    });
  }, [mediaQuery, selectedInterests, mediaSkill, data.savedMedia]);

  const sortedErrors = useMemo(() => {
    return Object.entries(data.errorLog).sort((a, b) => b[1] - a[1]);
  }, [data.errorLog]);

  const activeDayObj = BEAST_28_DAYS[data.selectedDay - 1] || BEAST_28_DAYS[0];
  const bandOptions = [4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];
  const skillNames = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking' };

  return (
    <div className={`min-h-screen w-full ${ui.outer} sm:py-4 flex justify-center`}>
      <div className={`w-full max-w-[430px] min-h-screen sm:min-h-[calc(100vh-32px)] sm:rounded-[34px] sm:border ${isDark ? 'sm:border-[#26262f]' : 'sm:border-[#d8d6ce]'} ${ui.bg} flex flex-col relative overflow-hidden shadow-2xl`}>

        {/* Header */}
        <header className={`sticky top-0 z-30 px-4 py-3 border-b ${ui.header} flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl ${ui.btnPrimary} font-extrabold text-xs flex items-center justify-center tracking-tight`}>
              IR
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight leading-none">IELTS.RASUL</div>
              <div className={`text-[11px] ${ui.muted} mt-0.5`}>
                Beast 28d • Цель {data.targetBand.toFixed(1)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setData((d) => ({ ...d, theme: d.theme === 'dark' ? 'light' : 'dark' }))}
              className={`w-8 h-8 rounded-full border ${ui.pill} flex items-center justify-center`}
              aria-label="Сменить тему"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => { setKeyInput(data.apiKey); setShowSettings(true); }}
              className={`w-8 h-8 rounded-full border ${ui.pill} flex items-center justify-center relative`}
              aria-label="Настройки API"
            >
              <Settings className="w-3.5 h-3.5" />
              {data.apiKey && <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5" />}
            </button>
            <button
              onClick={() => {
                setLogForm({
                  l: data.scores.listening,
                  r: data.scores.reading,
                  w: data.scores.writing,
                  s: data.scores.speaking,
                  note: '',
                  errorTag: ''
                });
                setShowLogModal(true);
              }}
              className={`px-2.5 py-1.5 rounded-full border ${ui.pill} text-xs font-bold flex items-center gap-1`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="font-mono">{overall.toFixed(1)}</span>
            </button>
          </div>
        </header>

        {/* Scroll Body */}
        <main className="flex-1 px-4 pt-4 pb-28 space-y-4 overflow-y-auto no-scrollbar">

          {/* ==================== TAB 1: 28-DAY PLAN & ERROR WALL ==================== */}
          {tab === 'plan' && (
            <div className="space-y-4">
              {/* Overview & Target */}
              <div className={`rounded-2xl border p-4 space-y-3.5 ${ui.card}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${ui.muted}`}>
                      28 дней • Режим зверя (4 ч/день)
                    </div>
                    <h1 className="text-lg font-extrabold tracking-tight mt-0.5">
                      {overall >= data.targetBand
                        ? `Цель Band ${data.targetBand.toFixed(1)} закрыта`
                        : `До Band ${data.targetBand.toFixed(1)} осталось +${(data.targetBand - overall).toFixed(1)}`}
                    </h1>
                    <p className={`text-xs ${ui.muted} mt-0.5`}>
                      Главный рычаг роста: <b className={isDark ? 'text-white' : 'text-zinc-900'}>{skillNames[weakest[0]]} ({weakest[1].toFixed(1)})</b>
                    </p>
                  </div>
                  <div className={`px-2.5 py-1.5 rounded-xl border ${ui.cardSub} text-center shrink-0`}>
                    <div className={`text-[10px] ${ui.muted}`}>Дней</div>
                    <div className="font-mono text-base font-extrabold text-emerald-400">{data.completedDays.length}/28</div>
                  </div>
                </div>

                {/* Target selector */}
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] ${ui.muted} mr-1`}>Цель:</span>
                  {[7.0, 7.5, 8.0, 8.5].map((b) => (
                    <button
                      key={b}
                      onClick={() => setData((d) => ({ ...d, targetBand: b }))}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition ${
                        data.targetBand === b ? ui.btnPrimary : ui.pill
                      }`}
                    >
                      {b.toFixed(1)}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {(['listening', 'reading', 'writing', 'speaking']).map((k) => (
                    <div key={k} className={`rounded-xl border p-2 text-center ${ui.cardSub}`}>
                      <div className={`text-[10px] ${ui.muted} capitalize`}>{k.slice(0, 1).toUpperCase() + k.slice(1)}</div>
                      <div className={`font-mono text-base font-extrabold mt-0.5 ${
                        k === weakest[0] ? 'text-rose-400' : data.scores[k] >= data.targetBand ? 'text-emerald-400' : ''
                      }`}>
                        {data.scores[k].toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setLogForm({
                      l: data.scores.listening,
                      r: data.scores.reading,
                      w: data.scores.writing,
                      s: data.scores.speaking,
                      note: '',
                      errorTag: ''
                    });
                    setShowLogModal(true);
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${ui.btnPrimary}`}
                >
                  <Plus className="w-4 h-4" /> Записать результат мока + ошибку
                </button>
              </div>

              {/* 28-Day Interactive Grid */}
              <div className={`rounded-2xl border p-4 space-y-3 ${ui.card}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold">Календарь 28 дней (4 недели)</h2>
                    <p className={`text-[11px] ${ui.muted}`}>Тапни на любой день, чтобы открыть точный план</p>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {BEAST_28_DAYS.map((d) => {
                    const done = data.completedDays.includes(d.day);
                    const selected = data.selectedDay === d.day;
                    return (
                      <button
                        key={d.day}
                        onClick={() => setData((st) => ({ ...st, selectedDay: d.day }))}
                        className={`h-9 rounded-xl font-mono text-xs font-bold border transition flex items-center justify-center ${
                          done
                            ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                            : selected
                            ? ui.btnPrimary
                            : ui.cardSub
                        }`}
                      >
                        {done ? <Check className="w-3.5 h-3.5" /> : d.day}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Day Detail */}
                <div className={`rounded-xl border p-3.5 space-y-2.5 ${ui.cardSub}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{activeDayObj.tag}</span>
                      <h3 className="text-xs font-extrabold mt-0.5">{activeDayObj.title}</h3>
                    </div>
                    <button
                      onClick={() => toggleDayDone(activeDayObj.day)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition shrink-0 ${
                        data.completedDays.includes(activeDayObj.day)
                          ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                          : ui.btnPrimary
                      }`}
                    >
                      {data.completedDays.includes(activeDayObj.day) ? 'Выполнено ✓' : 'Закрыть день'}
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {activeDayObj.blocks.map((b, i) => (
                      <div key={i} className={`text-xs leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        • {b}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Engnovate Practice Hub */}
              <div className={`rounded-2xl border p-4 space-y-3 ${ui.card}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold">Практика на Engnovate</h2>
                    <p className={`text-[11px] ${ui.muted}`}>Реальные моки там → статистика здесь</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ENGNOVATE_LINKS.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`rounded-xl border p-3 flex items-center justify-between gap-2 ${ui.pill}`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold">{item.title}</div>
                        <div className={`text-[10px] ${ui.muted} truncate`}>{item.sub}</div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 opacity-60 shrink-0" />
                    </a>
                  ))}
                </div>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                  {EXTRA_PRACTICE_LINKS.map((l) => (
                    <a
                      key={l.label}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`shrink-0 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium ${ui.cardSub}`}
                    >
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              </div>

              {/* Error Wall */}
              <div className={`rounded-2xl border p-4 space-y-3 ${ui.card}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <h2 className="text-sm font-bold">Error Wall (где сливаешь баллы)</h2>
                  </div>
                </div>
                {sortedErrors.length ? (
                  <div className="space-y-2">
                    {sortedErrors.slice(0, 5).map(([errName, count]) => (
                      <div key={errName} className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs ${ui.cardSub}`}>
                        <span className="truncate pr-2 font-medium">{errName}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold text-rose-400">×{count}</span>
                          <button
                            onClick={() =>
                              setData((d) => ({
                                ...d,
                                errorLog: { ...d.errorLog, [errName]: (d.errorLog[errName] || 0) + 1 }
                              }))
                            }
                            className={`w-6 h-6 rounded-md border text-xs font-bold ${ui.pill}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-xs ${ui.muted}`}>Пока пусто — отмечай ошибки при записи моков.</p>
                )}
              </div>

              {/* Score Progress Chart */}
              <div className={`rounded-2xl border p-4 space-y-3 ${ui.card}`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold">График прогресса</h2>
                  <span className={`font-mono text-[11px] ${ui.muted}`}>{data.history.length} зап.</span>
                </div>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.history.slice(-8)}>
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[4.5, 9]} tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} width={26} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#18181b' : '#ffffff',
                          borderColor: isDark ? '#27272a' : '#e4e4e7',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}
                      />
                      <Area type="monotone" dataKey="overall" stroke="#34d399" strokeWidth={2} fill="#34d399" fillOpacity={0.14} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 2: INTERACTIVE WRITING LAB ==================== */}
          {tab === 'writing' && (
            <div className="space-y-4">
              <div className={`rounded-2xl border p-4 space-y-3 ${ui.card}`}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Writing Lab • Band 7.0–8.5</span>
                  <h2 className="text-lg font-extrabold mt-0.5">Конструктор + Живой Детектор</h2>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'builder', label: 'Task 2' },
                    { id: 'task1', label: 'Task 1' },
                    { id: 'grammar', label: 'Грамм.' },
                    { id: 'check', label: 'Чек-лист' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setWSub(s.id)}
                      className={`py-2 rounded-xl text-[11px] font-bold border transition ${
                        wSub === s.id ? ui.btnPrimary : ui.pill
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {wSub === 'builder' && (
                <div className="space-y-3">
                  {/* Type pills */}
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    {TASK2_TYPES.map((t, i) => (
                      <button
                        key={t.id}
                        onClick={() => setT2Idx(i)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                          i === t2Idx ? ui.btnPrimary : ui.pill
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>

                  {/* Prompt + Collapsible Sentence Blueprint */}
                  <div className={`rounded-2xl border p-4 space-y-2.5 ${ui.card}`}>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${ui.muted}`}>
                      Схема по предложениям ({TASK2_TYPES[t2Idx].name})
                    </div>
                    <p className="text-xs italic leading-relaxed">"{TASK2_TYPES[t2Idx].prompt}"</p>
                    <details className={`rounded-xl border p-3 ${ui.cardSub}`}>
                      <summary className="flex items-center justify-between cursor-pointer text-xs font-bold">
                        <span>Открыть пошаговый план (S1–S12 + примеры 8.5)</span>
                        <ChevronDown className="w-4 h-4 opacity-60" />
                      </summary>
                      <div className="mt-3 space-y-2">
                        {TASK2_TYPES[t2Idx].steps.map((st) => (
                          <div key={st.id} className={`p-2.5 rounded-lg border text-xs space-y-1 ${ui.card}`}>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">{st.id}</span>
                              <span className={`text-[10px] font-semibold ${ui.muted}`}>{st.part}</span>
                              <span className="font-bold">{st.title}</span>
                            </div>
                            <p className={`text-[11px] leading-relaxed ${ui.muted}`}>{st.example}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>

                  {/* Interactive Editor + Frame Injector + Live Cliché Detector */}
                  <div className={`rounded-2xl border p-4 space-y-3 ${ui.card}`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold">Пиши эссе здесь</span>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className={essayStats.words >= 250 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {essayStats.words}/250 слов
                        </span>
                        <span className={ui.muted}>• {essayStats.paragraphs} абз.</span>
                      </div>
                    </div>

                    {/* 1-Tap Frame Injector */}
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                      {STARTER_FRAMES.map((f) => (
                        <button
                          key={f.label}
                          onClick={() => insertFrame(f.text)}
                          className={`shrink-0 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${ui.pill}`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <textarea
                      ref={editorRef}
                      rows={8}
                      value={data.writingDraft}
                      onChange={(e) => setData((d) => ({ ...d, writingDraft: e.target.value }))}
                      placeholder="Пиши свой Task 2 здесь — детектор клише и грамматики работает в реальном времени..."
                      className={`w-full rounded-xl border p-3 text-xs leading-relaxed focus:outline-none ${ui.input}`}
                    />

                    {/* Live Diagnostics */}
                    <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                      <span className={`px-2 py-1 rounded-md ${essayStats.hasNounClause ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-500/15 text-zinc-400'}`}>
                        {essayStats.hasNounClause ? '✓' : '○'} Noun Clause
                      </span>
                      <span className={`px-2 py-1 rounded-md ${essayStats.hasInversion ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-500/15 text-zinc-400'}`}>
                        {essayStats.hasInversion ? '✓' : '○'} Inversion
                      </span>
                      <span className={`px-2 py-1 rounded-md ${essayStats.hasConcession ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-500/15 text-zinc-400'}`}>
                        {essayStats.hasConcession ? '✓' : '○'} Concession
                      </span>
                    </div>

                    {essayStats.clichésFound.length > 0 && (
                      <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" /> Найдены клише (режут балл):
                        </div>
                        {essayStats.clichésFound.map((c) => (
                          <div key={c.bad} className="text-[11px] leading-snug">
                            <span className="text-rose-400 font-bold">"{c.bad}"</span> → <span className="text-emerald-400">{c.fix}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={runGeminiWritingCheck}
                      disabled={aiLoading}
                      className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${ui.btnPrimary} disabled:opacity-50`}
                    >
                      <Sparkles className="w-4 h-4" />
                      {aiLoading
                        ? 'Gemini Examiner проверяет...'
                        : data.apiKey
                        ? 'Проверить через Gemini 2.5 Examiner'
                        : 'Подключить бесплатный Gemini API для проверки'}
                    </button>

                    {aiError && <div className="text-xs text-rose-400">{aiError}</div>}

                    {aiReport && (
                      <div className={`rounded-xl border p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${ui.cardSub}`}>
                        {aiReport}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {wSub === 'task1' && (
                <div className="space-y-3">
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    {TASK1_TYPES.map((t, i) => (
                      <button
                        key={t.name}
                        onClick={() => setT1Idx(i)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border ${
                          i === t1Idx ? ui.btnPrimary : ui.pill
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                  <div className={`rounded-2xl border p-4 space-y-3 ${ui.card}`}>
                    <h3 className="text-sm font-extrabold">{TASK1_TYPES[t1Idx].name} — Формула 8 предложений</h3>
                    <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${ui.cardSub}`}>
                      <div><b>P1 (1 предл.):</b> Перефраз условия ("The chart compares...").</div>
                      <div><b>P2 — Overview (2 предл., БЕЗ цифр!):</b> <i>"{TASK1_TYPES[t1Idx].overview}"</i></div>
                      <div><b>P3 & P4 (по 2–3 предл.):</b> Группируй по смыслу (лидеры vs отстающие, растущие vs падающие).</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Словарь Band 8</div>
                      {TASK1_TYPES[t1Idx].vocab.map((v) => (
                        <div key={v} className="text-xs">• {v}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {wSub === 'grammar' && (
                <div className="space-y-3">
                  {GRAMMAR_WEAPONS.map((g) => (
                    <div key={g.name} className={`rounded-2xl border p-4 space-y-2 ${ui.card}`}>
                      <h3 className="text-sm font-extrabold">{g.name}</h3>
                      <div className={`font-mono text-[11px] rounded-xl border px-3 py-2 ${ui.cardSub}`}>{g.formula}</div>
                      <div className="text-xs text-rose-400"><b>Band 6:</b> {g.bad}</div>
                      <div className="text-xs text-emerald-400"><b>Band 8:</b> {g.good}</div>
                    </div>
                  ))}
                </div>
              )}

              {wSub === 'check' && (
                <div className={`rounded-2xl border p-4 space-y-2.5 ${ui.card}`}>
                  <h3 className="text-sm font-bold">Чек-лист перед сдачей эссе</h3>
                  {WRITING_CHECKLIST.map((c) => {
                    const checked = !!data.writingChecklist[c.id];
                    return (
                      <button
                        key={c.id}
                        onClick={() =>
                          setData((d) => ({
                            ...d,
                            writingChecklist: { ...d.writingChecklist, [c.id]: !checked }
                          }))
                        }
                        className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 ${ui.cardSub}`}
                      >
                        <span className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                          checked ? 'bg-emerald-400 text-zinc-950' : 'border border-zinc-500'
                        }`}>
                          {checked && <Check className="w-3.5 h-3.5" />}
                        </span>
                        <span className={`text-xs leading-relaxed ${checked ? 'line-through opacity-50' : ''}`}>
                          <b className="font-mono text-[10px] mr-1">[{c.crit}]</b> {c.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 3: EXAM TIMERS & L/R/S PLAYBOOK ==================== */}
          {tab === 'skills' && (
            <div className="space-y-4">
              {/* Exam Split Timers */}
              <div className={`rounded-2xl border p-4 space-y-3.5 ${ui.card}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Экзаменационные таймеры</span>
                    <h2 className="text-sm font-extrabold mt-0.5">{timerConfigs[timerMode].label}</h2>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${ui.cardSub}`}>
                    {timerConfigs[timerMode].phases[timerPhase].name}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'reading', label: 'Reading 15/20/25' },
                    { id: 'writing', label: 'Writing 20/40' },
                    { id: 'speaking', label: 'Speaking 1+2' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => selectTimerMode(m.id)}
                      className={`py-2 rounded-xl text-[11px] font-bold border transition ${
                        timerMode === m.id ? ui.btnPrimary : ui.pill
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className={`rounded-2xl border py-6 text-center ${ui.cardSub}`}>
                  <div className="font-mono text-5xl font-extrabold tracking-tight">{formatSec(secondsLeft)}</div>
                  <div className={`text-[11px] ${ui.muted} mt-1.5`}>
                    Со звуковым сигналом при переходе между частями
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setTimerRunning((r) => !r)}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${ui.btnPrimary}`}
                  >
                    {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {timerRunning ? 'Пауза' : 'Старт таймера'}
                  </button>
                  <button
                    onClick={resetTimer}
                    className={`px-4 py-3 rounded-xl border ${ui.pill}`}
                    aria-label="Сброс таймера"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* L/R/S Tactics */}
              <div className={`rounded-2xl border p-4 space-y-3 ${ui.card}`}>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['reading', 'listening', 'speaking']).map((s) => (
                    <button
                      key={s}
                      onClick={() => setPlaybookTab(s)}
                      className={`py-2 rounded-xl text-xs font-bold border capitalize ${
                        playbookTab === s ? ui.btnPrimary : ui.pill
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="space-y-2.5">
                  {SKILL_PLAYBOOKS[playbookTab].map((b) => (
                    <div key={b.title} className={`rounded-xl border p-3.5 space-y-2 ${ui.cardSub}`}>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{b.tag}</span>
                        <h3 className="text-xs font-extrabold mt-0.5">{b.title}</h3>
                      </div>
                      <div className="space-y-1.5">
                        {b.items.map((it, idx) => (
                          <div key={idx} className="text-xs leading-relaxed">• {it}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {playbookTab === 'speaking' && (
                  <div className={`rounded-xl border p-3.5 space-y-2.5 ${ui.cardSub}`}>
                    <div className="text-xs font-bold">Проверка ответа Speaking через Gemini</div>
                    <textarea
                      rows={3}
                      value={speakingText}
                      onChange={(e) => setSpeakingText(e.target.value)}
                      placeholder="Вставь или продиктуй свой ответ Part 2 / Part 3..."
                      className={`w-full rounded-xl border p-2.5 text-xs ${ui.input}`}
                    />
                    <button
                      onClick={runGeminiSpeakingCheck}
                      disabled={speakingLoading}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold ${ui.btnPrimary}`}
                    >
                      {speakingLoading ? 'Проверяю...' : 'Оценить и сделать натуральный Band 8'}
                    </button>
                    {speakingFeedback && (
                      <div className={`p-3 rounded-xl border text-xs whitespace-pre-wrap leading-relaxed ${ui.card}`}>
                        {speakingFeedback}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 4: 46+ MEDIA HUB ==================== */}
          {tab === 'media' && (
            <div className="space-y-4">
              <div className={`rounded-2xl border p-4 space-y-3 ${ui.card}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold">Медиатека ({MEDIA_DB.length} источников)</h2>
                    <p className={`text-xs ${ui.muted}`}>Netflix, HBO, аниме, кино, спорт, книги, эссе, YouTube</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold text-amber-400 ${ui.pill}`}>
                    ★ {data.savedMedia.length}
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 opacity-50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={mediaQuery}
                    onChange={(e) => setMediaQuery(e.target.value)}
                    placeholder="Поиск (Netflix, Anime, Sapiens, Football...)"
                    className={`w-full rounded-xl border pl-8 pr-3 py-2 text-xs ${ui.input}`}
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {INTERESTS.map((it) => {
                    const on = selectedInterests.includes(it.id);
                    return (
                      <button
                        key={it.id}
                        onClick={() =>
                          setSelectedInterests((prev) =>
                            on ? prev.filter((x) => x !== it.id) : [...prev, it.id]
                          )
                        }
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                          on ? ui.btnPrimary : ui.pill
                        }`}
                      >
                        {it.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
                  {[
                    { id: 'all', label: 'Всё' },
                    { id: 'listening', label: 'Listening' },
                    { id: 'reading', label: 'Reading' },
                    { id: 'writing', label: 'Writing идеи' },
                    { id: 'speaking', label: 'Speaking' },
                    { id: 'saved', label: '★ Сохранённые' }
                  ].map((sk) => (
                    <button
                      key={sk.id}
                      onClick={() => setMediaSkill(sk.id)}
                      className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                        mediaSkill === sk.id ? ui.btnPrimary : ui.cardSub
                      }`}
                    >
                      {sk.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredMedia.map((m) => {
                  const saved = data.savedMedia.includes(m.id);
                  return (
                    <div key={m.id} className={`rounded-2xl border p-4 space-y-2 ${ui.card}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ui.btnPrimary}`}>{m.plat}</span>
                            <span className="text-[10px] font-mono font-bold text-emerald-400">Band {m.band}</span>
                          </div>
                          <h3 className="text-sm font-bold mt-1">{m.title}</h3>
                        </div>
                        <button
                          onClick={() =>
                            setData((d) => ({
                              ...d,
                              savedMedia: saved
                                ? d.savedMedia.filter((x) => x !== m.id)
                                : [...d.savedMedia, m.id]
                            }))
                          }
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
                            saved ? 'bg-amber-400/20 border-amber-400/40 text-amber-400' : ui.pill
                          }`}
                          aria-label="Сохранить"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className={`text-xs leading-relaxed ${ui.muted}`}>{m.why}</p>
                      <div className={`rounded-xl border p-2.5 space-y-1 text-[11px] ${ui.cardSub}`}>
                        {m.take.map((t) => <div key={t}>• {t}</div>)}
                      </div>
                      {m.url && (
                        <a href={m.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold underline underline-offset-4">
                          Открыть <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {/* Bottom Dock */}
        <nav className={`fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[406px] z-40 border rounded-2xl p-1.5 grid grid-cols-4 gap-1 ${ui.dock}`}>
          {[
            { id: 'plan', label: 'План 28д', Icon: CalendarCheck },
            { id: 'writing', label: 'Writing', Icon: PenLine },
            { id: 'skills', label: 'Таймеры', Icon: Timer },
            { id: 'media', label: 'Медиа', Icon: Clapperboard }
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center justify-center py-2 rounded-xl transition ${
                tab === id ? ui.navActive : ui.muted
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-semibold mt-1">{label}</span>
            </button>
          ))}
        </nav>

        {/* Log Mock Modal */}
        {showLogModal && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-end sm:items-center justify-center p-4">
            <div className={`w-full max-w-[400px] rounded-3xl border p-5 space-y-4 ${ui.card}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold">Записать результат мока</h3>
                <button onClick={() => setShowLogModal(false)} className={`w-8 h-8 rounded-full border flex items-center justify-center ${ui.pill}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { k: 'l', label: 'Listening' },
                  { k: 'r', label: 'Reading' },
                  { k: 'w', label: 'Writing' },
                  { k: 's', label: 'Speaking' }
                ].map(({ k, label }) => (
                  <div key={k}>
                    <label className={`text-[11px] font-semibold ${ui.muted}`}>{label}</label>
                    <select
                      value={logForm[k]}
                      onChange={(e) => setLogForm((f) => ({ ...f, [k]: e.target.value }))}
                      className={`mt-1 w-full rounded-xl border px-3 py-2 text-xs font-mono font-bold ${ui.input}`}
                    >
                      {bandOptions.map((b) => <option key={b} value={b}>{b.toFixed(1)}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div>
                <label className={`text-[11px] font-semibold ${ui.muted}`}>Главная ошибка в этом моке (в Error Wall)</label>
                <select
                  value={logForm.errorTag}
                  onChange={(e) => setLogForm((f) => ({ ...f, errorTag: e.target.value }))}
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-xs ${ui.input}`}
                >
                  <option value="">— Не указывать —</option>
                  {ERROR_TYPES.map((err) => <option key={err} value={err}>{err}</option>)}
                </select>
              </div>
              <input
                type="text"
                value={logForm.note}
                onChange={(e) => setLogForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Короткая заметка (необязательно)"
                className={`w-full rounded-xl border px-3 py-2 text-xs ${ui.input}`}
              />
              <button onClick={handleSaveMock} className={`w-full py-3 rounded-xl text-xs font-bold ${ui.btnPrimary}`}>
                Сохранить результат
              </button>
            </div>
          </div>
        )}

        {/* Settings / Gemini API Key Modal */}
        {showSettings && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-end sm:items-center justify-center p-4">
            <div className={`w-full max-w-[400px] rounded-3xl border p-5 space-y-4 ${ui.card}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold">Живой Gemini API Examiner</h3>
                <button onClick={() => setShowSettings(false)} className={`w-8 h-8 rounded-full border flex items-center justify-center ${ui.pill}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className={`text-xs leading-relaxed ${ui.muted}`}>
                Вставь бесплатный ключ с{' '}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline font-bold">
                  Google AI Studio
                </a>
                . Ключ хранится только в памяти твоего браузера и включает настоящую проверку Writing и Speaking через Gemini 2.5 Flash.
              </p>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className={`w-full rounded-xl border px-3 py-2.5 text-xs font-mono ${ui.input}`}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setData((d) => ({ ...d, apiKey: keyInput.trim() }));
                    setShowSettings(false);
                    notify(keyInput.trim() ? 'Gemini API ключ сохранён!' : 'Ключ очищен');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${ui.btnPrimary}`}
                >
                  Сохранить ключ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-xs font-bold shadow-xl ${ui.btnPrimary}`}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
