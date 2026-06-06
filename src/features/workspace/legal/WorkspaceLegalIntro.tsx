'use client';

import { WorkspaceSectionHeader } from '@/features/workspace/shell/WorkspaceSectionHeader';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';

type WorkspaceLegalSection = Extract<PublicWorkspaceSection, 'privacy' | 'cookies'>;

const WORKSPACE_LEGAL_COPY: Record<
  WorkspaceLegalSection,
  { title: string; description: string }
> = {
  privacy: {
    title: 'Datenschutz im Workspace',
    description: 'Pruefe Datenschutz, Datenverarbeitung und Plattformregeln innerhalb derselben Arbeitsumgebung.',
  },
  cookies: {
    title: 'Cookie-Richtlinie im Workspace',
    description: 'Verwalte Einwilligung, Tracking-Transparenz und Cookie-Informationen ohne den Workspace zu verlassen.',
  },
};

export function WorkspaceLegalIntro({
  section,
}: {
  section: WorkspaceLegalSection;
}) {
  const copy = WORKSPACE_LEGAL_COPY[section];

  return (
    <WorkspaceSectionHeader
      title={copy.title}
      description={copy.description}
    />
  );
}
