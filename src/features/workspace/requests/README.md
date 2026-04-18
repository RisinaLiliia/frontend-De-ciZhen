# Workspace Requests

Private requests (`/workspace?section=requests&scope=my`) follow a contract-driven pattern:

- backend calculates workflow state, decision state, queue order, and right-rail summary
- frontend renders the returned contract and only manages local UI mode (`default` vs `decision`)

## Private Requests Contract

`workspaceRequests` is the source of truth for:

- `summary`
  - top filter cards (`Alle`, `Aktiv`, `In Ausführung`, `Abgeschlossen`)
- `list.items[]`
  - shared request card preview + workflow progress
  - `decision`
    - `needsAction`
    - `actionType`
    - `actionPriority`
    - `actionPriorityLevel`
    - `actionLabel`
    - `actionReason`
    - `lastRelevantActivityAt`
    - `primaryAction`
      - backend-owned CTA payload for the active decision card
- `decisionPanel`
  - `summary`
  - `primaryAction`
  - `queue[]`
  - `overview`

## Owner Menu Contract

Customer request cards do not invent menu entries locally. The kebab menu is rendered from backend `list.items[].status.actions`.

Supported owner-menu actions:

- `link` with `key === 'edit-request'`
- `duplicate_request`
- `share_request`
- `archive_request`
- `delete_request`

Frontend responsibilities are intentionally small:

- render menu items in backend order
- execute `duplicate/archive/delete` mutations through request APIs
- execute `share_request` with `navigator.share` or clipboard fallback
- keep hard-delete confirmation in UI before calling `delete_request`

Archived requests are removed by the backend contract itself after a refresh or query invalidation. The workspace view no longer keeps a separate local archive state.

## Decision Mode

`useDecisionMode.ts` owns query-driven state:

- `mode=decision`
- `activeRequestId=<requestId>`

Behavior:

- entering decision mode filters the left column to `decision.needsAction === true`
- card order follows backend `decisionPanel.queue`
- active card CTA comes from backend `decision.primaryAction`
- when the active request drops out of the queue after a refresh, the next request becomes active automatically

## Rendering

- `RequestsPrivateView.tsx`
  - renders summary cards, decision mode bar, and request cards
- `components/DecisionPanel.tsx`
  - renders the right-column decision summary, queue, and overview
- `components/DecisionModeBar.tsx`
  - renders the left-column mode state and progress
