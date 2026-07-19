# De'ciZhen Workspace Frontend Convergence Strategy

**Document status:** Approved target contract  
**Version:** 1.0  
**Date:** 2026-07-19  
**Parent specification:** `DECIZHEN_PROJECT_SPECIFICATION.md`  
**Related standards:** `WORKSPACE_LAYOUT_STANDARD.md`

## 1. Purpose

This document defines the approved frontend delivery strategy for converging the De'ciZhen workspace to its section specifications, visual references, and shared UI standards.

It is not a claim that the current preview branch already satisfies the target behavior.

It exists to prevent a recurring failure mode:

- data appears on screen;
- the backend contract is partially wired;
- the section is declared "done";
- the visual system, state coverage, naming, file boundaries, and transitional code remain unfinished.

That is not acceptable platform completion.

## 2. Scope

This strategy applies to all workspace-owned frontend surfaces on `preview/v0.4.0-workspace-platform`, including:

- overview/dashboard;
- requests;
- providers;
- reviews;
- statistics;
- profile;
- actions;
- chat where section-specific convergence is required;
- shell-owned workspace surfaces where layout, navigation, or shared primitives are affected.

## 3. Normative position

This document is an approved target contract and delivery strategy.

It governs:

- how frontend convergence work is sequenced;
- how sections are audited and declared complete;
- how shared UI standards must be adopted;
- how transitional code is replaced and removed;
- how implementation evidence is collected before completion.

It does not override:

- canonical route truth;
- backend ownership rules;
- section-specific product behavior defined in the owning specification.

Those remain governed by:

1. `DECIZHEN_PROJECT_SPECIFICATION.md`
2. `WORKSPACE_LAYOUT_STANDARD.md`
3. the owning section specification

## 4. Core convergence principles

### 4.1 Backend continuity

- The existing backend remains the baseline.
- Existing backend workspace contracts must be reused wherever they already provide the needed section semantics.
- Missing endpoints or fields are added separately and only through documented contracts.
- Frontend must not substitute fake production data where required backend data does not yet exist.
- When data is unavailable, the section must render an intentional loading, unavailable, partial, or restricted state instead of invented truth.

### 4.2 Section-by-section convergence

- Workspace sections are converged deliberately, one section at a time or through tightly scoped shared-infrastructure work that directly supports them.
- Each section must be brought to the shared workspace layout, UI standard, and route model.
- A section is not considered complete merely because its primary data is visible.
- Completion requires product, visual, state, responsive, and architectural alignment with the approved documentation.

### 4.3 Shared visual system is mandatory

Every converged section must use the shared workspace visual system:

- global fonts;
- typography scale;
- vertical rhythm;
- spacing system;
- color palette;
- semantic indicators;
- cards and surfaces;
- loading, empty, error, partial, and restricted states;
- responsive behavior;
- shared navigation and shell grammar.

Local one-off visual dialects are not an acceptable end state.

### 4.4 Visual references are normative

- Frontend implementation must align with approved workspace mockups, assets, and section specifications.
- Assets and visual references are not decorative inspiration; they are implementation targets within the limits of real data and accessibility.
- If implementation cannot match an approved reference because of a real product or contract constraint, the specification must be updated explicitly.

### 4.5 Cleanup is part of delivery

- Transitional rendering paths must be removed after safe replacement.
- Dead code must not be preserved as silent debt after a section converges.
- Files and components must be renamed professionally when their old names no longer describe canonical ownership.
- Files must be moved into correct feature and architecture boundaries.
- Duplicated logic, duplicate styles, and parallel primitives must be consolidated rather than left in place for convenience.

## 5. Shared frontend standards

### 5.1 Naming and ownership

- Feature names must reflect canonical workspace ownership.
- Request-branded or legacy-branded names must be replaced when the feature is no longer request-owned.
- Transitional wrapper names are acceptable only during active migration and must carry a removal path.

### 5.2 File boundaries

Frontend files must converge to correct boundaries:

- route and shell orchestration;
- section-specific presentation;
- section-specific state;
- shared workspace primitives;
- API/contract integration;
- feature-local tests.

No section should permanently depend on unrelated historical feature folders when canonical ownership has moved.

### 5.3 Style boundaries

- Shared primitives own shared styles.
- Section styles own section-specific composition only.
- Global tokens remain the source of truth for typography, color, radius, spacing, and motion.
- Large style duplication or many competing panel/card systems are not acceptable.

## 6. Required section delivery workflow

Every workspace section must follow this workflow:

1. documentation and visual audit;
2. current implementation audit;
3. backend contract audit;
4. gap definition;
5. architecture and file plan;
6. UI implementation;
7. data and behavior integration;
8. loading, empty, error, partial and restricted states;
9. responsive verification;
10. dead-code removal;
11. file renaming and relocation;
12. tests;
13. visual comparison;
14. documentation update;
15. isolated commit.

Skipping later cleanup and verification steps because earlier rendering "works" is not valid convergence.

## 7. Required audit dimensions per section

Before a section can be considered complete, the work must address:

- product ownership and section purpose;
- route model and URL behavior;
- backend contract coverage;
- shell integration;
- main content behavior;
- rail behavior;
- loading, empty, error, partial, and restricted states;
- responsive layout;
- accessibility behavior;
- visual comparison against approved references;
- naming, file ownership, and cleanup;
- documentation reconciliation.

## 8. Definition of section completion

A workspace section is complete only when all of the following are true:

- it uses the canonical workspace route and section-local route surface defined by the docs-pack;
- it renders through the shared workspace shell and layout rules;
- it uses approved backend contracts or explicitly documented temporary contract gaps;
- it does not rely on fake production data;
- its visual implementation matches the approved section specification closely enough to be considered the same product surface;
- its loading, empty, error, partial, and restricted states are deliberate and tested;
- its responsive behavior is verified;
- its transitional and dead code has been removed or reduced to documented, temporary wrappers;
- its files and components are named and located according to canonical ownership;
- its tests and documentation are updated;
- its implementation has been reviewed against both the current contract and the approved target.

## 9. Known non-goal

This strategy does not claim that convergence is already complete.

It is an approved delivery standard for finishing the preview refactor line professionally.
