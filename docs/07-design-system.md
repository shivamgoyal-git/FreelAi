# Design System & UI Guidelines

**Current Status:** Approved  
**Last Updated:** 2026-07-09  
**Related Documents:** [Product Overview](01-overview.md), [Technical Stack & Architecture](02-tech-stack.md), [Features Specification](05-features.md)

---

## 1. Design Philosophy

The FreelAI design system is built to provide an interface that feels premium, calm, and highly focused on developer and freelancer productivity. 

### Core Design Pillars
- **Premium & Calm:** Avoids saturated gradients and flashing visual elements. Uses a restrained color palette (deep slates, clean indigos, and soft borders) to create a premium, calm workplace atmosphere.
- **Productivity & Focus:** Emphasizes high information density, clear typographic hierarchies, and minimal padding blocks to help freelancers scan tasks and financial tables rapidly.
- **AI-Native Integration:** UI components representing AI actions (such as suggestion cards, copy-draft buttons, and scores) are styled with distinct visual cues (subtle indigo glows and spark icons) to feel integrated rather than bolted on.
- **Trustworthiness:** Financial modules (invoices, cash flow aggregations) utilize rigorous alignment, strict table layouts, and standard data visualizations to project a high degree of professionalism.

---

## 2. Inspiration

FreelAI draws design inspiration from the industry's cleanest SaaS interfaces, modifying their patterns to serve independent freelancers:

- **Linear:** Inspired our focus on keyboard shortcuts, unstyled border boundaries, and instant search bars.
- **Vercel:** Influenced our dark mode color palette (slate-950, pure white text, and thin gray borders) and typography-first layouts.
- **Stripe Dashboard:** Provided patterns for dense financial reporting, card-grid metrics, and responsive charts.
- **Attio:** Guided our custom data tables, inline badge grids, and client relationship timelines.
- **Notion:** Inspired the clean, modular layout blocks that let users focus on case studies and markdown proposal editors.
- **Cursor:** Influenced our inline AI suggestions, code blocks presentation, and diff layouts.
- **Arc Browser:** Guided our collapsible navigation sidebar to maximize horizontal editing canvas.

---

## 3. Visual Identity

The FreelAI brand voice is confident, simple, and professional. 

### Visual Identity Principles
- **Grid Realism:** All layout components must snap to a strict 8px grid system.
- **Whitespace as a Separator:** Uses generous padding and whitespace to group sections, minimizing the reliance on solid background fills.
- **Typographic Scale:** Uses size, weight, and color contrast rather than decorative elements to establish layout hierarchy.
- **Restraint Over Decoration:** Avoids complex custom illustrative backgrounds. Let the freelancer's actual work (portfolio case studies, charts) be the visual focal point.

---

## 4. Color System

Colors in FreelAI serve functional roles, indicating states, hierarchies, and security scopes.

### Semantic Color Matrix
- **Primary (Indigo):** Focus state outlines, active tabs, primary action buttons. Represents brand identity.
- **Secondary (Slate/Gray):** Secondary buttons, utility tags, background fills for nested tables.
- **Background (Slate-950 / White):** Deep slates for dark mode, clean white for light mode.
- **Surface (Slate-900 / Slate-50):** Background card layers, dialog modals, dropdown sheets.
- **Borders (Slate-800 / Slate-200):** Thin, high-contrast separation lines for grids and cards.
- **Text (Slate-50 / Slate-900):** Primary headers and body content text.
- **Muted Text (Slate-400 / Slate-500):** Captions, labels, timestamps, and secondary descriptions.
- **Success (Green):** Paid invoice tags, completed milestone indicators.
- **Warning (Amber):** At-risk milestones, pending actions, near-due billing.
- **Error (Red):** Overdue invoices, failed payment logs, validation alerts.
- **Info (Blue):** AI analysis insights, general system updates notifications.
- **Accent (Violet):** Prompts suggestions, AI Copilot widgets, matching score tags.

---

## 5. Typography

FreelAI utilizes clean, modern sans-serif typefaces to guarantee high legibility across diverse screens.

### Typographic Specs
- **Font Family (Sans-Serif):** `Inter` or `Geist Sans` (fallback system-ui).
- **Font Family (Monospace):** `Geist Mono` or `Fira Code` (used for code blocks, pricing figures, and IDs).
- **Heading Hierarchy:**
  - `H1`: 30px (SemiBold, tight tracking `-0.025em`)
  - `H2`: 24px (SemiBold, tight tracking `-0.02em`)
  - `H3`: 20px (Medium, tracking `-0.015em`)
  - `H4`: 16px (Medium, tracking `-0.01em`)
- **Body Text:** 14px (Regular, line height `1.5` for legibility).
- **Muted Labels:** 12px (Medium/Regular).
- **Monospace Labels:** 13px (Regular, tracking `0`).

---

## 6. Spacing System

Consistency in spacing preserves visual balance across pages. We enforce an **8px base grid system**:

