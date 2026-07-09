# FreelAI Documentation Assets

This directory contains visual and media assets referenced by the FreelAI documentation.

## Directory Structure

```
docs/assets/
├── README.md           # This guidelines file
├── images/            # Screenshots, mockups, and general UI/UX imagery
└── diagrams/          # High-level architecture, flowcharts, and system designs
```

## Asset Classification

### 1. Images (`images/`)
- Frontend mockup files (UI designs, wireframes).
- Screenshots of the application dashboard, components, or flows.
- Photos or static assets used for visual illustrations.

### 2. Diagrams (`diagrams/`)
- Architecture diagrams (logical views, deployment plans).
- Sequence diagrams and state charts.
- Database relationship diagrams (ERDs).
- *Note:* Always prefer raw Mermaid.js text embedded in markdown files over static diagram images where possible, as raw text is more maintainable. Use this folder when exporting complex SVG/PNG diagrams that cannot be easily rendered via Mermaid.

## Naming Conventions
To keep documents organized and prevent namespace collisions:
- Use lowercase with hyphens (kebab-case) for all filenames.
- Include a descriptive prefix representing the module or file:
  - Format: `<module-name>-<description>.<extension>`
  - Examples:
    - `images/dashboard-analytics-widget.png`
    - `diagrams/auth-oauth-flow.svg`

## Preferred Formats
- **Vector Graphics (Preferred for diagrams/icons):** `.svg` — Scalable, infinite resolution, small file size.
- **Raster Graphics (Preferred for screenshots/ui elements):** `.webp` — High compression ratio, superior visual quality.
- **Legacy Raster Graphics:** `.png` (use with compression tools) or `.jpg`.

## Image Optimization
To keep the git repository lightweight:
- Do not commit high-resolution raw exports (e.g., PSDs, Figma files, raw camera photos) directly to this folder.
- All PNG and WebP images must be compressed before check-in.
- Recommended image width:
  - Screenshots: Max width `1200px`.
  - Inline icons / elements: Max width `256px`.
