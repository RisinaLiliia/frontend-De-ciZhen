'use client';

import { WorkspaceReviewsPanel } from '@/components/reviews/WorkspaceReviewsPanel';
import type { WorkspaceContentPanelsProps } from '../workspaceContentPanels.types';

type Props = Pick<WorkspaceContentPanelsProps, 't' | 'isWorkspaceAuthed' | 'reviewsState'>;

export function WorkspaceReviewsTabPanel({ t, isWorkspaceAuthed, reviewsState }: Props) {
  return (
    <div className="stack-sm">
      <WorkspaceReviewsPanel
        t={t}
        source={isWorkspaceAuthed ? 'user' : 'platform'}
        userReviews={reviewsState.items}
        isUserReviewsLoading={reviewsState.isLoading}
      />
    </div>
  );
}
