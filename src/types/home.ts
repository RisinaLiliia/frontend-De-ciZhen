export type LiveStats = {
  active: number;
  completed: number;
  responseMin: number;
  rating: number;
  reviews: number;
};

export type CategoryCounts = Record<string, number>;

export type CategoryOption = {
  key: string;
  label: string;
};

export type ProofCase = {
  id: string;
  title: string;
  info: string;
  review: string;
  price: string;
  rating: string;
};
