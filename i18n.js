(() => {
  const RU = {
    title: 'k0te1ch — бэкенд-разработчик и системный архитектор',
    description: 'Бэкенд-разработчик и системный архитектор. Python, C++, Telegram-боты. Проекты: PodBoxBot, PowerPeek, DialogEngine, python-template.',
    skip: 'К проектам',
    h1: 'Бэкенд-разработчик и системный архитектор',
    lead: 'Проектирую и строю бэкенд-системы, которые масштабируются и решают реальные задачи.',
    f1: '<span class="p">→</span> архитектура бэкенда и API',
    f2: '<span class="p">→</span> производительность и оптимизация (C++ / Python)',
    f3: '<span class="p">→</span> системный дизайн и масштабирование',
    f4: '<span class="p">→</span> продукты, которые приносят деньги',
    w1h: 'Telegram-боты и автоматизация',
    c1p: 'Боты, которые делают настоящую работу: публикуют выпуски подкастов, ведут диалоги-анкеты. Python, aiogram.',
    w2h: 'Событийные бэкенды',
    c2p: 'Сервисы общаются через Kafka, работают в Docker и выкатываются через CI. Мониторинг на Prometheus, Loki и Grafana.',
    w3h: 'Нативные утилиты для Windows',
    c3p: 'Десктопные утилиты на C++20: быстро запускаются и мало весят. Один исполняемый файл, без установщика и сетевого кода.',
    w4h: 'Инструменты для разработчиков',
    c4p: 'Библиотеки и шаблоны, на которых строятся другие проекты: движок диалогов, шаблон проекта на aiogram, шаблон Python-проекта.',
    c5p: 'Telegram-бот, который автоматизирует публикацию выпусков для настоящей команды подкаста: теги mp3, загрузка по FTP, посты в WordPress с метаданными Podlove.',
    c1l: '<li>Микросервисы: бот отправляет запрос в Kafka, сервисы публикации (FTP, WordPress, Boosty) выполняют его и отчитываются</li><li>Наблюдаемость на Prometheus, Loki и Grafana, дашборды на русском</li><li>CI и автоматические релизы, их уже 12</li>',
    c6p: 'Заряд устройств в трее Windows: живая иконка, звуки и уведомления о низком заряде, история зарядки.',
    c2l: '<li>Один исполняемый файл на 4 МБ: без установщика, рантайма и телеметрии</li><li>Иконка в трее рисуется на лету: батарейка, кольцо или просто проценты</li><li>Семь звуковых событий и уведомления Fluent, которые не отнимают фокус у игры</li>',
    c7p: 'Лёгкий движок диалогов для Telegram-ботов с анкетами, без лапши из хендлеров.',
    c3l: '<li>Диалог описывается данными: dict, JSON или YAML</li><li>Синхронные и асинхронные валидаторы, условные переходы, статусы сессий</li><li>Чистый Python, только стандартная библиотека; интеграции с pydantic и aiogram по желанию</li>',
    c8p: 'Готовый шаблон Python-проекта: структура, зависимости, тесты, линтеры и CI с первого коммита.',
    c4l: '<li>Логирование, настройки из <code>.env</code> через pydantic-settings, pytest и Poetry из коробки</li><li>Ruff, pre-commit и commitizen для Conventional Commits</li><li>Релизы, changelog и теги автоматически через release-please в CI</li>',
    footer: 'собрать → проверить → масштабировать → монетизировать',
  };
  const KEY = 'lang';
  const nodes = [...document.querySelectorAll('[data-i18n]')];
  const desc = document.querySelector('meta[name="description"]');
  const EN = Object.fromEntries(nodes.map((el) => [el.dataset.i18n, el.innerHTML]));
  EN.description = desc.content;
  const btn = document.getElementById('lang');

  const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const save = (v) => { try { localStorage.setItem(KEY, v); } catch { /* storage blocked: choice lasts for this visit */ } };

  function detect() {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'ru' || q === 'en') return q;
    const stored = read();
    if (stored === 'ru' || stored === 'en') return stored;
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language || 'en'];
    return langs.some((l) => /^(ru|uk|be|kk)\b/i.test(l)) ? 'ru' : 'en';
  }

  function apply(lang) {
    const dict = lang === 'ru' ? RU : EN;
    for (const el of nodes) {
      const v = dict[el.dataset.i18n];
      if (v !== undefined) el.innerHTML = v;
    }
    desc.content = dict.description;
    document.documentElement.lang = lang;
    btn.textContent = lang === 'ru' ? 'EN' : 'RU';
    btn.setAttribute('aria-label', lang === 'ru' ? 'Switch to English' : 'Переключить на русский');
  }

  let current = detect();
  apply(current);
  btn.addEventListener('click', () => {
    current = current === 'ru' ? 'en' : 'ru';
    save(current);
    apply(current);
  });
})();
