'use client';

import dynamic from 'next/dynamic';

export const PublicContent = dynamic(
  () => import('@/features/workspace/requests/PublicContent').then((mod) => mod.PublicContent),
  {
    loading: () => (
      <section className="panel requests-panel">
        <div className="skeleton h-96 w-full" />
      </section>
    ),
  },
);

export const WorkspaceContent = dynamic(
  () => import('@/features/workspace/requests/WorkspaceContent').then((mod) => mod.WorkspaceContent),
  {
    loading: () => (
      <section className="panel requests-panel">
        <div className="skeleton h-96 w-full" />
      </section>
    ),
  },
);

export const WorkspacePrivateIntro = dynamic(
  () => import('@/features/workspace/requests/WorkspacePrivateIntro').then((mod) => mod.WorkspacePrivateIntro),
  {
    loading: () => (
      <section className="home-intro-shell">
        <div className="panel">
          <div className="skeleton h-48 w-full" />
        </div>
      </section>
    ),
  },
);

export const WorkspacePublicIntro = dynamic(
  () => import('@/features/workspace/requests/WorkspacePublicIntro').then((mod) => mod.WorkspacePublicIntro),
  {
    loading: () => (
      <section className="home-intro-shell">
        <div className="panel">
          <div className="skeleton h-48 w-full" />
        </div>
      </section>
    ),
  },
);

export const ProofReviewCard = dynamic(
  () => import('@/components/reviews/ProofReviewCard').then((mod) => mod.ProofReviewCard),
);
