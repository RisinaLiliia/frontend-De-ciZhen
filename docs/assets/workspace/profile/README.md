# Profile Visual Reference Set

## Status

- Approved target-state references
- Route: `/workspace?section=profile`
- Owning specification: [`../../../PROFILE_SECTION_SPECIFICATION.md`](../../../PROFILE_SECTION_SPECIFICATION.md)
- Approved: 2026-07-19

These images define the target composition and responsive behavior for the Workspace Profile section. They are design references, not evidence that the corresponding React implementation is complete.

## Overview States

| File | Shell state |
| --- | --- |
| `profile-overview-expanded-v1.png` | Expanded left sidebar and expanded AI rail |
| `profile-overview-sidebar-collapsed-v1.png` | Collapsed left sidebar and expanded AI rail |
| `profile-overview-ai-collapsed-v1.png` | Expanded left sidebar and collapsed AI rail |
| `profile-overview-focus-v1.png` | Collapsed left sidebar and collapsed AI rail |
| `profile-overview-tablet-v1.png` | Tablet composition |
| `profile-overview-mobile-v1.png` | Mobile composition |

## Detail States

| File | Central-canvas destination |
| --- | --- |
| `profile-identity-contact-detail-v1.png` | Identity and contact editor |
| `profile-public-presentation-detail-v1.png` | Public presentation and preview |
| `profile-services-pricing-detail-v1.png` | Service catalogue and pricing |
| `profile-availability-service-area-detail-v1.png` | Availability and service coverage |
| `profile-trust-verification-detail-v1.png` | Trust, evidence, and verification |
| `profile-customer-context-v1.png` | Customer role management context |

## Interpretation Rules

- The application tokens and shared workspace primitives are authoritative for exact implementation values.
- The central canvas consumes width released by either collapsed shell tool.
- The compact AI indicator is an overlay and reserves no grid column.
- Detail screens replace only the central canvas; the surrounding workspace shell remains stable.
- Generated example copy and data are illustrative. Product contracts and localized copy remain authoritative.
- New visual revisions must use a new version suffix and update the owning specification.
