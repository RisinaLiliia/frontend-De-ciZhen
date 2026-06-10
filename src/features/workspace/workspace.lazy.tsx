'use client';

import dynamic from 'next/dynamic';

import {
  workspacePanelShell,
  workspaceRequestsPanelShell,
} from '@/features/workspace/shared/workspaceSurfaceShell';

export const PublicContent = dynamic(
  () => import('@/features/workspace/requests/PublicContent').then((mod) => mod.PublicContent),
  {
    loading: () => (
      <section className={workspaceRequestsPanelShell()}>
        <div className="skeleton h-96 w-full" />
      </section>
    ),
  },
);

export const WorkspaceContent = dynamic(
  () =>
    import('@/features/workspace/requests/WorkspaceContent').then((mod) => mod.WorkspaceContent),
  {
    loading: () => (
      <section className={workspaceRequestsPanelShell()}>
        <div className="skeleton h-96 w-full" />
      </section>
    ),
  },
);

export const WorkspacePrivateIntro = dynamic(
  () =>
    import('@/features/workspace/intro/WorkspacePrivateIntro').then(
      (mod) => mod.WorkspacePrivateIntro,
    ),
  {
    loading: () => (
      <section className="workspace-intro-shell">
        <div className={workspacePanelShell()}>
          <div className="skeleton h-48 w-full" />
        </div>
      </section>
    ),
  },
);

export const WorkspacePublicIntro = dynamic(
  () =>
    import('@/features/workspace/intro/WorkspacePublicIntro').then(
      (mod) => mod.WorkspacePublicIntro,
    ),
  {
    loading: () => (
      <section className="workspace-intro-shell">
        <div className={workspacePanelShell()}>
          <div className="skeleton h-48 w-full" />
        </div>
      </section>
    ),
  },
);

export const ProofReviewCard = dynamic(() =>
  import('@/components/reviews/ProofReviewCard').then((mod) => mod.ProofReviewCard),
);
