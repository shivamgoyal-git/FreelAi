# FreelAI Documentation System

Welcome to the central documentation system for **FreelAI**—the single source of truth for the entire product lifecycle, from design systems to AI architectures.

---

## What is FreelAI?
FreelAI is an AI-powered SaaS platform that helps freelancers manage their entire business workflow. Key workflows include finding and tracking clients, generating high-conversion proposals using the Gemini API, project management, invoice handling, and business analytics.

---

## Documentation Purpose
This documentation repository is designed to be:
- **Developer Onboarding Tool:** Providing clear steps, guides, and standards to get new contributors up to speed.
- **AI-Assistant Ready:** Optimized with clean formatting, self-contained sections, and explicit links to help coding assistants (like Cursor, Claude, ChatGPT, and Antigravity) understand the project instantly.
- **Git-Friendly & Maintainable:** Written in pure, simple Markdown files that track easily using version control and render dynamically on a static site via MkDocs.

---

## Navigation Directory

| Document | Purpose | File Path |
|:---|:---|:---|
| **Overview** | Product vision, target personas, and market positioning | [01-overview.md](01-overview.md) |
| **Tech Stack & Architecture** | Technical stack details, system architecture, and flow diagrams | [02-tech-stack.md](02-tech-stack.md) |
| **Database** | Database model schemas, references, and indexing | [04-database.md](04-database.md) |
| **Features** | Individual modules directory and outlines | [05-features.md](05-features.md) |
| **AI System** | AI agent patterns, pipeline flows, and SDK usage | [06-ai-system.md](06-ai-system.md) |
| **Design System** | Styling tokens, UI theme configurations, and component logic | [07-design-system.md](07-design-system.md) |
| **Roadmap** | Delivery plan, milestones, and release schedules | [08-roadmap.md](08-roadmap.md) |
| **Prompts** | System prompts library and validation formats | [09-prompts.md](09-prompts.md) |
| **Development Guide** | Onboarding instructions, coding standards, and git guidelines | [10-development-guide.md](10-development-guide.md) |
| **Documentation Standards** | Guidelines for formatting, styling, and writing documentation | [documentation-standards.md](documentation-standards.md) |

---

## How to Use this Documentation
1. **Setting up your local environment?** Go directly to the [Development Guide](10-development-guide.md).
2. **Reviewing the interface constraints?** Open the [Design System](07-design-system.md).
3. **Designing a new prompt?** Refer to the [AI System](06-ai-system.md) and [AI Prompt Library](09-prompts.md) first.
4. **Referencing code examples?** Use the pre-built templates inside the `docs/templates/` directory to document new features, components, database schemas, or API endpoints.

---

## Maintenance & Updates
To keep this documentation from decaying:
- **Keep it simple:** Avoid creating unnecessary subfolders. Create feature-specific documentation inside the [05-features.md](05-features.md) document.
- **Use templates:** When adding new database collections, components, or API endpoints, copy the template files from the `docs/templates/` folder.
- **Follow Standards:** Ensure all content adheres to [Documentation Standards](documentation-standards.md).
- **Run MkDocs locally** to preview style changes before committing.
