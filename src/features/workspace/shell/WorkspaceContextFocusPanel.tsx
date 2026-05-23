'use client';

import * as React from 'react';

import {
  WorkspaceDecisionActionCard,
  WorkspaceDecisionRecommendationModal,
  WorkspaceDecisionRecommendationSection,
} from '@/features/workspace/ai-rail';
import { getWorkspaceStatisticsCopy } from '@/features/workspace/stats';
import { getWorkspaceFocusRecommendationCopy } from '@/features/workspace/shell/workspaceEnvironment.copy';
import {
  fillWorkspaceModeTemplate,
  getWorkspaceChipValue,
  joinWorkspaceContext,
  useWorkspaceContext,
} from '@/features/workspace/context';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceTab } from '@/features/workspace/state';

type Translator = (key: I18nKey) => string;

export function WorkspaceContextFocusPanel({
  t,
  locale,
  activePublicSection,
  activeWorkspaceTab,
  preferredRequestsRole = null,
  className,
  panelRef,
}: {
  t: Translator;
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  preferredRequestsRole?: 'customer' | 'provider' | null;
  className?: string;
  panelRef?: React.Ref<HTMLElement>;
}) {
  const model = useWorkspaceContext({
    t,
    locale,
    activePublicSection,
    activeWorkspaceTab,
    preferredRequestsRole,
  });
  const statsCopy = React.useMemo(() => getWorkspaceStatisticsCopy(locale), [locale]);
  const focusCopy = React.useMemo(() => getWorkspaceFocusRecommendationCopy(locale), [locale]);
  const focusActionLabel = React.useMemo(
    () => fillWorkspaceModeTemplate(model.copy.rail.openModeTemplate, model.title),
    [model.copy.rail.openModeTemplate, model.title],
  );
  const [isFocusOpen, setIsFocusOpen] = React.useState(false);
  const [isAnalyzingFocus, setIsAnalyzingFocus] = React.useState(false);
  const cityValue = React.useMemo(() => getWorkspaceChipValue(model.chips, 'city'), [model.chips]);
  const categoryValue = React.useMemo(() => getWorkspaceChipValue(model.chips, 'category'), [model.chips]);
  const serviceValue = React.useMemo(() => getWorkspaceChipValue(model.chips, 'service'), [model.chips]);
  const rangeValue = React.useMemo(() => getWorkspaceChipValue(model.chips, 'range'), [model.chips]);
  const selectedService = serviceValue !== model.copy.contextFallbacks.service ? serviceValue : '';
  const selectedCategory = categoryValue !== model.copy.contextFallbacks.category ? categoryValue : '';
  const selectedCity = cityValue !== model.copy.contextFallbacks.city ? cityValue : '';
  const focusContextLabel = React.useMemo(() => {
    const primaryScope = selectedService || selectedCategory;
    return joinWorkspaceContext([primaryScope, selectedCity]) || focusCopy.defaultContextLabel;
  }, [focusCopy.defaultContextLabel, selectedCategory, selectedCity, selectedService]);
  const focusScopeMetric = React.useMemo(
    () => joinWorkspaceContext([selectedService || selectedCategory, selectedCity, rangeValue]) || model.scope,
    [model.scope, rangeValue, selectedCategory, selectedCity, selectedService],
  );
  const focusModeCopy = focusCopy.modes[model.activeMode];
  const focusHeroTitle = React.useMemo(
    () => fillWorkspaceModeTemplate(focusModeCopy.heroTitleTemplate, model.title),
    [focusModeCopy.heroTitleTemplate, model.title],
  );
  const openFocusRecommendation = React.useCallback(() => {
    setIsAnalyzingFocus(true);
    setIsFocusOpen(true);
  }, []);
  const closeFocusRecommendation = React.useCallback(() => {
    setIsFocusOpen(false);
    setIsAnalyzingFocus(false);
  }, []);
  const focusScopeText = React.useMemo(() => {
    return t(I18N_KEYS.workspace.focusScopeTextTemplate)
      .replace('{context}', focusScopeMetric)
      .replace('{scope}', model.scope);
  }, [focusScopeMetric, model.scope, t]);
  const focusActionText = React.useMemo(
    () => `${focusModeCopy.actionText} ${model.railDescription}`,
    [focusModeCopy.actionText, model.railDescription],
  );

  React.useEffect(() => {
    if (!isFocusOpen || !isAnalyzingFocus) return;
    const timeoutId = window.setTimeout(() => {
      setIsAnalyzingFocus(false);
    }, 1400);
    return () => window.clearTimeout(timeoutId);
  }, [isAnalyzingFocus, isFocusOpen]);

  return (
    <section
      ref={panelRef}
      className={['panel', 'workspace-context-rail__panel', 'workspace-context-rail__panel--focus', className ?? ''].filter(Boolean).join(' ')}
    >
      <span className="workspace-environment__eyebrow">{model.copy.rail.nextStepTitle}</span>
      <span className="section-subtitle workspace-context-rail__subtitle-placeholder" aria-hidden="true">
        &nbsp;
      </span>
      <WorkspaceDecisionActionCard
        className="workspace-context-rail__decision"
        layout="stacked"
        avatarLabel={statsCopy.insightsAssistantAvatarLabel}
        name={statsCopy.insightsAssistantName}
        role={statsCopy.priceRecommendationLabel}
        description={model.railDescription}
        actionLabel={focusActionLabel}
        onActionClick={openFocusRecommendation}
        actionAriaHasPopup
      />
      <WorkspaceDecisionRecommendationModal
        assistantAvatarLabel={statsCopy.insightsAssistantAvatarLabel}
        assistantName={statsCopy.insightsAssistantName}
        assistantRole={statsCopy.priceRecommendationLabel}
        loadingLabel={focusCopy.loadingLabel}
        loadingBody={focusCopy.loadingBody}
        title={focusCopy.title}
        titleContext={focusContextLabel}
        summaryLabel={model.title}
        closeLabel={model.controls.closeLabel}
        isOpen={isFocusOpen}
        isLoading={isAnalyzingFocus}
        onClose={closeFocusRecommendation}
      >
        <article className="workspace-decision-modal__content-stack form-stack">
          <WorkspaceDecisionRecommendationSection
            badgeLabel={focusCopy.recommendationLabel}
            badgeTone="info"
            tone="performance"
            metric={model.title}
            title={focusHeroTitle}
            text={focusModeCopy.heroText}
            featured
            className="workspace-decision-modal__hero"
          />
          <WorkspaceDecisionRecommendationSection
            badgeLabel={focusCopy.scopeLabel}
            badgeTone="info"
            tone="performance"
            metric={focusScopeMetric}
            text={focusScopeText}
            className="workspace-decision-modal__section"
          />
          <WorkspaceDecisionRecommendationSection
            badgeLabel={focusCopy.actionLabel}
            badgeTone="success"
            tone="opportunity"
            text={focusActionText}
            className="workspace-decision-modal__section"
          />
          <WorkspaceDecisionRecommendationSection
            badgeLabel={focusCopy.switchLabel}
            badgeTone="warning"
            tone="promotion"
            text={focusModeCopy.switchText}
            className="workspace-decision-modal__section"
          />
        </article>
      </WorkspaceDecisionRecommendationModal>
    </section>
  );
}

export function WorkspaceContextAside({
  t,
  locale,
  activePublicSection,
  activeWorkspaceTab,
  preferredRequestsRole = null,
  className,
  topSlot,
  panelRef,
  children,
}: {
  t: Translator;
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  preferredRequestsRole?: 'customer' | 'provider' | null;
  className?: string;
  topSlot?: React.ReactNode;
  panelRef?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}) {
  return (
    <div className={['workspace-statistics-layout', 'workspace-context-rail', className ?? ''].filter(Boolean).join(' ')}>
      {topSlot}

      <WorkspaceContextFocusPanel
        t={t}
        locale={locale}
        activePublicSection={activePublicSection}
        activeWorkspaceTab={activeWorkspaceTab}
        preferredRequestsRole={preferredRequestsRole}
        panelRef={panelRef}
      />

      {children}
    </div>
  );
}
