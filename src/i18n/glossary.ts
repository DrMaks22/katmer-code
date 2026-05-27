export type GlossaryTerm = {
  en: string;
  ru: string;
};

export const glossary = {
  provider: {
    en: "provider",
    ru: "провайдер",
  },
  workspace: {
    en: "workspace",
    ru: "рабочая область",
  },
  prompt: {
    en: "prompt",
    ru: "промпт",
  },
  contextWindow: {
    en: "context window",
    ru: "окно контекста",
  },
  approval: {
    en: "approval",
    ru: "подтверждение",
  },
  inlineDiff: {
    en: "inline diff",
    ru: "встроенный просмотр изменений",
  },
} as const satisfies Record<string, GlossaryTerm>;
