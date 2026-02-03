// src/lib/i18n/keys.ts
export const I18N_KEYS = {
  common: {
    retry: "common.retry",
    refreshing: "common.refreshing",
    loadError: "common.loadError",
    loadErrorShort: "common.loadErrorShort",
    emptyData: "common.emptyData",
    selectServiceCity: "common.selectServiceCity",
    themeLabel: "common.themeLabel",
    themeLight: "common.themeLight",
    themeDark: "common.themeDark",
  },
  home: {
    title: "home.title",
    subtitle: "home.subtitle",
    servicePlaceholder: "home.servicePlaceholder",
    cityPlaceholder: "home.cityPlaceholder",
    serviceAria: "home.serviceAria",
    cityAria: "home.cityAria",
    whenPlaceholder: "home.whenPlaceholder",
    cta: "home.cta",
    trust: {
      fast: "home.trust.fast",
      local: "home.trust.local",
      rated: "home.trust.rated",
    },
    popularTitle: "home.popularTitle",
  },
  request: {
    whenModeLabel: "request.whenModeLabel",
    modeOnce: "request.modeOnce",
    modeRecurring: "request.modeRecurring",
    frequencyLabel: "request.frequencyLabel",
    frequencyWeekly: "request.frequencyWeekly",
    frequencyBiweekly: "request.frequencyBiweekly",
    timesPerWeekLabel: "request.timesPerWeekLabel",
    timesPerWeek1: "request.timesPerWeek1",
    timesPerWeek2: "request.timesPerWeek2",
    timesPerWeek3: "request.timesPerWeek3",
    weekdaysLabel: "request.weekdaysLabel",
    datePlaceholder: "request.datePlaceholder",
    startDatePlaceholder: "request.startDatePlaceholder",
    weekdays: {
      mo: "request.weekdays.mo",
      tu: "request.weekdays.tu",
      we: "request.weekdays.we",
      th: "request.weekdays.th",
      fr: "request.weekdays.fr",
      sa: "request.weekdays.sa",
      su: "request.weekdays.su",
    },
  },
  dateField: {
    ariaLabel: "dateField.ariaLabel",
    placeholder: "dateField.placeholder",
    single: "dateField.single",
    range: "dateField.range",
    hintWeek: "dateField.hintWeek",
    hintLocale: "dateField.hintLocale",
    hintEsc: "dateField.hintEsc",
  },
} as const;

type NestedValue<T> = T extends object ? { [K in keyof T]: NestedValue<T[K]> }[keyof T] : T;

export type I18nKey = NestedValue<typeof I18N_KEYS>;
