# FreelAI — Official Design System Documentation

This document serves as the guide for the FreelAI official design system. It details the design tokens, layout utilities, reusable page templates, and shared UI/AI components.

---

## 1. Design Tokens

### Color Tokens
Declared inside `src/styles/tokens.css` and mapped semantically based on active theme:
- `Void` (`#08090a` / `--color-void`): Deep canvas substrate background.
- `Carbon` (`#0f1011` / `--color-carbon`): Component frames, cards, sidebars.
- `Obsidian` (`#161718` / `--color-obsidian`): Elevated fields, active cards.
- `Graphite` (`#23252a` / `--color-graphite`): Structural hairline borders.
- `Smoke` (`#383b3f` / `--color-smoke`): Section borders and strong dividers.
- `Acid Lime` (`#e4f222` / `--color-acid-lime`): Primary electric brand CTA highlight.
- `Pulse Green` (`#27a644` / `--color-pulse-green`): Stable/active indicators.
- `Coral Red` (`#eb5757` / `--color-coral-red`): Error/risk status indicators.
- `Iris Violet` (`#6366f1` / `--color-iris-violet`): Tag fills and primary metrics.
- `Lavender` (`#8b5cf6` / `--color-lavender`): Secondary tag fills and category metrics.

### Typography
Uses **Inter Variable** for UI/Headings and **Berkeley Mono** for monospace metadata:
- Heading font weights are capped at `510` (medium-bold) to keep the midnight canvas clean.
- Bold weight is capped at `590` (no pure `700` bold).
- Alternate glyph features enabled globally: `"cv01" on, "ss03" on, "zero" on`.

### Spacings & Shapes
- Spacing Scale: Base unit of `4px` (4px to 128px scale).
- Named Radii:
  - Cards: `12px` (`--radius-cards`)
  - Inputs & Buttons: `6px` (`--radius-inputs` / `--radius-buttons`)
  - Badges: `4px` (`--radius-badges`)
  - Pills: `9999px` (`--radius-pills`)

---

## 2. Reusable Layouts & Templates

Located in `src/components/layout/` and `src/components/templates/`:
- `AppContainer`: Coordinates sidebar collapse states, top navigation, search command palette, and skip navigation links.
- `PageLayout`: Sets standard page width restrictions and default scrolling gutters.
- `PageSection`: Vertical rhythm block establishing section gaps (`96px`).
- `DashboardTemplate`: Standardized layout for dashboard overview screens.
- `ManagementTemplate`: Grid layout containing a page header, search filters toolbar, and data list.
- `DetailTemplate`: Detailed tabbed panel layout displaying timeline events and sidebar widgets.
- `EditorTemplate`: Standardized form flow with preview drawers.
- `AnalyticsTemplate`: Layout optimized for displaying Recharts and financial overview data.
- `SettingsTemplate`: Unified panel containing sidebar category buttons and setting fields.

---

## 3. Component Libraries

Import components directly from barrel exports:
```typescript
import { Button, Card, DataTable, PageHeader } from "@/components/ui";
import { AICopilot, AIInsightCard, AIScore } from "@/components/ai";
import { StatusBadge, PriorityBadge } from "@/components/status";
```

### A. Shared UI Library (`src/components/ui/`)
- `Button`: Primary (Acid Lime), Secondary (Graphite Outline), Ghost, and Pill buttons with 6px border radii.
- `Card`: Frame layouts with 12px border radii.
- `StatCard` / `MetricCard`: Normalized statistical KPI parameters with inline icon wrappers.
- `SearchBar`: Standardized query text input.
- `FilterBar`: Toggle switcher tab list.
- `Timeline`: Milestone progress events for invoice details or onboarding guides.
- `DataTable` & data controls (`TableToolbar`, `TableFilters`, `BulkActions`, `Pagination`, `EmptyState`, `LoadingState`, `ExportButton`).
- `Skeleton`: Reusable loading skeletons.
- `ChartContainer`: Frame box providing unified styling to Recharts components.

### B. Dedicated AI Library (`src/components/ai/`)
- `AICopilot`: Centralized prompt consultation overlay with typewriter animations.
- `AIInsightCard`: Carbon card highlighting key AI-generated updates with secondary colors.
- `AIRecommendation`: Insight block indicating tips for invoices or proposal outreach.
- `AIConfidenceBadge`: Numerical feedback indicating AI confidence metrics.
- `AIActionCard`: Insight container featuring an actionable CTA.
- `AIScore`: Matching percentage radial circle.

### C. Status Components (`src/components/status/`)
- `StatusBadge`: Generic status wash maps.
- `PriorityBadge`: Normalized priority highlights (low, medium, high).
- `HealthBadge`: Client relations health or invoice payments health (good, warning, risk).
- `ProgressBadge`: Visual percentage tags.

---

## 4. Theme Rules (Light & Dark Mode)

Themes are managed contextually via `ThemeProvider` and read using `useTheme` hooks:
1. **Theme Switching**: Toggled dynamically without page refresh, writing theme state to `document.documentElement` (`data-theme="dark"` or `data-theme="light"`).
2. **Persistence**: Saves preferences to `localStorage`. If no saved state is found, it queries system preference (`prefers-color-scheme`).
3. **Recharts compatibility**: Charts read CSS variables from the canvas style sheets using the centralized `chartTheme` configurations:
   ```typescript
   import { chartTheme } from "@/lib/chart-theme";
   // ...
   <CartesianGrid stroke={chartTheme.grid.stroke} />
   ```
