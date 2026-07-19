# De'ciZhen Actions Growth Center Specification

**Document status:** Approved target contract  
**Version:** 1.5  
**Date:** 2026-07-19  
**Parent specification:** `DECIZHEN_PROJECT_SPECIFICATION.md`  
**Canonical route:** `/workspace?section=actions`

**Workspace layout standard:** `WORKSPACE_LAYOUT_STANDARD.md`

All Actions route state, including `viewerMode`, `mode`, and any destination-specific `focus` values, is governed by the workspace query-parameter registry in `DECIZHEN_PROJECT_SPECIFICATION.md`.

Frontend delivery sequencing, cleanup, and completion gates for this section are governed by `WORKSPACE_FRONTEND_CONVERGENCE_STRATEGY.md`.

Actions must use the canonical workspace shell. The previously explored standalone Actions mockups are non-normative and have been removed.

The Analyse images referenced by `WORKSPACE_LAYOUT_STANDARD.md` govern shell behavior only. They do not define the Actions central canvas. Actions uses its own approved central-canvas reference and inherits collapsed-shell behavior from the workspace standard.

### Approved Actions visual references

| State | Reference |
| --- | --- |
| Sidebar and AI rail expanded | `assets/workspace/actions/decizhen-actions-canonical-expanded-v1.png` |
| Sidebar expanded, AI rail collapsed | `assets/workspace/actions/decizhen-actions-canonical-ai-collapsed-v1.png` |
| Sidebar collapsed, AI rail expanded | `assets/workspace/actions/decizhen-actions-canonical-sidebar-collapsed-v1.png` |
| Sidebar and AI rail collapsed | `assets/workspace/actions/decizhen-actions-canonical-focus-v1.png` |
| Promote a request | `assets/workspace/actions/decizhen-actions-promote-request-detail-v1.png` |
| Improve a profile | `assets/workspace/actions/decizhen-actions-improve-profile-detail-v1.png` |
| Order an expert service | `assets/workspace/actions/decizhen-actions-expert-service-detail-v1.png` |

These references define the approved Growth Center composition, shell recomposition, management-card behavior, and focused workflows. When either shell tool collapses, the central canvas consumes the released width. The compact Decision Indicator floats above the canvas and reserves no column.

---

## 1. Purpose

Actions is the role-aware Growth Center of the De'ciZhen workspace.

It helps a user understand and execute the most useful next step, improve marketplace readiness, activate transparent promotion tools, order expert support, and evaluate promotion results.

Actions is not:

- a duplicate profile editor;
- a generic notification inbox;
- a page containing only paid advertising;
- an AI chat surface;
- a replacement for Statistics;
- a way to purchase verification or manipulate organic trust signals.

The section answers:

> What should I do now to achieve a better result?

---

## 2. Product Relationship

| Section | Question answered |
|---|---|
| Profile | Who am I, and how are my services represented? |
| Statistics | What is happening in the market and in my activity? |
| Actions | What should I do next to improve the result? |

Actions may deep-link to Profile, Requests, Providers, Reviews, Chat, or Statistics. The target section remains the owner of the actual editing or workflow form.

---

## 3. Information Architecture

The section contains four canonical modes:

1. `recommended` — prioritized next actions;
2. `promote` — promotion products and eligibility;
3. `expert-services` — professional support services;
4. `campaigns` — campaign lifecycle and results.

Recommended is the default mode.

The mode should be represented by an accessible tab or segmented-control pattern. On small screens it may use a horizontally scrollable tab row, provided all tabs remain keyboard-accessible and visible without precision gestures.

---

## 4. Role-Aware Behavior

### 4.1 Provider context

Provider actions may include:

- complete profile information;
- add service area;
- add portfolio media;
- define services and categories;
- update availability;
- verify identity where applicable;
- respond to a request or customer;
- request a review after eligible completed work;
- improve a low-performing service presentation;
- activate Available Now;
- promote a profile or service;
- order profile or campaign support.

### 4.2 Customer context

Customer actions may include:

- complete account or request information;
- respond to provider questions;
- compare received offers;
- invite matching providers;
- update an expiring request;
- mark a request urgent where eligible;
- increase request reach;
- complete a service workflow;
- submit an eligible review.

### 4.3 Dual-role users

Users with both customer and provider contexts must be able to switch context without losing the selected Actions mode. Recommendations and campaign data must clearly identify their role context.

---

## 5. Recommended Actions

