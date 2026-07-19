# De'ciZhen Workspace Layout Standard

**Document status:** Approved target contract  
**Version:** 1.0  
**Date:** 2026-07-18  
**Parent specification:** `DECIZHEN_PROJECT_SPECIFICATION.md`

## 1. Purpose

This document defines the reusable workspace frame for every De'ciZhen section. Requests, Providers, Statistics, Actions, Profile, Reviews, Chat, and future sections must extend this frame rather than create independent page shells.

The workspace is one responsive working window. Navigation and decision tools remain available while only the central product canvas changes.

Route ownership and query-parameter behavior are defined centrally in `DECIZHEN_PROJECT_SPECIFICATION.md`. This document defines shell behavior, not an independent route surface.

Frontend delivery sequencing, cleanup standards, and convergence gates are defined in `WORKSPACE_FRONTEND_CONVERGENCE_STRATEGY.md`.

## 2. Canonical shell visual references

These are the only approved visual references for workspace shell geometry, fixed regions, expanded/collapsed behavior, and central-grid recomposition:

1. `decizhen-workspace-canonical-desktop-v2.png` — expanded sidebar and expanded AI rail;
2. `decizhen-workspace-canonical-collapsed-v1.png` — icon sidebar and collapsed AI rail represented by the floating Decision Indicator.

Both images use the Analyse section only to demonstrate the shared shell. Their central analytical content is not a visual specification for Actions or any other section. Every section owns its central canvas specification while inheriting this shell unchanged.

When a visual reference conflicts with written accessibility, contract, or semantic requirements, the written requirement governs. New references must explicitly supersede these files in the same documentation change.

## 3. Application frame

The desktop shell occupies the available viewport height (`100dvh`). The application document must not scroll as one long page.

```text
expanded:  232px sidebar | minmax(0, 1fr) central canvas | 320px AI rail
collapsed:  72px sidebar | minmax(0, 1fr) central canvas
```

The persistent top bar sits above the central canvas and AI context. It contains global search, relevant commands, notifications, account controls, and the canonical primary creation action.

### 3.1 Sidebar

- Expanded width: `232px`.
- Collapsed width: `72px`.
- Expanded rows show icon, label, and a compact change count when relevant.
- Collapsed rows show the same icon and compact count only.
- Counts represent unseen or uncleared relevant changes, not decorative marketplace totals.
- Active, focus, hover, tooltip, and notification states must remain accessible in both modes.
- Settings and Help remain anchored at the bottom.
- Collapse and expand must not change route or central state.

### 3.2 Top bar and contextual controls

- The top bar is fixed and uses the same geometry across sections.
- Section context controls begin immediately below it.
- A large visible title and subtitle are omitted in dense desktop workspace mode to preserve vertical space.
- The semantic `h1` and description remain available to assistive technology and search indexing through a visually-hidden implementation.
- Tabs, filters, period, sorting, layout, reset, and other section controls use one compact control surface.
- Controls may change by section; their hierarchy and component grammar must remain stable.

### 3.3 AI decision rail

- Expanded desktop width: `320px`.
- The expanded rail is fixed and contains, in order: Decision Panel, Action Queue or the approved contextual opportunity queue, and Recommendations.
- Rail modules must fit the available desktop height without clipped text.
- The rail must not independently redesign its structure for each section.
- AI provenance and business semantics are separate signals.

### 3.4 Collapsed Decision Indicator

When the AI rail collapses:

- the rail column is removed from the shell grid;
- the central canvas receives the released width;
- a `64px` circular Decision Indicator remains fixed below the top bar near the upper-right edge;
- the indicator retains the primary decision value and semantic ring;
- an AI provenance marker and pending count may be displayed when applicable;
- clicking or keyboard-activating it restores the rail;
- it must have an accessible name, visible focus state, tooltip, and minimum target size;
- it must not obscure filters, headings, card controls, or data.

## 4. Central canvas

The central canvas uses `minmax(0, 1fr)` and expands into all space released by shell controls.

It must not preserve a fixed-width desktop column after the sidebar or rail collapses. Responsive recomposition may:

