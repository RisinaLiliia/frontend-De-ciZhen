// src/lib/api/dto/reviews.ts
export type ReviewDto = {
  id: string;
  rating?: number | null;
  comment?: string | null;
  createdAt?: string | null;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
};