### 5.1 Action card requirements

Every recommendation card must contain:

- stable action ID;
- title;
- concise reason;
- role context;
- source: workflow, system rule, AI, quality gate, or opportunity;
- semantic type;
- priority;
- estimated completion time when meaningful;
- destination or executable action;
- eligibility and blocking state;
- dismissal/snooze policy where permitted;
- analytics event metadata.

### 5.2 Priority

Suggested priority classes:

- critical — blocks account, trust, safety, or active workflow;
- high — time-sensitive user or marketplace action;
- medium — meaningful quality or conversion improvement;
- low — optional optimization.

Priority must be backend-owned. The frontend must not derive urgency from raw fields.

### 5.3 Semantic presentation

- Action Required uses the action semantic family.
- Risk is reserved for actual negative impact or threat.
- Opportunity indicates beneficial potential.
- AI indicates system-generated interpretation, not positivity.
- Demand and Supply signals retain their platform meanings.

Color must not be the only signal.

### 5.4 Deep links

Actions that modify another product entity must deep-link to the exact owning surface and state.

Examples:

```text
Complete profile -> /workspace?section=profile&profileView=availability-service-area
Reply to request -> /workspace?section=requests&requestId=...
Review performance -> /workspace?section=stats&view=profile-performance
```

Final query names must follow the shared workspace query-parameter registry and be documented there before implementation.

---

## 6. Promotion Tools

### 6.1 Provider tools

Candidate products:

- Profile Spotlight;
- Available Now;
- Service Spotlight;
- Category Boost;
- Local Visibility;
- Targeted Campaign.

### 6.2 Customer tools

Candidate products:

- Featured Request;
- Urgent Request;
- Targeted Provider Reach;
- Direct Invitations;
- Request Refresh.

### 6.3 Promotion eligibility

A promotion may activate only when:

- the target exists and is active;
- the user owns or may manage it;
- required profile/request quality is met;
- category and geographic targeting are relevant;
- policy and moderation status permit promotion;
- required payment or credit state is valid;
- the promotion does not conflict with an active campaign rule.

### 6.4 Transparency

Before activation, show:

- target;
- placement;
- eligible audience;
- category and geography;
- schedule and duration;
- cost or credit use when applicable;
- budget limit;
- estimated reach range;
- cancellation and refund rules;
- attribution window;
- `Sponsored` disclosure behavior.

Estimated results must never be represented as guarantees.

### 6.5 Organic integrity

- Paid campaigns must not silently rewrite organic scores.
- Sponsored content must be visibly marked.
- Organic and sponsored metrics must remain separate.
- Users must retain a normal non-promoted participation path.
- Verification, rating, review quality, and earned trust levels cannot be purchased.

---

## 7. Expert Services

Candidate services:

- Profile Review;
- Profile Setup;
- Description and Copywriting;
- Portfolio Preparation;
- Photo or Video Content;
- Service and Category Setup;
- Local Visibility Consultation;
- Campaign Setup;
- Performance Consultation.

Every service card must state:

- provider of the service: De'ciZhen staff or independent marketplace specialist;
- scope and deliverables;
- prerequisites;
- expected turnaround;
- price when commerce is enabled;
- revision or cancellation policy;
- trust or verification status of the service provider;
- CTA and order status.

Independent specialists must not be described as platform staff.

---

## 8. Campaigns and Results

### 8.1 Campaign states

```text
draft
scheduled
active
paused
completed
cancelled
rejected
```

Backend owns valid transitions and action availability.

### 8.2 Campaign card

Show:

- promoted target;
- status;
- placement;
- audience;
- schedule;
- budget and spend where applicable;
- impressions;
- target views;
- clicks;
- messages, offers, invitations, or orders as relevant;
- conversion result;
- attribution window;
- pause, resume, edit, or end actions when legal.

Vanity metrics must not dominate. The UI should emphasize meaningful outcomes.

---

## 9. Desktop Layout Template

Target breakpoint: wide workspace layouts, typically `>= 1280px`.

The Actions section must use the existing canonical workspace frame rather than introducing a new dashboard shell.

Fixed structure:

1. collapsible workspace sidebar on the left;
2. persistent workspace control bar at the top;
3. invariant AI decision rail on the right;
4. variable central Actions canvas;
5. accessible section title and description retained in the document structure but visually hidden in dense desktop mode when navigation and the contextual controls already identify the section;
6. central content sections:
   - readiness summary;
   - recommended action queue;
   - promotion tools;
   - expert services;
   - recent campaign results;
