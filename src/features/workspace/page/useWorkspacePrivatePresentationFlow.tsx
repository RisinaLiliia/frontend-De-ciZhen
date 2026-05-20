'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { trackUXEvent } from '@/lib/analytics';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { buildRequestsListProps } from '@/components/requests/requestsListProps';
import { useSyncedPanelMinHeight } from '@/hooks/useSyncedPanelMinHeight';
import { WorkspacePrivateIntro, WorkspacePublicIntro } from '@/features/workspace/intro';
import { WorkspaceOverviewInsightsPanel, WorkspaceOverviewMain, WorkspacePublicDemandMapPanel } from '@/features/workspace/overview';
import { useWorkspaceStatisticsModel } from '@/features/workspace/stats';
import { WorkspaceRequestsSectionRail } from '@/features/workspace/ai-rail';
import {
  buildRequestsWorkspacePrivateBody,
  RequestsWorkspaceBody,
} from '@/features/workspace/requests/RequestsWorkspaceBody';
import {
  buildMyRequestsViewModelFromResponse,
} from '@/features/workspace/requests/myRequestsView.model';
import { useWorkspacePrivateState } from '@/features/workspace/requests/useWorkspacePrivateState';
import { buildWorkspaceRequestsSurfaceModel } from '@/features/workspace/requests/workspaceRequestsView.model';
import { useDecisionMode } from '@/features/workspace/requests/useDecisionMode';
import {
  useWorkspacePresentation,
  type WorkspaceSectionRenderModel,
} from '@/features/workspace';
import { ChatWorkspacePage } from '@/features/chat/ChatWorkspacePage';
import { WorkspaceChatIntro } from '@/features/chat/WorkspaceChatIntro';
import { WorkspaceChatRail } from '@/features/chat/WorkspaceChatRail';
import { WorkspaceSettingsIntro } from '@/features/profile/WorkspaceSettingsIntro';
import { WorkspaceSettingsPage } from '@/features/profile/WorkspaceSettingsPage';
import { useExploreSidebar } from '@/features/workspace/explore/useExploreSidebar';
import { WorkspaceHelpIntro } from '@/features/workspace/help/WorkspaceHelpIntro';
import { WorkspaceHelpPage } from '@/features/workspace/help/WorkspaceHelpPage';
import {
  buildWorkspaceExploreSectionModel,
  buildWorkspaceChatSectionModel,
  buildWorkspaceHelpSectionModel,
  buildWorkspaceOverviewSectionModel,
  buildWorkspaceSettingsSectionModel,
  buildWorkspaceStandardSectionModel,
  resolveWorkspaceExploreSection,
  resolveWorkspaceStandardSection,
} from '@/features/workspace/page/sections/workspaceSectionAdapters';
import { WorkspaceContextFocusPanel } from '@/features/workspace/shell/WorkspaceContextFocusPanel';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import { useWorkspacePrivateDataFlow } from '@/features/workspace/page/useWorkspacePrivateDataFlow';
import { isWorkspaceTab } from '@/features/workspace/state';
import {
  buildWorkspacePrivateOverviewListPropsArgs,
  buildWorkspacePublicSummaryView,
  resolveWorkspacePrivateRequestsLoading,
  resolveWorkspacePrivateRenderModes,
  buildWorkspacePrivatePresentationArgs,
  buildWorkspacePrivateStateArgs,
  buildWorkspacePublicIntroProps,
} from '@/features/workspace/page/workspacePrivatePresentation.model';

type UseWorkspacePrivatePresentationFlowParams = {
  branch: WorkspaceBranchProps;
  data: ReturnType<typeof useWorkspacePrivateDataFlow>;
};

