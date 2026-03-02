import type { ConsentChoice } from './types';

let runtimeChoice: ConsentChoice = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export function setRuntimeConsentChoice(next: ConsentChoice) {
  runtimeChoice = next;
}

export function getRuntimeConsentChoice(): ConsentChoice {
  return runtimeChoice;
}

export function isAnalyticsConsentGranted(): boolean {
  return runtimeChoice.analytics;
}