7. canonical rail sections, always in this order:
   - Decision Panel;
   - Action Queue;
   - Recommendations.

Actions changes only the central canvas and the context supplied to the fixed top bar and AI rail.

The section must not create a vertically unbounded dashboard. Its default desktop state fits the priority workflow into the fixed central canvas. Bounded collections use pagination. Secondary modules may be summarized as preview cards and open into the full central canvas without replacing the workspace shell.

---

## 10. Tablet Layout Template

Target breakpoint: approximately `768px–1279px`.

- The sidebar collapses to an icon rail by default but remains expandable.
- The top control bar keeps the same role and visual grammar.
- Main content uses one wide central column.
- The AI rail may become a fixed overlay/drawer trigger when simultaneous three-column display is no longer usable; its internal three-block structure does not change.
- Promotion and expert-service cards use a two-column grid where space permits.
- Tabs remain visible and scroll only when necessary.
- No desktop-only sticky rail is required.

---

## 11. Mobile Layout Template

Target breakpoint: `< 768px`.

- Use the canonical mobile workspace header and navigation pattern.
- Content uses one column.
- Page padding, card radii, and control heights use shared mobile tokens.
- Recommended actions appear before promotional products.
- Sidebar navigation becomes the canonical mobile navigation/drawer while retaining badges for unseen changes.
- The top control bar becomes a compact sticky control surface.
- The AI rail remains persistently reachable through one fixed decision control and opens as a sheet with the same Decision Panel, Action Queue, and Recommendations order.
- The primary CTA may become a bottom sticky action only when one clear action exists.
- Cards must not rely on hover.
- Campaign metrics use compact rows or a horizontally safe mini-grid.
- Tabs may scroll horizontally but must expose focus and selected state.
- Promotion activation uses a full-screen sheet or dedicated route, not a cramped modal.
- Expert-service details use a dedicated sheet or route.

---

## 12. Shared Workspace Page Template

Actions must be implemented using a reusable workspace page grammar that can standardize other sections.

Canonical primitives should include:

- `WorkspaceSectionHeader`;
- `WorkspaceModeTabs`;
- `WorkspaceSummaryBand`;
- `WorkspaceContentGrid`;
- `WorkspaceMainColumn`;
- `WorkspaceDecisionRail`;
- `WorkspaceSurface`;
- `WorkspaceActionCard`;
- `WorkspaceMetricCard`;
- `WorkspaceEmptyState`;
- `WorkspaceErrorState`;
- `WorkspaceSectionSkeleton`.

Names are illustrative until aligned with the existing codebase. The implementation must reuse existing canonical primitives when equivalent behavior already exists.

The template must standardize:

- maximum content width;
- page gutters;
- vertical rhythm;
- surface levels;
- headings and supporting text;
- tab behavior;
- rail behavior;
- loading/empty/error treatment;
- responsive stacking;
- focus and motion behavior.

---

## 13. Visual Requirements

The section follows premium minimal Calm Intelligence:

- warm neutral background field;
- white or near-white cards and rail panels;
- near-black primary typography;
- cool muted-gray supporting text and icons;
- deep navy as the single dominant interaction color;
- subtle borders and short layered shadows;
- matte, restrained control surfaces;
- semantic color only in small dots, rings, chart segments, icons, or badges where meaning requires it;
- no multicolored card backgrounds;
- no neon, heavy glow, glossy glass, or decorative gradients.

Cards must use consistent radius, border, shadow, internal spacing, title hierarchy, metadata, and CTA placement.

Sponsored treatments must be premium, neutral, and clearly disclosed. They must not visually imitate organic trust badges or use large purple promotional surfaces.

### 13.1 Informative visual hierarchy

Premium minimalism must not reduce the central canvas to undifferentiated text and numbers. Actions must communicate state, progress, impact, and movement through a restrained set of reusable data-visual patterns.

Approved patterns:

- thin horizontal progress bars for profile, readiness, campaign, and setup completion;
- compact segmented progress or completion scales;
- small trend sparklines when a real time series exists;
- before/after or current/target comparisons;
- compact impact labels such as `High impact`, `Medium impact`, or `Required`;
- estimated completion time;
- small metric deltas with an explicit comparison period;
- step completion markers;
- restrained iconography from the canonical icon set;
- small semantic dots, side rules, or icon accents;
- outcome-oriented campaign metrics;
- clear current, target, and remaining values.

