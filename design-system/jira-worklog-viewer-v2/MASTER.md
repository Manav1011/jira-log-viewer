# Design System: Jira Worklog Viewer v2

> **Source of Truth:** This design system is built for technical precision and high-performance environments.

## Colors
| Role | Hex | Tailwind Class |
|------|-----|----------------|
| Surface | `#121414` | `bg-v2-surface` |
| Primary (Vibrant Orange) | `#f27f0d` | `text-v2-primary` / `bg-v2-primary` |
| Surface Container | `#1f2020` | `bg-v2-surface-container` |
| Surface High | `#292a2a` | `bg-v2-surface-high` |
| Outline | `#a58c7c` | `border-v2-outline` |

## Typography
- **Headlines & Labels:** `Space Grotesk` (all-caps, letter-spaced)
- **Body Content:** `Inter`
- **Data/Logs:** `monospace`

## Shapes
- **Corner Radius:** strictly `0px` (Sharp corners)
- **Gutters:** `1px` borders (`border-v2-surface-highest`)

## Components
- **Buttons:** Rectangular, no rounding. Solid primary fill or hollow secondary border.
- **Progress Bars:** Segmented blocks (8 segments per 8h day).
- **Layout:** Rigid modular grid using 1px dividers.

## Hierarchy
- **Level 0:** Surface (#121414)
- **Level 1:** Panels with 1px borders (#292a2a)
- **Level 2:** Elevated containers (#1f2020)
