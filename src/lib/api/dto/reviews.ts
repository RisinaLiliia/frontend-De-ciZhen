// src/lib/api/dto/reviews.ts
export type ReviewDto = {
  id: string;
  targetRole?: 'client' | 'provider' | null;
  rating?: number | null;
  text?: string | null;
  comment?: string | null;
  createdAt?: string | null;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
};