- **Card Padding:** 24px (padding-6) on desktop, 16px (padding-4) on mobile.
- **Section Spacing:** 32px (spacing-8) gap between card blocks.
- **Grid Gap:** 16px (gap-4) or 24px (gap-6) for multi-column widgets.
- **Inline Component Spacing:** 8px (gap-2) or 12px (gap-3) between inputs, labels, and icons.

Consistent spacing establishes clear relationship cues; items closer together are grouped, while sections are divided by empty whitespace.

---

## 7. Layout System

Layouts are designed to adapt dynamically to the screen size and the user's focus level.

### Page Grid Layout
```
+-----------------------------------------------------------+
|  Collapsible  |  Top Navigation / Breadcrumb  | Settings  |
|    Sidebar    |-------------------------------------------|
|               |  Page Header (Title, Actions Toolbar)      |
|               |-------------------------------------------|
|               |                                           |
|  - Dash       |   Main Canvas Grid Area                   |
|  - CRM        |                                           |
|  - Projects   |   - Column 1: Core Content / Tables       |
|  - Billing    |   - Column 2: Side Details Panel / AI     |
|               |                                           |
+-----------------------------------------------------------+
```

### Layout Specifications
- **Collapsible Sidebar:** Stays pinned at `240px` on desktop and collapses into a hamburger overlay on tablet/mobile.
- **Max Canvas Width:** Standard pages are restricted to `1200px` to maintain comfortable text reading line lengths.
- **Dashboard Grid:** 3-column layout on wide screens, collapsing to 2-columns on laptops and a single column on tablet/mobile.

---

## 8. Component Library

This catalog defines the design tokens and behaviors for core reusable UI elements:

### 1. Buttons
- **Purpose:** Initiates actions or navigation.
- **Variants:** Primary (solid Indigo), Secondary (border outline/slate), Destructive (solid Red), Ghost (no border, hover background offset), AI-Action (subtle indigo outline with Spark icon).
- **Accessibility:** Must focus with `Tab` key, support `Enter`/`Space` activation, and include `aria-label` when utilizing icon-only buttons.

### 2. Cards
- **Purpose:** Primary content block containers.
- **States:** Default border, Hover state (subtle border color scale and shadow offset).
- **When NOT to use:** Do not nest cards inside other cards. Use simple divider lines for sub-sections.

### 3. Stat & Metric Cards
- **Purpose:** Displays high-level dashboard KPIs.
- **Structure:** Monospaced value font, description caption below, trend indicator badge (e.g. `+12%` Green badge).

### 4. Form Inputs (Inputs, Textareas, Selects)
- **Purpose:** Gathers structured data.
- **States:** Default, Focus (border transitions to Primary Indigo with glow ring), Error (border transitions to Red).
- **Accessibility:** Must always be wrapped in a `<label>` tag.

### 5. Badges
- **Purpose:** Status indicators.
- **Variants:** Success (soft green fill, dark green text), Warning (soft amber), Error (soft red), Active (soft indigo).

### 6. Data Tables
- **Purpose:** Lists dense records (Clients, Invoices).
- **Layout:** Fixed row heights, truncation on long text, hover-state highlight on rows.

### 7. Dialogs & Drawers
- **Purpose:** Contextual action panels.
- **Usage:** Dialog modals for quick confirmation; slide-out Drawers for complex creations (e.g. Add Client form).
- **A11y:** Trap keyboard focus when open. Pressing `Escape` must close the window.

### 8. Tabs & Accordions
- **Purpose:** Content organization.
- **Usage:** Tabs for switching panels (e.g. Projects vs Invoices tabs); Accordions for FAQ lists.

### 9. Breadcrumbs
- **Purpose:** Path navigation.
- **Format:** `Dashboard / Clients / Client Name`.

### 10. Skeletons
- **Purpose:** Loading placeholders.
- **Design:** Pulse-animated gray bars representing shapes of headers, graphs, and table rows to minimize layout shift.

### 11. Empty States
- **Purpose:** Renders when tables are empty.
- **Design:** Centered simple icon, friendly explanation text, and one call-to-action button (e.g., "Add Your First Client").

### 12. Toast Notifications
- **Purpose:** Temporary system event feedback.
- **Design:** Slide-in alert at the bottom-right corner, disappearing after 4 seconds.

### 13. Chart Container
- **Purpose:** Wraps Recharts components.
- **Design:** Fixed aspect ratio (`16:9` or `4:3`), custom borders, hover grid lines.

---

## 9. Icons

Lucide Icons is the system-wide icon library.

### Icon Guidelines
- **Sizing:**
  - Inline buttons / badges: `14px` or `16px`.
  - Sidebar links: `18px`.
  - Large empty-state templates: `32px` or `48px`.
- **Usage:** Use icons to support text labels, not replace them (except standard actions like Edit/Trash).
- **Spacing:** Always maintain a `8px` space between an icon and its text label.

---

## 10. Charts

Data visualizations are constructed with **Recharts**, styled to match the dark/light themes.

