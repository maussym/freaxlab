export type Locale = "ru" | "kk" | "en";

const translations = {
  // ── Hero Section ──
  "hero.tagline": {
    ru: "КЛИНИЧЕСКАЯ ПОДДЕРЖКА РЕШЕНИЙ",
    kk: "КЛИНИКАЛЫҚ ШЕШІМДЕРДІ ҚОЛДАУ",
    en: "CLINICAL DECISION SUPPORT",
  },
  "hero.title1": {
    ru: "КЛИНИЧЕСКАЯ",
    kk: "КЛИНИКАЛЫҚ",
    en: "CLINICAL",
  },
  "hero.title2": {
    ru: "ДИАГНОСТИКА",
    kk: "ДИАГНОСТИКА",
    en: "DIAGNOSIS",
  },
  "hero.title3": {
    ru: "АССИСТЕНТ",
    kk: "КӨМЕКШІ",
    en: "ASSISTANT",
  },
  "hero.description": {
    ru: "AI-система диагностики на основе клинических протоколов Республики Казахстан. Введите симптомы \u2014 получите диагнозы с кодами МКБ-10.",
    kk: "Қазақстан Республикасының клиникалық хаттамаларына негізделген AI-диагностика жүйесі. Симптомдарды енгізіңіз \u2014 МКБ-10 кодтарымен диагноз алыңыз.",
    en: "AI-powered diagnostic system based on clinical protocols of the Republic of Kazakhstan. Enter symptoms \u2014 receive ICD-10 coded diagnoses.",
  },
  "hero.startBtn": {
    ru: "НАЧАТЬ ДИАГНОСТИКУ",
    kk: "ДИАГНОСТИКАНЫ БАСТАУ",
    en: "START DIAGNOSIS",
  },
  "hero.docsBtn": {
    ru: "ДОКУМЕНТАЦИЯ",
    kk: "ҚҰЖАТТАМА",
    en: "DOCUMENTATION",
  },

  // ── How It Works ──
  "how.sectionTag": {
    ru: "КАК ЭТО РАБОТАЕТ",
    kk: "ҚАЛАЙ ЖҰМЫС ІСТЕЙДІ",
    en: "HOW IT WORKS",
  },
  "how.title": {
    ru: "КАК ЭТО",
    kk: "ҚАЛАЙ",
    en: "HOW IT",
  },
  "how.titleAccent": {
    ru: "РАБОТАЕТ",
    kk: "ЖҰМЫС ІСТЕЙДІ",
    en: "WORKS",
  },
  "how.subtitle": {
    ru: "Три простых шага от описания симптомов до клинического заключения",
    kk: "Симптомдарды сипаттаудан клиникалық қорытындыға дейін үш қарапайым қадам",
    en: "Three simple steps from describing symptoms to clinical conclusion",
  },
  "how.step1.title": {
    ru: "ОПИШИТЕ СИМПТОМЫ",
    kk: "СИМПТОМДАРДЫ СИПАТТАҢЫЗ",
    en: "DESCRIBE SYMPTOMS",
  },
  "how.step1.desc": {
    ru: "Введите жалобы пациента в свободной форме на русском или казахском языке",
    kk: "Науқастың шағымдарын қазақ немесе орыс тілінде еркін формада енгізіңіз",
    en: "Enter patient complaints in free form in Russian or Kazakh language",
  },
  "how.step2.title": {
    ru: "AI АНАЛИЗИРУЕТ",
    kk: "AI ТАЛДАЙДЫ",
    en: "AI ANALYZES",
  },
  "how.step2.desc": {
    ru: "GPT-OSS модель сопоставляет данные с 1000+ клиническими протоколами МЗ РК",
    kk: "GPT-OSS моделі деректерді ҚР ДСМ 1000+ клиникалық хаттамаларымен салыстырады",
    en: "GPT-OSS model matches data against 1000+ clinical protocols of MoH RK",
  },
  "how.step3.title": {
    ru: "ПОЛУЧИТЕ ДИАГНОЗ",
    kk: "ДИАГНОЗ АЛЫҢЫЗ",
    en: "GET DIAGNOSIS",
  },
  "how.step3.desc": {
    ru: "Результат с кодами МКБ-10, ранжированием по вероятности и объяснениями",
    kk: "МКБ-10 кодтарымен, ықтималдық бойынша ранжирлеумен және түсіндірмелермен нәтиже",
    en: "Results with ICD-10 codes, probability ranking and explanations",
  },

  // ── About Project ──
  "about.sectionTag": {
    ru: "О ПРОЕКТЕ",
    kk: "ЖОБА ТУРАЛЫ",
    en: "ABOUT",
  },
  "about.title": {
    ru: "О",
    kk: "ЖОБА",
    en: "ABOUT",
  },
  "about.titleAccent": {
    ru: "ПРОЕКТЕ",
    kk: "ТУРАЛЫ",
    en: "PROJECT",
  },
  "about.description": {
    ru: "Система построена на <accent>1000+ клинических протоколах</accent> Министерства Здравоохранения Республики Казахстан. Используя модель GPT-OSS, система анализирует симптомы и выдаёт диагнозы с кодами международной классификации болезней МКБ-10.",
    kk: "Жүйе Қазақстан Республикасы Денсаулық сақтау министрлігінің <accent>1000+ клиникалық хаттамаларына</accent> негізделген. GPT-OSS моделін пайдалана отырып, жүйе симптомдарды талдайды және аурулардың халықаралық жіктелімі МКБ-10 кодтарымен диагноз береді.",
    en: "The system is built on <accent>1000+ clinical protocols</accent> of the Ministry of Health of the Republic of Kazakhstan. Using the GPT-OSS model, the system analyzes symptoms and provides diagnoses with ICD-10 disease classification codes.",
  },
  "about.stat1": {
    ru: "Клинических протоколов",
    kk: "Клиникалық хаттамалар",
    en: "Clinical protocols",
  },
  "about.stat2": {
    ru: "Кодов МКБ-10",
    kk: "МКБ-10 кодтары",
    en: "ICD-10 codes",
  },
  "about.stat3": {
    ru: "Среднее время ответа",
    kk: "Орташа жауап уақыты",
    en: "Avg response time",
  },
  "about.stat3Suffix": {
    ru: " сек",
    kk: " сек",
    en: " sec",
  },

  // ── Partners ──
  "partners.sectionTag": {
    ru: "ТЕХНОЛОГИИ",
    kk: "ТЕХНОЛОГИЯЛАР",
    en: "TECH STACK",
  },
  "partners.title": {
    ru: "ТЕХНОЛОГИИ &",
    kk: "ТЕХНОЛОГИЯЛАР &",
    en: "TECHNOLOGIES &",
  },
  "partners.titleAccent": {
    ru: "ПАРТНЁРЫ",
    kk: "СЕРІКТЕСТЕР",
    en: "PARTNERS",
  },

  // ── Footer ──
  "footer.description": {
    ru: "AI-система клинической диагностики на основе клинических протоколов Министерства Здравоохранения Республики Казахстан",
    kk: "Қазақстан Республикасы Денсаулық сақтау министрлігінің клиникалық хаттамаларына негізделген AI клиникалық диагностика жүйесі",
    en: "AI clinical diagnostics system based on clinical protocols of the Ministry of Health of the Republic of Kazakhstan",
  },
  "footer.links": {
    ru: "ССЫЛКИ",
    kk: "СІЛТЕМЕЛЕР",
    en: "LINKS",
  },
  "footer.team": {
    ru: "КОМАНДА",
    kk: "КОМАНДА",
    en: "TEAM",
  },
  "footer.disclaimer": {
    ru: "\u26A0 ДИСКЛЕЙМЕР: Данная система не заменяет консультацию квалифицированного врача. Результаты носят исключительно ознакомительный характер и не являются медицинским заключением.",
    kk: "\u26A0 ЕСКЕРТУ: Бұл жүйе білікті дәрігердің кеңесін алмастырмайды. Нәтижелер тек танысу сипатында және медициналық қорытынды болып табылмайды.",
    en: "\u26A0 DISCLAIMER: This system does not replace consultation with a qualified physician. Results are for informational purposes only and do not constitute a medical conclusion.",
  },

  // ── Chat ──
  "chat.back": {
    ru: "\u2190 НАЗАД",
    kk: "\u2190 АРТҚА",
    en: "\u2190 BACK",
  },
  "chat.sessionInfo": {
    ru: "СЕССИЯ АКТИВНА \u00B7 МКБ-10 \u00B7 GPT-OSS",
    kk: "СЕССИЯ БЕЛСЕНДІ \u00B7 МКБ-10 \u00B7 GPT-OSS",
    en: "SESSION ACTIVE \u00B7 ICD-10 \u00B7 GPT-OSS",
  },
  "chat.emptyHint": {
    ru: "Опишите симптомы для начала диагностики",
    kk: "Диагностиканы бастау үшін симптомдарды сипаттаңыз",
    en: "Describe symptoms to start diagnosis",
  },
  "chat.patient": {
    ru: "ПАЦИЕНТ",
    kk: "НАУҚАС",
    en: "PATIENT",
  },
  "chat.placeholder": {
    ru: "Опишите симптомы пациента...",
    kk: "Науқастың симптомдарын сипаттаңыз...",
    en: "Describe patient symptoms...",
  },
  "chat.send": {
    ru: "ОТПР.",
    kk: "ЖІБЕРУ",
    en: "SEND",
  },
  "chat.foundDiagnoses": {
    ru: "возможных диагнозов:",
    kk: "ықтимал диагноз:",
    en: "possible diagnoses found:",
  },
  "chat.error": {
    ru: "Ошибка",
    kk: "Қате",
    en: "Error",
  },
  "chat.unknownError": {
    ru: "Произошла непредвиденная ошибка",
    kk: "Күтпеген қате орын алды",
    en: "An unexpected error occurred",
  },
} as const;

export type TranslationKey = keyof typeof translations;

export default translations;
