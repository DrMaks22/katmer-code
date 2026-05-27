Построй сеть цитирования на основе "$ARGUMENTS".

Входными данными могут быть:
- Один или несколько DOI: "10.1038/s41586-023-06221-2"
- Названия статей: "Attention is All You Need"
- Смешанный вариант: "10.1038/... + transformer architecture survey"

## ОСНОВНОЙ ПОТОК

```
Основная сессия — координация
  │
  ├── ШАГ 1: Разрешить исходные статьи (самостоятельно)
  ├── ШАГ 2: Субагент → собрать ссылки и цитирования, построить сеть
  ├── ШАГ 3: Субагент → определить ключевые узлы и кластеры
  └── ШАГ 4: Субагент отчёта → HTML-визуализация на vis.js
```

## ШАГ 1: Разреши исходные статьи (самостоятельно)

Для каждого входного элемента:

**Если указан DOI:**
```
WebFetch: https://api.semanticscholar.org/graph/v1/paper/DOI:{doi}?fields=paperId,title,authors,year,venue,citationCount,references.paperId,references.title,references.authors,references.year,references.citationCount,references.externalIds,citations.paperId,citations.title,citations.authors,citations.year,citations.citationCount,citations.externalIds
```

**Если указано название:**
```
WebFetch: https://api.semanticscholar.org/graph/v1/paper/search?query={title}&limit=1&fields=paperId,title,authors,year
```
Затем используй paperId для полного запроса выше.

## ШАГ 2: Построй сеть (субагент)

Запусти субагента:

```
ЗАДАЧА: Построй сеть цитирования на основе исходных статей.

ИСХОДНЫЕ СТАТЬИ (со списком ссылок и цитирований):
{data from step 1}

ПРОЦЕСС:
1. Для каждой исходной статьи перечисли её ссылки (назад по цепочке) и цитирования (вперёд по цепочке)

2. Найди ПЕРЕСЕЧЕНИЯ: статьи, встречающиеся в списках нескольких исходных работ
   Это КЛЮЧЕВЫЕ СТАТЬИ области.

3. Для 10 наиболее связанных статей подтяни их ссылки ещё на один уровень глубже:
   WebFetch: https://api.semanticscholar.org/graph/v1/paper/{paperId}?fields=title,authors,year,citationCount,references.title,references.citationCount

4. Также проверь OpenCitations на дополнительные связи:
   WebFetch: https://opencitations.net/index/api/v2/citations/{doi}
   WebFetch: https://opencitations.net/index/api/v2/references/{doi}

5. Определи кластеры:
   - Методологические (общие методы)
   - Временные (фундаментальные и более новые)
   - Тематические (общие ключевые слова темы)

ВЫХОД:
- Список узлов: [{id, title, authors, year, citations, role: seed|key|bridge|peripheral}]
- Список рёбер: [{source, target, type: cites}]
- Кластеры: [{name, papers, description}]
- Ключевые статьи: топ-10 по связности
- Фундаментальные работы: часто цитируемые, старше 10 лет
- Современный фронтир: последние 2 года, с ростом цитирований
```

## ШАГ 3: Инсайты (самостоятельно или через субагента)

На основе сетевых данных определи:
- **Знаковые статьи**: наибольшее число цитирований, упоминаются большинством исходных работ
- **Мостовые статьи**: соединяют разные кластеры
- **Восходящие работы**: пока мало цитирований в целом, но много в последнее время
- **Исследовательский фронтир**: самые новые статьи, которые цитируют исходные работы

## ШАГ 4: HTML-визуализация (субагент отчёта)

```
Файл: reports/{date}-citation-network-{topic}.html

ВКЛЮЧАЕТ:
1. Граф сети — vis.js (CDN: https://unpkg.com/vis-network/standalone/umd/vis-network.min.js)
   - Размер узлов зависит от числа цитирований
   - Цвет зависит от кластера
   - Исходные статьи выделены (форма звезды)
   - Клик по узлу → панель деталей

2. Временная шкала — горизонтальная, статьи в виде точек на оси лет
   - Соединены стрелками цитирования
   - Цвет зависит от кластера

3. Таблица ключевых статей:
   | # | Название | Авторы | Год | Цитирует | Роль | Кластер |

4. Карточки сводки по кластерам

5. Статистика:
   - Общее число статей в сети
   - Диапазон дат
   - Наиболее продуктивные авторы
   - Наиболее часто встречающиеся журналы

ДИЗАЙН: Tailwind CDN + vis.js. Интерактивный.
Открыть с помощью: open {file_path}
```

## СПРАВОЧНИК API

### Semantic Scholar — статья + ссылки + цитирования
```
GET /graph/v1/paper/{paperId}?fields=title,authors,year,venue,citationCount,references.title,references.authors,references.year,references.citationCount,references.externalIds,citations.title,citations.authors,citations.year,citations.citationCount,citations.externalIds

paperId formats: DOI:{doi}, PMID:{pmid}, CorpusId:{id}, or S2 paper ID
```

### Semantic Scholar Batch (efficient)
```
POST /graph/v1/paper/batch
Body: {"ids": ["DOI:10.1...", "DOI:10.2..."]}
?fields=title,authors,year,citationCount
Max 500 IDs per request.
```

### OpenCitations COCI
```
GET /index/api/v2/citations/{doi}
GET /index/api/v2/references/{doi}
Returns: [{citing, cited, creation, timespan}]
```

## ОБРАБОТКА ОШИБОК
- Исходная статья не найдена: попробуй альтернативные типы идентификаторов (DOI → поиск по названию)
- >500 цитирований: укажи усечение, сосредоточься на самых цитируемых
- CDN vis.js недоступен: перейди к статической таблице
- Ограничение по запросам: используй меньшие пакеты с задержками
- Циклические цитирования: пометь как двунаправленные

## БЮДЖЕТ ТОКЕНОВ
- Основная сессия: ~5K (разрешение исходных статей)
- Субагент сети: ~20-40K
- Субагент визуализации: ~10K
- Итого: ~35-55K
- Ограничь глубину до 2 уровней от исходной статьи, чтобы объём оставался управляемым

## ДИЗАЙН ОТЧЁТА
При написании HTML-отчёта строго следуй дизайн-системе в /report-template.
НЕ используй Tailwind CDN. Используй пользовательские CSS-переменные, шрифт Crimson Pro и академическую книжную эстетику, определённую там.
