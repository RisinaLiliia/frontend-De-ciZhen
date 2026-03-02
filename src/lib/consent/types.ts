export type ConsentSource = 'banner' | 'preferences';

export type ConsentChoice = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export type ConsentRecord = {
  version: number;
  decidedAt: string;
  updatedAt: string;
  source: ConsentSource;
  choice: ConsentChoice;
};

export type ConsentDraft = {
  analytics: boolean;
  marketing: boolean;
};
