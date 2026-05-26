import { redirect } from 'next/navigation';

import { DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF } from '@/features/workspace/requests/workspaceRequestRoute.model';

export default function RequestNewLegacyPage() {
  redirect(DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF);
}