- add grid columns;
- widen charts or maps;
- place related preview cards on one row;
- reduce the number of required rows;
- increase information shown inside a card when readability permits.

It must not create empty spacer columns, stretch text lines without limits, or reduce typography simply to fit more content.

## 5. Content navigation instead of page scrolling

The default desktop canvas is a bounded overview or working state. The whole application page does not scroll vertically.

### 5.1 Lists and card collections

- Use backend-bounded pagination.
- Page size may be selected from approved values or computed from supported viewport classes.
- Pagination controls remain inside the central canvas.
- Changing page must preserve filters, sorting, selected mode, sidebar state, and rail state.
- Virtualization may be used for specialized dense collections but must not replace accessible pagination without documented justification.

### 5.2 Statistics and complex sections

- The overview shows concise preview cards for each analytical section.
- Each preview communicates its metric, trend or visualization, context, and an accessible Open action.
- Activating a preview opens that analytical section using the full central canvas.
- The shell, contextual controls, filters, and decision context remain mounted.
- The full-section view provides an explicit return to Overview.
- URL state should represent shareable drill-down state.

## 6. Responsive grid rules

Grid behavior is driven by available central width, not device names alone.

- With expanded sidebar and rail, use the highest column count that keeps cards readable; the approved 1440px analytics overview uses a disciplined three-column grid with intentional spans.
- With the sidebar collapsed, consume the released `160px` through recomposition.
- With the rail collapsed, consume the released `320px`; the approved analytics overview uses a four-column grid.
- On larger monitors, additional columns or rows may be introduced only when they improve comparison or keep more relevant information in view.
- Card minimum widths and content requirements determine transitions; avoid arbitrary device-specific layouts.

Grid density may depend on both available central width and available central height. A collection must derive columns from the width of its own central container and visible rows from the height remaining after fixed shell controls and pagination. Feature specifications define their own safe card bounds. Requests uses the two-dimensional rules in `REQUESTS_SECTION_LAYOUT_SPECIFICATION.md`.

## 7. Canonical design tokens

All layout surfaces use the project tokens. Hard-coded substitutes are prohibited in feature styles.

Core light values include:

- background `#f7f6f2`;
- surface `#ffffff`;
- primary `#2f3a56`;
- text `#121418`;
- success `#6f8f74`;
- warning/action `#c9a56a`;
- information/demand `#5b7c99`;
- danger/risk `#b85c5c`.

AI provenance requires the following missing token family:

```css
--color-ai: #7a6a9f;
--color-ai-soft: #f3f0f7;
--color-ai-border: #e4ddec;
```

Violet communicates system-generated interpretation only. A separate semantic marker communicates whether that interpretation concerns demand, supply, opportunity, risk, action, or neutral information.

## 8. State persistence and motion

- Sidebar and rail transitions use project motion tokens.
- Layout recomposition must avoid abrupt content loss and excessive animation.
- Reduced-motion preferences must be respected.
- Expansion preferences should persist per authenticated user where permitted.
- Filters, sorting, pagination, selected analytical section, and safe presentation state survive shell expansion changes.

## 9. Acceptance criteria

The workspace standard is satisfied when:

- the shell fits the supported desktop viewport without document scrolling;
- sidebar, top bar, and expanded rail remain fixed;
- the collapsed sidebar contains only usable icons and relevant compact counts;
- the collapsed rail reserves no layout column and exposes the Decision Indicator;
- the center consumes all released width and visibly recomposes its grid;
- all primary information remains readable and visible without clipping;
- lists use bounded pagination;
- analytical previews open inside the central canvas;
- shell and filter state survive drill-down and collapse transitions;
- semantic color and AI provenance follow the Decision Intelligence Language;
- light and dark themes preserve identical hierarchy and meaning.

## 10. Implementation boundary

This document is an approved target contract for the preview refactor line.

The current preview branch already uses one `/workspace` shell and converged workspace navigation, but not every section yet satisfies the full fixed-height, recomposition, and shared-rail behavior described here. Current implementation gaps do not redefine this target shell contract.