export function useWorkspacePrivatePresentationFlow({
  branch,
  data,
}: UseWorkspacePrivatePresentationFlowParams) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.toString();
  const { isWorkspaceAuthed } = branch;
  const {
    activePublicSection,
    activeWorkspaceTab,
    pendingFavoriteProviderIds,
    onToggleProviderFavorite,
    overviewRequestsListState,
    overviewRequestsCount,
  } = data;
  const { isOverviewMode, isUnifiedPrivateRequests } =
    resolveWorkspacePrivateRenderModes({
      activePublicSection,
      activeWorkspaceTab,
      pathname,
      sectionParam: searchParams.get('section'),
      hasExplicitWorkspaceTab: isWorkspaceTab(searchParams.get('tab')),
      requestsScope: data.requestsScope,
    });
  const primaryAction = React.useMemo(
    () => ({
      href: '/request/create',
      label: branch.t(I18N_KEYS.requestsPage.workspaceMyRequestsEmptyCta),
    }),
    [branch],
  );

  const privateState = useWorkspacePrivateState(
    buildWorkspacePrivateStateArgs({ branch, data }),
  );

  const { workspaceIntroNode, workspaceAsideBaseProps } = useWorkspacePresentation(
    buildWorkspacePrivatePresentationArgs({
      branch,
      data,
      WorkspacePrivateIntroComponent: WorkspacePrivateIntro,
      preferredRequestsRole: privateState.preferredRequestsRole,
      privateState,
    }),
  );

  const resolvedWorkspaceIntroNode = isWorkspaceAuthed
    ? workspaceIntroNode
    : (
      (() => {
        const publicIntroProps = buildWorkspacePublicIntroProps({
          branch,
          data: {
            ...data,
            preferredRequestsRole: privateState.preferredRequestsRole,
          },
        });

        return (
      <WorkspacePublicIntro
            {...publicIntroProps}
            showDemandMap={isOverviewMode ? false : publicIntroProps.showDemandMap}
            showQuickAction={isOverviewMode ? false : publicIntroProps.showQuickAction}
          />
        );
      })()
    );

  const overviewHeroRef = React.useRef<HTMLDivElement | null>(null);
  const overviewOffersPanelRef = React.useRef<HTMLElement | null>(null);
  const overviewFocusPanelRef = React.useRef<HTMLElement | null>(null);
  const overviewMapMinHeight = useSyncedPanelMinHeight({
    sourceRef: overviewHeroRef,
    mode: 'sourceHeight',
    watchKey: isOverviewMode,
  });
  const overviewInsightsMinHeight = useSyncedPanelMinHeight({
    sourceRef: overviewOffersPanelRef,
    mode: 'sourceHeight',
    watchKey: isOverviewMode,
  });
  const overviewActionsMinHeight = useSyncedPanelMinHeight({
    sourceRef: overviewFocusPanelRef,
    mode: 'sourceHeight',
    watchKey: isOverviewMode,
  });
  const overviewStatisticsModel = useWorkspaceStatisticsModel({ locale: branch.locale });
  const publicSummaryView = buildWorkspacePublicSummaryView(data);
  const privateExplore = useExploreSidebar(branch.t);

  const overviewRailTopSlot = isOverviewMode ? (
    <>
      <WorkspacePublicDemandMapPanel
        t={branch.t}
        locale={branch.locale}
        cityActivity={publicSummaryView.cityActivity}
        summary={publicSummaryView.summary}
        isLoading={publicSummaryView.isMapLoading}
        isError={publicSummaryView.isMapError}
        className="workspace-overview__rail-panel--map"
        onSelectCity={overviewStatisticsModel.setCityId}
        style={
          overviewMapMinHeight
            ? { minHeight: `${overviewMapMinHeight}px`, height: `${overviewMapMinHeight}px` }
            : undefined
        }
      />
      <WorkspaceOverviewInsightsPanel
        locale={branch.locale}
        currentSearch={currentSearch}
        statisticsModel={overviewStatisticsModel}
        style={
          overviewInsightsMinHeight
            ? { minHeight: `${overviewInsightsMinHeight}px`, height: `${overviewInsightsMinHeight}px` }
            : undefined
        }
      />
    </>
  ) : null;
  const overviewRailBottomSlot = isOverviewMode ? (
    <WorkspaceContextFocusPanel
      t={branch.t}
      locale={branch.locale}
      activePublicSection={activePublicSection}
      activeWorkspaceTab={activeWorkspaceTab}
    />
  ) : null;

  const onPrimaryActionClick = React.useCallback(
    () => trackUXEvent('workspace_primary_cta_click', { tab: activeWorkspaceTab }),
    [activeWorkspaceTab],
  );

  const activeOffersListProps = React.useMemo(
    () =>
      buildRequestsListProps(buildWorkspacePrivateOverviewListPropsArgs({
        branch,
        data,
        isOverviewMode,
      })),
    [branch, data, isOverviewMode],
  );

  const preferredRequestsRole = privateState.preferredRequestsRole;
  const isChatSection = activePublicSection === 'chat';
  const isSettingsSection = activePublicSection === 'settings';
  const isHelpSection = activePublicSection === 'help';
  const isExploreSection =
    activePublicSection === 'providers'
    || activePublicSection === 'stats'
    || activePublicSection === 'profile';
  const {
    requestsPage,
    setRequestsPage,
  } = data;
  const privateRequestsLoading = resolveWorkspacePrivateRequestsLoading({
    workspaceRequests: data.workspaceRequests,
    isWorkspaceRequestsLoading: data.isWorkspaceRequestsLoading,
    activeRequestsRole: data.activeRequestsRole,
    isWorkspacePrivateRequestsFallbackLoading: data.isWorkspacePrivateRequestsFallbackLoading,
  });
  const privateRequestsModel = React.useMemo(
    () => buildMyRequestsViewModelFromResponse(data.workspaceRequests),
    [data.workspaceRequests],
  );
  const privateTotalPages = React.useMemo(() => {
    if (!privateRequestsModel.response) return 1;
    return Math.max(
      1,
      Math.ceil(privateRequestsModel.response.list.total / Math.max(1, privateRequestsModel.response.list.limit)),
    );
  }, [privateRequestsModel.response]);
  const privatePagination = React.useMemo(() => {
    if (!privateRequestsModel.response) return null;
    return {
      page: privateRequestsModel.response.list.page,
      totalPages: privateTotalPages,
      onPageChange: setRequestsPage,
    };
  }, [privateRequestsModel.response, privateTotalPages, setRequestsPage]);

  React.useEffect(() => {
    if (!privateRequestsModel.response) return;
    if (requestsPage <= privateTotalPages) return;
    setRequestsPage(privateTotalPages);
  }, [privateRequestsModel.response, privateTotalPages, requestsPage, setRequestsPage]);
  const {
    state: decisionState,
    queueIds: decisionQueueIds,
    enterDecisionMode,
    openDecisionItem,
    exitDecisionMode,
  } = useDecisionMode({
    panel: privateRequestsModel.response ? privateRequestsModel.response.decisionPanel : null,
  });
  const privateAside = isUnifiedPrivateRequests ? (
    <WorkspaceRequestsSectionRail
      locale={branch.locale}
      variant="private"
      summaryItems={privateRequestsModel.response?.summary.items}
      isSummaryLoading={privateRequestsLoading}
      panel={privateRequestsModel.response?.decisionPanel}
      mode={decisionState.mode}
      activeRequestId={decisionState.activeRequestId}
      onStartDecisionMode={() => enterDecisionMode()}
      onOpenQueueItem={openDecisionItem}
    />
  ) : undefined;

  const privateMain = isOverviewMode ? (
    <WorkspaceOverviewMain
      locale={branch.locale}
      t={branch.t}
      currentSearch={currentSearch}
      statisticsModel={overviewStatisticsModel}
      heroRef={overviewHeroRef}
      offersPanelRef={overviewOffersPanelRef}
      actionsStyle={overviewActionsMinHeight ? { minHeight: `${overviewActionsMinHeight}px` } : undefined}
      mobileRailTopSlot={overviewRailTopSlot}
      mobileRailBottomSlot={overviewRailBottomSlot}
      primaryAction={primaryAction}
      onPrimaryActionClick={onPrimaryActionClick}
      activeOffersListProps={activeOffersListProps}
      topProviders={workspaceAsideBaseProps.providers}
      topProvidersTitle={workspaceAsideBaseProps.title}
      topProvidersSubtitle={workspaceAsideBaseProps.subtitle}
      topProvidersCtaLabel={workspaceAsideBaseProps.ctaLabel}
      favoriteProviderIds={workspaceAsideBaseProps.favoriteProviderIds}
      pendingFavoriteProviderIds={pendingFavoriteProviderIds}
      onToggleProviderFavorite={onToggleProviderFavorite}
    />
  ) : isUnifiedPrivateRequests ? (
    <RequestsWorkspaceBody
      body={buildRequestsWorkspacePrivateBody(buildWorkspaceRequestsSurfaceModel({
        variant: 'private',
        locale: branch.locale,
        isWorkspaceAuthed: branch.isWorkspaceAuthed,
        guestLoginHref: data.guestLoginHref,
        pagination: privatePagination,
        model: privateRequestsModel,
        isLoading: privateRequestsLoading,
        isError: data.isWorkspaceRequestsError,
        decisionState,
        decisionQueueIds,
        onEnterDecisionMode: enterDecisionMode,
        onOpenDecisionItem: openDecisionItem,
        onExitDecisionMode: exitDecisionMode,
        listContext: {
          onSendOffer: data.onOpenOfferSheet,
          onEditOffer: data.onOpenOfferSheet,
          onWithdrawOffer: data.onWithdrawOffer,
          onOpenChatConversation: data.onOpenChatConversation,
          pendingOfferRequestId: data.pendingOfferRequestId,
          ownerRequestActions: data.ownerRequestActions,
        },
      }))}
    />
  ) : null;
  const chatSectionModel = React.useMemo<WorkspaceSectionRenderModel | null>(
    () => (
      isChatSection
        ? buildWorkspaceChatSectionModel({
          content: (
            <ChatWorkspacePage
              basePath="/workspace"
              className="workspace-chat-page"
              preferDesktopSplit
            />
          ),
          aiRail: <WorkspaceChatRail />,
        })
        : null
    ),
    [isChatSection],
  );
  const settingsSectionModel = React.useMemo<WorkspaceSectionRenderModel | null>(
    () => (
      isSettingsSection
        ? buildWorkspaceSettingsSectionModel({
          content: <WorkspaceSettingsPage />,
        })
        : null
    ),
    [isSettingsSection],
  );
  const helpSectionModel = React.useMemo<WorkspaceSectionRenderModel | null>(
    () => (
      isHelpSection
        ? buildWorkspaceHelpSectionModel({
          content: <WorkspaceHelpPage />,
        })
        : null
    ),
    [isHelpSection],
  );
  const sectionModel: WorkspaceSectionRenderModel = (() => {
    if (chatSectionModel) {
      return chatSectionModel;
    }

    if (settingsSectionModel) {
      return settingsSectionModel;
    }

    if (isExploreSection) {
      return buildWorkspaceExploreSectionModel({
        branch,
        section: resolveWorkspaceExploreSection(activePublicSection),
        explore: privateExplore,
      });
    }

    if (helpSectionModel) {
      return helpSectionModel;
    }

    if (isOverviewMode) {
      return buildWorkspaceOverviewSectionModel({
        content: privateMain,
        aiRail: privateAside,
      });
    }

    return buildWorkspaceStandardSectionModel({
      section: resolveWorkspaceStandardSection(activePublicSection),
      content: privateMain,
      aiRail: privateAside,
    });
  })();

  return {
    activePublicSection,
    activeWorkspaceTab,
    pendingFavoriteProviderIds,
    onToggleProviderFavorite,
    workspaceIntroNode: isChatSection
      ? <WorkspaceChatIntro />
      : isSettingsSection
        ? <WorkspaceSettingsIntro />
        : isHelpSection
          ? <WorkspaceHelpIntro />
        : resolvedWorkspaceIntroNode,
    workspaceAsideBaseProps,
    asideTopSlot: overviewRailTopSlot,
    preferredRequestsRole,
    overviewDecisionPanelRef: overviewFocusPanelRef,
    sectionModel,
    primaryAction,
    isLoading: overviewRequestsListState.isLoading,
    overviewRequestsCount,
  };
}
