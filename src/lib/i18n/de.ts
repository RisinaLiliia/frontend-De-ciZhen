// src/lib/i18n/de.ts
export const de = {
  home: {
    title: "Finde zuverlässige Hilfe",
    subtitle: "Haushalt & Services in deiner Nähe",
    servicePlaceholder: "Was suchst du?",
    cityPlaceholder: "Stadt oder PLZ",
    whenPlaceholder: "Wann? (optional)",
    cta: "Anfrage erstellen",
    trust: {
      fast: "Schnell",
      local: "Lokal",
      rated: "Bewertet",
    },
    popularTitle: "Beliebte Services",
  },
} as const;

export type DeDictionary = typeof de;
