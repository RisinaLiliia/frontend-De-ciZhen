'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { trackUXEvent } from '@/lib/analytics';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { WorkspacePrivateIntro, WorkspacePublicIntro } from '@/features/workspace/intro';
import { WorkspaceOverviewMain, useWorkspaceOverviewRail } from '@/features/workspace/overview';
import { WorkspaceRequestsSectionRail } from '@/features/workspace/ai-rail';
import {
  buildRequestsWorkspacePrivateBody,
  RequestsWorkspaceBody,
} from '@/features/workspace/requests/RequestsWorkspaceBody';
import {
  buildMyRequestsViewModelFromResponse,
} from '@/features/workspace/requests/myRequestsView.model';
import { useWorkspacePrivateState } from '@/features/workspace/state/useWorkspacePrivateState';
import {
  buildWorkspaceRequestsSurfaceModel,
  buildWorkspaceRequestsViewModelFromResponse,
} from '@/features/workspace/requests/workspaceRequestsView.model';
import { useDecisionMode } from '@/features/workspace/requests/useDecisionMode';
import {
  useWorkspacePresentation,
  type WorkspaceSectionRenderModel,
} from '@/features/workspace';
import { ChatWorkspacePage } from '@/features/workspace/chat/ChatWorkspacePage';
import { WorkspaceChatIntro } from '@/features/workspace/chat/WorkspaceChatIntro';
import { WorkspaceChatRail } from '@/features/workspace/chat/WorkspaceChatRail';
import { WorkspaceSettingsIntro } from '@/features/workspace/profile/WorkspaceSettingsIntro';
import { WorkspaceSettingsPage } from '@/features/workspace/profile/WorkspaceSettingsPage';
import { useExploreSidebar } from '@/features/workspace/market/useExploreSidebar';
import { WorkspaceHelpIntro } from '@/features/workspace/help/WorkspaceHelpIntro';
import { WorkspaceHelpPage } from '@/features/workspace/help/WorkspaceHelpPage';
import { DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF } from '@/features/workspace/requests/workspaceRequestRoute.model';
import {
  buildWorkspaceExploreSectionModel,
  buildWorkspaceHelpSectionModel,
  buildWorkspaceOverviewSectionModel,
  buildWorkspaceSettingsSectionModel,
  buildWorkspaceStandardSectionModel,
  resolveWorkspaceExploreSection,
  resolveWorkspaceStandardSection,
} from '@/features/workspace/orchestration/sections/workspaceSectionAdapters';
import type { WorkspaceBranchProps } from '@/features/workspace/orchestration/workspacePage.types';
import { useWorkspacePrivateDataFlow } from '@/features/workspace/orchestration/useWorkspacePrivateDataFlow';
import { resolveWorkspaceRouteCompatibility } from '@/features/workspace/navigation/workspaceRouteCompatibility';
import {
  buildWorkspaceOverviewMarketCardsState,
  buildWorkspacePublicSummaryView,
  resolveWorkspacePrivateRequestsLoading,
  resolveWorkspacePrivateRenderModes,
  buildWorkspacePrivatePresentationArgs,
  buildWorkspacePrivateStateArgs,
  buildWorkspacePublicIntroProps,
} from '@/features/workspace/orchestration/workspacePrivatePresentation.model';

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
    overviewMarketRequestsState,
    overviewRequestsCount,
  } = data;
  const routeCompatibility = React.useMemo(
    () => resolveWorkspaceRouteCompatibility({
      searchParams,
      authStatus: isWorkspaceAuthed ? 'authenticated' : 'unauthenticated',
    }),
    [isWorkspaceAuthed, searchParams],
  );
  const { isOverviewMode, isUnifiedPrivateRequests } =
    resolveWorkspacePrivateRenderModes({
      activePublicSection,
      activeWorkspaceTab,
      pathname,
      routeSection: routeCompatibility.routeSection,
      hasExplicitWorkspaceTab: routeCompatibility.hasExplicitWorkspaceTab,
      requestsScope: data.requestsScope,
    });
  const primaryAction = React.useMemo(
    () => ({
      href: DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF,
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

  const publicSummaryView = buildWorkspacePublicSummaryView(data);
  const privateExplore = useExploreSidebar(branch.t);
  const {
    statisticsModel: overviewStatisticsModel,
    mapPanel: overviewMapPanel,
    aiRail: overviewAiRail,
  } = useWorkspaceOverviewRail({
    isOverviewMode,
    t: branch.t,
    locale: branch.locale,
    currentSearch,
    activePublicSection,
    activeWorkspaceTab,
    publicSummaryView,
  });

  const onPrimaryActionClick = React.useCallback(
    () => trackUXEvent('workspace_primary_cta_click', { tab: activeWorkspaceTab }),
    [activeWorkspaceTab],
  );

  const overviewMarketRequestsStateModel = React.useMemo(
    () => buildWorkspaceRequestsViewModelFromResponse(overviewMarketRequestsState.response),
    [overviewMarketRequestsState.response],
  );
  const activeOffersState = React.useMemo(
    () =>
      buildWorkspaceOverviewMarketCardsState({
        data: {
          ...data,
          overviewMarketRequestsState: {
            ...overviewMarketRequestsState,
            model: overviewMarketRequestsStateModel,
          },
        },
        isOverviewMode,
      }),
    [data, isOverviewMode, overviewMarketRequestsState, overviewMarketRequestsStateModel],
  );

  const preferredRequestsRole = privateState.preferredRequestsRole;
  const isChatSection = activePublicSection === 'chat';
  const isSettingsSection = activePublicSection === 'settings';
  const isHelpSection = activePublicSection === 'help';
  const isExploreSection =
    activePublicSection === 'providers'
    || activePublicSection === 'stats'
    || activePublicSection === 'actions'
    || activePublicSection === 'profile';
  const {
    requestsPage,
    setRequestsPage,
  } = data;
  const privateRequestsLoading = resolveWorkspacePrivateRequestsLoading({
    workspaceRequests: data.workspaceRequests,
    isWorkspaceRequestsLoading: data.isWorkspaceRequestsLoading,
  });
  const privateRequestsModel = React.useMemo(
    () => buildMyRequestsViewModelFromResponse(data.workspaceRequests),
    [data.workspaceRequests],
  );
const privateTotalPages = React.useMemo(() => {
  const total = privateRequestsModel.response?.list?.total ?? 0;
  const limit = privateRequestsModel.response?.list?.limit ?? 1;

  return Math.max(1, Math.ceil(total / Math.max(1, limit)));
}, [privateRequestsModel.response]);

const privatePagination = React.useMemo(() => {
  if (!privateRequestsModel.response?.list) return null;

  return {
    page: privateRequestsModel.response.list.page ?? 1,
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
      sidePanel={privateRequestsModel.response?.sidePanel ?? null}
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
      mapPanel={overviewMapPanel}
      primaryAction={primaryAction}
      onPrimaryActionClick={onPrimaryActionClick}
      activeOffersState={activeOffersState}
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
        ? buildWorkspaceStandardSectionModel({
          section: 'chat',
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
        aiRail: overviewAiRail,
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
    asideTopSlot: undefined,
    preferredRequestsRole,
    overviewDecisionPanelRef: undefined,
    sectionModel,
    primaryAction,
    isLoading: overviewMarketRequestsState.isLoading,
    overviewRequestsCount,
  };
}