Decorative charts, invented trends, unsupported percentages, and progress values without a defined calculation are prohibited.

### 13.2 Central-canvas indicator logic

The Decision Intelligence Language applies inside the central canvas as well as in the AI rail:

- Demand blue marks real request, lead, or market-demand signals;
- Supply sand marks provider availability or marketplace capacity;
- Opportunity sage marks beneficial potential or measurable improvement;
- Risk red marks actual loss, blockage, or negative impact;
- AI purple marks only AI-generated interpretation or recommendation origin;
- Action orange marks a user task or required next step;
- Neutral and navy remain the default presentation and interaction colors.

Semantic color must stay local to the relevant indicator. It may fill a thin progress segment, small icon background, dot, badge, or sparkline, but not the full card or section.

### 13.3 Actions-specific visual modules

The central Actions canvas should support:

1. **Growth readiness strip** — profile completion, visibility state, response readiness, and open-action count with current/target progress;
2. **Recommended action row** — semantic source, impact, effort/time, completion state, and CTA;
3. **Promotion forecast card** — eligible audience or placement, estimated range, campaign state, and disclosure;
4. **Expert service card** — expected deliverable, duration, provider type, and starting price where commerce is enabled;
5. **Campaign result summary** — impressions, qualified views, messages/offers, conversion, and trend period;
6. **Milestone progress** — a small ordered sequence for onboarding or campaign setup when the flow has multiple real steps.

These modules must use shared workspace primitives and the same calculation definitions across desktop, tablet, and mobile.

---

## 14. Accessibility

- Full keyboard navigation.
- Correct tab semantics.
- Visible focus state in light and dark themes.
- Accessible names for icon-only actions.
- Priority and semantic type expressed in text, not color only.
- Screen-reader status updates for campaign activation and state changes.
- Reduced-motion support.
- Touch targets appropriate for mobile.
- No horizontally clipped cards or controls at required breakpoints.

---

## 15. Backend Contract Direction

The canonical section contract should be section-shaped and ready to render.

Suggested top-level structure:

```ts
type WorkspaceActionsResponse = {
  header: ActionsHeader;
  context: ActionsRoleContext;
  tabs: ActionsModeSummary[];
  readiness: ActionsReadinessSummary;
  recommended: RecommendedAction[];
  promotions: PromotionProduct[];
  expertServices: ExpertService[];
  campaigns: CampaignSummary[];
  decisionRail: ActionsDecisionRail;
  permissions: ActionsPermissions;
};
```

Backend owns:

- priority;
- eligibility;
- legal actions;
- campaign states;
- recommendations and their source;
- placement availability;
- budget and policy constraints;
- outcome metrics;
- action destinations or typed intents.

Frontend owns layout, interaction, local presentation state, safe optimistic behavior, formatting, and responsive composition.

## 16. Implementation boundary

This document is an approved target contract for the preview refactor line.

The backend already exposes an Actions section contract and route ownership for `/workspace?section=actions`. The current preview frontend still contains transitional profile-oriented rendering in some Actions paths, so adopting this specification requires dedicated section convergence rather than styling-only cleanup.

---

## 16. MVP Scope

The first production increment should contain:

1. Recommended actions;
2. profile/readiness completion;
3. workflow actions;
4. Available Now;
5. Featured Request;
6. Profile Spotlight;
7. Profile Review expert service;
8. impressions, views, and messages/offers metrics;
9. campaign history;
10. explicit Sponsored labeling.

Advanced auction pricing, automated budget optimization, AI campaign generation, broad external targeting, and complex attribution are excluded from the first increment.

---

## 17. Acceptance Criteria

The section is acceptable when:

- `/workspace?section=actions` is canonical and does not redirect to Profile;
- navigation exposes Actions consistently for eligible authenticated users;
- role context changes content without changing the section architecture;
- recommended actions deep-link to the correct owning surface;
- the frontend does not calculate backend-owned priority or eligibility;
- sponsored and organic content are distinguishable;
- verification cannot be purchased;
- all four modes have loading, empty, error, and success states;
- desktop, tablet, and mobile layouts follow shared workspace primitives;
- keyboard, screen-reader, contrast, and reduced-motion checks pass;
- relevant unit, component, contract, and critical E2E tests pass;
- documentation and route aliases no longer describe `actions -> profile` as the target architecture.
