Проведи поиск академической литературы по "$ARGUMENTS".

НЕ используй субагентов — выполни это самостоятельно.

## ШАГ 1: Сформируй поисковые запросы

На основе "$ARGUMENTS" создай 3-5 вариантов запроса:
- Исходный запрос без изменений
- Синонимы / связанные термины
- Более широкая категория
- Более узкая подтема
- Если запрос не на английском: добавь английский эквивалент

## ШАГ 2: Определи дисциплину

Выведи её из ключевых слов запроса:
- Медицинские / биомедицинские термины → добавь PubMed
- CS / math / physics → добавь arXiv
- Социальные науки / гуманитарные науки → только Semantic Scholar + OpenAlex
- Неясно → всегда ищи в Semantic Scholar + OpenAlex

## ШАГ 3: Поиск по API (параллельные вызовы WebFetch)

### Semantic Scholar (всегда)
```
WebFetch: https://api.semanticscholar.org/graph/v1/paper/search?query={query}&limit=20&fields=title,authors,year,venue,citationCount,abstract,externalIds,openAccessPdf
```

### OpenAlex (всегда)
```
WebFetch: https://api.openalex.org/works?search={query}&per_page=20&sort=cited_by_count:desc&mailto=katmercode@example.com
```

### PubMed (только для биомедицины)
```
WebFetch: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={query}&retmax=20&retmode=json
Затем: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={pmid_list}&retmode=json
```

### arXiv (только для CS / math / physics)
```
WebFetch: https://export.arxiv.org/api/query?search_query=all:{query}&max_results=20&sortBy=relevance
```
Ответ приходит в виде Atom XML — разбирай элементы `<entry>`.

## ШАГ 4: Устрани дубликаты и объедини записи

1. Нормализуй DOI (в нижний регистр, убери URL-префикс)
2. Группируй по DOI — сохраняй наиболее полные метаданные
3. Если DOI нет: выполняй нечёткое сопоставление по названию (>80% сходства)
4. Оставляй по одной записи на каждую статью

## ШАГ 5: Отранжируй и представь результаты

Сортируй по: релевантность × log(citationCount + 1)

Отображай:

| # | Authors | Title | Year | Venue | Cites | DOI | OA |
|---|---------|-------|------|-------|-------|-----|----|
| 1 | Smith, Jones | Deep learning for... | 2023 | Nature | 1,204 | 10.1038/... | PDF |

Покажи топ-20. Для каждой записи с аннотацией выведи первые 100 слов.

## ШАГ 6: Предложи следующие действия

- "Развернуть любую из этих записей? Я могу получить полные сведения + список ссылок."
- "Построить сеть цитирования? (/citation-network DOI1 DOI2)"
- "Сгенерировать по ним план обзора литературы?"
- "Сохранить результаты в файл? (markdown table)"

## ОБРАБОТКА ОШИБОК
- 429: подожди 60 секунд и повтори. Если ошибка сохраняется, пропусти этот API.
- 0 результатов во всех API: предложи более общие термины
- Не-латинский алфавит: попробуй транслитерацию
- Ошибка разбора XML arXiv: пропусти, отметь в выводе

## БЮДЖЕТ ТОКЕНОВ
- Прямое выполнение (без субагента): ~15-25K всего
- Ответы API: ~1-2K на вызов
- Показ аннотаций: ~5K, если вывести все 20
