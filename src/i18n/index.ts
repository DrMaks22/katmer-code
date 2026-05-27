import { en } from "./en";
import { ru } from "./ru";

export type Locale = "ru" | "en";

type Catalog = Record<string, string>;
type InterpolationValue = string | number | boolean | null | undefined;

const catalogs: Record<Locale, Catalog> = {
  ru,
  en,
};

let activeLocale: Locale = "ru";

export function setLocale(locale: Locale): void {
  activeLocale = locale;
}

export function getLocale(): Locale {
  return activeLocale;
}

export function t(key: string, vars: Record<string, InterpolationValue> = {}): string {
  const catalog = catalogs[activeLocale];
  const fallbackCatalog = catalogs.en;
  const template = catalog[key] ?? fallbackCatalog[key] ?? key;

  return template.replace(/\{(\w+)\}/g, (match, token) => {
    const value = vars[token];
    return value === undefined || value === null ? match : String(value);
  });
}

export function formatCount(count: number, one: string, few: string, many: string): string {
  if (activeLocale !== "ru") {
    return `${count} ${count === 1 ? one : many}`;
  }

  const mod10 = count % 10;
  const mod100 = count % 100;
  const word = mod10 === 1 && mod100 !== 11
    ? one
    : mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)
      ? few
      : many;
  return `${count} ${word}`;
}

export { en, ru };
