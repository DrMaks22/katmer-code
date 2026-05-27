Это дизайн-система для всех HTML-отчётов. Когда любой навык создаёт HTML-отчёт, строго следуй этим правилам.

## Соглашение по файлам
- Расположение: подкаталог `reports/` в рабочем каталоге
- Именование: `{YYYY-MM-DD}-{skill-name}-{topic-kebab}.html`
- Один автономный HTML-файл, без внешних зависимостей, кроме CDN-шрифтов

## Философия дизайна
Эстетика академической книги — Crimson Pro serif для основного текста, JetBrains Mono для меток / кода. Кремовый фон, тёмно-бордовые акценты. Минималистично, типографично, достойно печати.

## CSS-переменные (используй именно их)
```css
:root {
  --bg: #f4f0e8;
  --text: #1a1a1a;
  --text-muted: #555;
  --text-light: #888;
  --accent: #7b2d26;
  --border: #c8bfa8;
  --border-light: #ddd5c4;
  --success: #2d5f2d;
  --warn: #8a6914;
}
```

## Шрифты (импорт Google Fonts)
```css
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=JetBrains+Mono:wght@400&display=swap');
```
- Основной текст: `'Crimson Pro', Georgia, serif` — 17px, line-height 1.7
- Моноширинные метки: `'JetBrains Mono', monospace` — 10-12px, uppercase, letter-spacing 0.08-0.12em

## Макет страницы
```css
.page { max-width: 1080px; margin: 0 auto; padding: 48px 40px 80px; }
body { background: var(--bg); color: var(--text); }
```

## Шаблон шапки
Каждый отчёт начинается так:
```html
<div class="header">
  <div class="header-meta">ТИП ОТЧЁТА · ДАТА</div>
  <div class="header-body">
    <div class="header-title-block">
      <h1>Заголовок отчёта</h1>
      <div class="header-subtitle">Подзаголовок или описание</div>
    </div>
    <div class="header-score-block">
      <div class="score-big">3.8<span class="score-denom">/5</span></div>
      <div class="score-label">Общая оценка</div>
      <span class="badge badge--accept">Небольшие доработки</span>
    </div>
  </div>
</div>
```
- `header-meta`: JetBrains Mono, 11px, uppercase, светло-серый
- `h1`: 22px, вес 600, letter-spacing -0.02em
- `score-big`: 48px, вес 300, цвет акцента
- Нижняя граница шапки: `border-bottom: 2px solid var(--text)`

## Панель метрик (сводные числа)
```html
<div class="stats">
  <div class="stat"><div class="stat-value">42</div><div class="stat-label">Источники</div></div>
  <div class="stat"><div class="stat-value">8</div><div class="stat-label">Разделы</div></div>
  <!-- ... -->
</div>
```
- Сетка: `grid-template-columns: repeat(4, 1fr)`
- Верхняя / нижняя границы: 1.5px solid var(--border)
- `stat-value`: 26px, вес 300, цвет акцента
- `stat-label`: JetBrains Mono, 10px, uppercase

## Заголовки разделов
```css
h2 {
  font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--accent); border-bottom: 1.5px solid var(--accent);
  padding-bottom: 6px; margin-bottom: 20px; margin-top: 40px; font-weight: 600;
}
```

## Бейджи и флаги
```css
.badge { font-size: 11px; font-family: mono; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 10px; border: 1.5px solid; }
.badge--accept { border-color: var(--success); color: var(--success); }
.badge--warn { border-color: var(--warn); color: var(--warn); }
.badge--accent { border-color: var(--accent); color: var(--accent); }
```

## Таблицы данных
```css
thead th { font-size: 11px; font-family: mono; uppercase; letter-spacing: 0.08em; color: var(--text-muted); border-bottom: 1.5px solid var(--text); }
tbody td { padding: 10px; border-bottom: 0.5px solid var(--border-light); }
tbody tr:last-child td { border-bottom: 1.5px solid var(--border); }
```

## Полосы оценки (встроенный прогресс)
```html
<span class="score-bar" style="width:80px;background:var(--success)"></span>
<span class="score-num">4/5</span>
```
- Высота 5px, border-radius 1px
- Цвет по оценке: ≥4 success, 3 warn, ≤2 accent

## Аккордеонные секции (details/summary)
```html
<details>
  <summary>
    <span class="summary-left">
      <span class="summary-kode">K1</span>
      <span class="summary-title">Оригинальность</span>
    </span>
    <span class="summary-score">4/5</span>
    <span class="summary-arrow">▸</span>
  </summary>
  <div class="acc-body">
    <p>Текст оценки...</p>
    <div class="rec-box">Рекомендация: ...</div>
  </div>
</details>
```
- На summary не должно быть маркеров списка
- Стрелка поворачивается на 90deg при раскрытии
- `acc-body`: отступ слева 44px
- `rec-box`: левая граница 2px акцента, светлый акцентный фон, курсив

## Графики (Chart.js)
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```
- Радиальный график для многокритериальной оценки
- Цвета: `rgba(123, 45, 38, 0.2)` fill, `rgb(123, 45, 38)` border
- Точка: `rgb(123, 45, 38)`, radius 4
- Сетка: `color: '#c8bfa8'`
- Шкала 0-5, шрифт: Crimson Pro

## Сеточные макеты
```css
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
```

## Блок рекомендации
```css
.rec-box { padding: 10px 14px; border-left: 2px solid var(--accent); background: rgba(123,45,38,0.04); font-style: italic; color: var(--text-muted); }
```

## Подвал
```html
<div class="footer">Создано KatmerCode · {date}</div>
```
```css
.footer { margin-top: 60px; padding-top: 16px; border-top: 1px solid var(--border); font-family: mono; font-size: 11px; color: var(--text-light); text-align: center; }
```

## Семантика цветового кодирования
- **Успех/Хорошо**: `var(--success)` #2d5f2d — подтверждено, высокая оценка, принято
- **Предупреждение/Внимание**: `var(--warn)` #8a6914 — частичное совпадение, средняя оценка, требует доработки
- **Ошибка/Критично**: `var(--accent)` #7b2d26 — не найдено, низкая оценка, отклонено
- **Нейтрально**: `var(--border)` #c8bfa8 — не проверено, н/д

## НЕ ДЕЛАЙ
- Не используй Tailwind CDN — применяй CSS выше
- Не используй яркие / насыщенные цвета — всё должно оставаться приглушённым и академичным
- Не используй sans-serif для основного текста — всегда Crimson Pro serif
- Не используй скругление углов больше 2px
- Не добавляй тени — используй только границы
