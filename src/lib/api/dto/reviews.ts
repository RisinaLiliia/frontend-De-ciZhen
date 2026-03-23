// src/lib/api/dto/reviews.ts
export type ReviewDto = {
  id: string;
  targetRole?: 'client' | 'provider' | 'platform' | null;
  rating?: number | null;
  text?: string | null;
  comment?: string | null;
  createdAt?: string | null;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
};

export type ReviewRange = '24h' | '7d' | '30d' | '90d';

export type ReviewSummaryDto = {
  targetUserId: string;
  targetRole: 'client' | 'provider' | 'platform' | null;
  total: number;
  averageRating: number;
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
};

export type ReviewOverviewDto = {
  items: ReviewDto[];
  total: number;
  limit: number;
  offset: number;
  summary: {
    total: number;
    averageRating: number;
    distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
  };
};