```
+-----------------------------------------------------------+
|  MRR Trends                                 [Yearly v]    |
|                                                           |
|  $10k |             .---*---.                             |
|   $5k |       .----'         `---.                        |
|    $0 |-------*------------------*----------------------  |
|         Jan  Feb  Mar  Apr  May  Jun  Jul                 |
+-----------------------------------------------------------+
```

### Chart Styling Rules
- **Color Palettes:** Utilize Primary Indigo for main trend lines. Use secondary slates for background grid grids.
- **Tooltips:** Custom HTML tooltips with high contrast slate backgrounds, white text, and rounded borders.
- **Legends:** Positioned below the chart canvas, styled in muted caption fonts.
- **Grids:** Use dotted horizontal grids only; omit vertical lines to preserve a clean flow.

---

## 11. Motion & Micro-interactions

Animations must be subtle, fast, and respectful of system accessibility settings.

### Motion Principles
- **Transitions Duration:** Standard animations must complete within `150ms` or `200ms` using `ease-out` curves.
- **Hover Effects:** Card transitions, sidebar highlights, and button scale transforms are limited to simple opacity or color shifts.
- **Loading Spinners:** Pervasive skeletal pulse animations are preferred over full-screen spinning wheels.
- **A11y (Reduced Motion):** Respect user system settings. In Tailwind, prefix all animations with the `motion-reduce:transition-none` utility class.

---

## 12. Dark Mode

Dark mode is the default experience of FreelAI.

- **Philosophy:** Emphasizes high contrast and deep visual depth.
- **Color Base:** Pure black background (`#000000`) or deep slate (`#020617`).
- **Readability:** Text color is set to light gray (`#f8fafc`) instead of pure white to prevent eye fatigue. Muted labels are colored `#94a3b8`.
- **Charts:** Chart grids use `#1e293b`. Trend lines are bright indigo to pop off the surface.

---

## 13. Light Mode

Light mode is provided for comfortable work environments.

- **Philosophy:** Bright, high-contrast, paper-like interface.
- **Color Base:** Pure white (`#ffffff`) background with light gray cards (`#f8fafc`).
- **Visual Hierarchy:** Borders are colored `#e2e8f0` to keep table divisions visible.
- **Readability:** Body text is dark slate (`#0f172a`).

---

## 14. Responsive Layout Rules

Components must resize cleanly across device boundaries.

| Breakpoint | Width Gate | Sidebar Behavior | Columns | Card Stacking |
|:---|:---|:---|:---|:---|
| **Desktop** | $\ge 1200px$ | Pinned open (`240px`). | 3 columns | Horizontal grid alignment. |
| **Laptop** | $1024px - 1199px$ | Collapsible to icon rail. | 2 columns | Horizontal grid alignment. |
| **Tablet** | $768px - 1023px$ | Hidden. Triggers via overlay. | 2 columns | Grid collapses. |
| **Mobile** | $< 768px$ | Hidden. Overlay navigation. | 1 column | Full stack (100% width cards). |

---

## 15. Accessibility (A11y)

FreelAI aims for full WCAG 2.1 AA compliance:

- **Contrast Ratios:** Text must maintain a minimum contrast ratio of `4.5:1` against its background.
- **Keyboard Navigation:** Every interactive button, input, and link must be focusable using `Tab` and show a distinct focus border.
- **Screen Reader Support:** Screen reader accessible labels (`sr-only` class) are applied to icon-only buttons.
- **Touch Targets:** Buttons and interactive elements on mobile screens must have a minimum target size of `44px x 44px`.

---

## 16. Design Do's and Don'ts

### Do's
- [x] **DO** reuse existing components from shadcn/ui.
- [x] **DO** maintain strict 8px grid alignments for all elements.
- [x] **DO** test both Dark and Light mode outputs before merging a layout change.
- [x] **DO** utilize skeletal components for loading states.

### Don'ts
- [ ] **DON'T** create custom colors. Always choose from the theme's slate/indigo palette.
- [ ] **DON'T** use multi-saturated gradients on text or card backgrounds.
- [ ] **DON'T** build nested card structures. Use divider lines instead.
- [ ] **DON'T** remove focus ring borders from buttons or input styles.

---

## 17. Future Design Direction

Planned design improvements as FreelAI grows:

- **Glassmorphism (Frosted Glass):** Implementing border-backdrop filters for dialog headers and sidebar layers.
- **Interactive Command Palette:** Command-K launcher allowing keyboard-driven dashboard actions.
- **Chart Animation Enhancements:** Animating line chart pathways as data updates.
- **Design Tokens Exporter:** Auto-compiling style variables into JSON format for mobile apps designers.

---

## 18. Related Documentation

Proceed to the following guides for implementation, technical architecture, and coding specifications:

1. [01-overview.md](01-overview.md) — Product vision, workflows, and glossary.
2. [02-tech-stack.md](02-tech-stack.md) — Technical stack, architecture, and layouts.
3. [05-features.md](05-features.md) — Product specifications and user flows.
4. [06-ai-system.md](06-ai-system.md) — AI architecture, prompts matching, and validations.
5. [10-development-guide.md](10-development-guide.md) — Local onboarding, configurations, and Git commands.
