# Development Guide & Coding Standards

**Current Status:** Approved  
**Last Updated:** 2026-07-09  
**Related Documents:** [Technical Stack & Architecture](02-tech-stack.md), [Database Structure](04-database.md), [Design System](07-design-system.md)

---

## 1. Introduction

This document serves as the official engineering handbook for the FreelAI project. It defines the coding standards, repository layout, API protocols, styling guidelines, and development workflows that every contributor—including AI coding assistants—must follow.

Adhering to these guidelines prevents technical debt, guarantees data security, maintains visual consistency, and ensures that the codebase scales cleanly as FreelAI grows. **Read this guide in its entirety before submitting your first pull request.**

---

## 2. Development Philosophy

Our engineering practices are guided by the following principles:

- **Build Reusable Components:** If a UI pattern appears more than once, extract it into a modular component.
- **Never Duplicate Logic:** Consolidate business rules, calculations, and database operations in the service layer (`src/services/`). Never write duplicate logic inside API route files or React components.
- **AI-First Thinking:** Schemas and API payloads must be designed from the start to be self-contained and easily parseable by LLMs using structured output frameworks.
- **Simplicity Over Cleverness:** Write code that is easy to read, refactor, and delete. Avoid over-engineering solutions for problems we do not yet have.
- **Type Safety First:** Leverage TypeScript strictly. Avoid the `any` type keyword. Make compiler checks work for you to prevent runtime errors.
- **Accessibility by Default:** Design and code with keyboard layouts, screen readers, and WCAG AA contrast rules in mind.

---

## 3. Project Structure

FreelAI co-locates client layouts and server api routing inside a structured directory layout:

```
src/
├── app/                  # Next.js App Router (pages, layouts, api handlers)
│   ├── (auth)/           # Unauthenticated onboarding / signup routing group
│   ├── (dashboard)/      # Authenticated workspaces routing group
│   └── api/              # Backend serverless REST API route handlers
├── components/           # Reusable global presentation elements
│   ├── ui/               # Basic unstyled shadcn/ui components (buttons, inputs)
│   ├── layout/           # Shared page wrappers (sidebar, top navigation)
│   └── ai/               # Core AI UI elements (score badges, copilot cards)
├── features/             # Feature-specific components, hooks, and types
├── hooks/                # Global React hooks (useAuth, useWindowSize)
├── lib/                  # Library initializers (MongoDB connection client)
├── models/               # Mongoose DB schema definitions and helper methods
├── services/             # Core business service layer (AI compiler, billing)
├── styles/               # CSS stylesheets and Tailwind config layers
├── types/                # Global TypeScript interface directories
└── utils/                # Helper utilities (date formatters, currency math)
```

### Where to Place New Code
- **New Page Layout:** Add a folder inside `src/app/(dashboard)/` containing `page.tsx`.
- **New API Route:** Add a folder inside `src/app/api/` containing `route.ts`.
- **New DB Collection:** Add a Mongoose model inside `src/models/`.
- **New Core Service:** Create a service utility inside `src/services/`.

---

## 4. Component Guidelines

React components inside FreelAI are categorized by scope to encourage reuse:

### Component Classification
1. **Shared UI Components (`src/components/ui/`):** Leaf components with no business logic (e.g. Buttons, Dialogs, Badges).
2. **Feature Components (`src/features/`):** Components coupled with a specific module (e.g. `ProposalEditor` inside `src/features/proposals/`).
3. **Page-Specific Components:** Components created for a specific routing screen, declared directly inside the app router subdirectory when they are not reused elsewhere.

### Writing Guidelines
- **RSC by Default:** Keep frontend components as React Server Components (RSC) to fetch database context directly on the server. Introduce client components (using `"use client"`) only when browser state or user interactions are required.
- **Props Interfaces:** Every React component must have an explicitly typed prop interface named `ComponentNameProps`.
- **Composition over Nesting:** Avoid writing deeply nested React components. Break large layouts down into smaller functions.

---

## 5. API Development Standards

REST endpoints are built using Next.js Serverless Route Handlers:

- **Directory Mapping:** API files must be named `route.ts` inside `src/app/api/`.
- **Payload Validation:** Validate every incoming query parameter and request body using Zod schemas before running business logic.
- **Authentication Check:** API handlers must extract session context from Auth.js. Reject unauthorized requests immediately with a `410 Unauthorized` response.
- **Standard JSON Output:** All API responses must return a uniform JSON format:
  - Success: `{ "success": true, "data": { ... } }`
  - Error: `{ "success": false, "error": "ReasonString", "details": [] }`
- **HTTP Status Codes:** Match codes to outcomes (e.g. `200 OK`, `201 Created` for writes, `400 Bad Request` for validation failures, `401 Unauthorized` for auth failures, `500 Internal Error`).

---

## 6. Database Guidelines

Schema design in MongoDB prioritizes tenant isolation and query performance:

- **UserId Gating:** All collections containing freelancer business records must include a `userId` field (typed as Mongoose `Schema.Types.ObjectId` referencing the user registry).
- **Audit Fields:** Schemas must enable the Mongoose `{ timestamps: true }` option to automatically track `createdAt` and `updatedAt` dates.
- **Naming Conventions:** Schema model files must use PascalCase (e.g., `Client.ts`, `Project.ts`) and map to lowercase, plural collections in MongoDB.
- **Database Operations:** Keep MongoDB queries atomic. Prefer Mongoose operators (such as `$set`, `$inc`, `$push`) rather than overriding whole documents on updates.

---

## 7. AI Development Standards

Integrating LLM workflows must follow clean pipeline patterns:

- **Decoupled Service Logic:** All AI prompts compile tasks, model invocations, and SDK calls must live inside `src/services/ai/`. React views and REST controllers must call these service methods instead of calling the SDK directly.
- **Output Control:** Require structured JSON outputs from Gemini by configuring schemas matching the target typescript interface.
- **Validation Gates:** Parse and validate LLM outputs using Zod validators immediately upon receiving them.
- **Context Isolation:** When fetching context database records to feed a prompt, ensure the query filters strictly by the authenticated user's `userId`.

---

## 8. Styling Guidelines

Styling is implemented exclusively using Tailwind CSS:

- **Design System Tokens:** Style elements using the colors, margins, and typography tokens defined in the [Design System](07-design-system.md).
- **Theme Adaptations:** All elements must support light and dark theme configurations using Tailwind's `dark:` variant class.
- **Avoid Inline Styles:** Do not write inline `style={{ ... }}` attributes unless injecting dynamically calculated values (such as progress bar percentages).
- **Responsive Layouts:** Code responsive layouts using mobile-first conventions (e.g., `w-full md:w-1/2 lg:w-1/3`).

---

## 9. State Management Guidelines

Choose the appropriate state tool depending on the data lifecycles:

- **Local UI State:** Use React's `useState` or `useReducer` for layout-specific toggles (e.g., sidebar collapse, dialog open/close states).
- **Server Data State:** Use React Server Components to load initial database views. Use SWR or React Query client-side when polling, caching, or optimistic updates are needed.
- **Form State:** Manage form states and client-side error rendering using React Hook Form validated with Zod schemas.

---

## 10. Performance Best Practices

To maintain fast page speeds and low resource footprints:

- **Code Splitting:** Load heavy visual components (like Recharts panels) dynamically using Next.js `dynamic` imports.
- **Database Connection Caching:** Check for existing connection states in `src/lib/dbConnect.ts` to prevent connection starvation in serverless environments.
- **Image Compression:** Visual assets uploaded to the system must be converted to `.webp` format and resized to maximum target display dimensions.
- **Query Optimization:** Select only the necessary database fields in Mongoose queries (e.g. `Client.find().select('name email')`) to reduce server execution payloads.

---

## 11. Security Standards

Data integrity and privacy are enforced at every layer:

- **Authorization checks:** Never assume a request is safe because the URL contains a valid document ID. Always verify that `currentSession.userId === targetDocument.userId`.
- **Environment Variables:** Credentials, API secrets, and connection strings must be saved exclusively inside `.env.local` and never committed to version control.
- **Prompt Injection Prevention:** Escape unverified user text inputs inside LLM prompts by wrapping them in isolated JSON fields, preventing instructions override.
- **Input Sanitization:** Rejects malformed payload entries using Zod before compiling database queries, preventing NoSQL injection.

---

## 12. Git Workflow

We use a structured branch and merge workflow to ensure repository history remains clean:

### Branch Naming Conventions
- New Features: `feat/feature-name` (e.g., `feat/proposal-generator`)
- Bug Fixes: `fix/bug-description` (e.g., `fix/invoice-pdf-totals`)
- Documentation: `docs/documentation-target` (e.g., `docs/database-schemas`)

### Commit Messages
Commits must follow the **Conventional Commits** specification:
- Format: `type(scope): description`
- Examples:
  - `feat(auth): add google oauth provider support`
  - `fix(invoices): correct tax calculations for decimal values`
  - `docs(tech-stack): update related document links`

---

## 13. Coding Standards

- **Variables & Functions:** Use camelCase (e.g. `clientId`, `generateProposal`).
- **React Components:** Use PascalCase (e.g. `MetricCard`, `DashboardTemplate`).
- **Files & Folders:** Folder names must use kebab-case (e.g. `feature-components/`).
- **TypeScript Types:** Declare interfaces using PascalCase (e.g. `UserSessionInterface`).
- **Strict Linting:** Ensure all code passes the project ESLint rules before pushing to GitHub.

---

## 14. Error Handling

- **Try-Catch Blocks:** Wrap database operations, API requests, and AI compilations inside try-catch blocks.
- **User Feedback:** Never render raw database or API error strings in the UI. Map backend errors to clean user notifications (e.g., using `sonner` toast alerts).
- **Validation Errors:** Render field-specific error messages directly beneath the corresponding inputs in form layouts.

---

## 15. Testing Philosophy

Before submitting a pull request, verify your code manually in local environments:

- **Functional Check:** Verify the core feature behaves exactly as described in the [Features Specification](05-features.md).
- **Responsive Check:** Test the layout across desktop, laptop, tablet, and mobile views.
- **Theme Check:** Verify that elements render correctly in both Dark and Light theme configurations.
- **Clean Build Check:** Run `npm run build` locally to verify that there are no compilation errors or linter warnings.

---

## 16. Future Scalability

Design new modules to accommodate future scaling paths:

- **Decoupled Features:** Build new feature folders in `src/features/` so they can be easily migrated to separate sub-directories or microservices if needed.
- **Redis Cache Gateways:** Structuring service calls to support future caching layovers.
- **Stripe Webhook Handlers:** Connect billing updates via secure background webhook queues.

---

## 17. Common Mistakes to Avoid

- ❌ **Duplicate Styling:** Writing inline Tailwind sizes instead of utilizing standard spacing variables.
- ❌ **API Code in Pages:** Fetching data directly in page handlers using raw `fetch` instead of modular service files.
- ❌ **Insecure Queries:** Querying database collections without appending the `{ userId }` filter.
- ❌ **No Error Catching:** Failing to wrap external SDK calls in try-catch structures.
- ❌ **Unlabeled Icons:** Utilizing icon buttons without screen-reader tags or tooltips.

---

## 18. Development Checklist

Check off every box before opening a pull request:

- [ ] **Feature Documented:** The feature's architecture and flows are documented.
- [ ] **Components Reused:** Reused standard UI elements from `src/components/ui/`.
- [ ] **Responsive & Fluid:** Layout resizes cleanly across all breakpoints.
- [ ] **Theme Checked:** Renders perfectly in both Dark and Light modes.
- [ ] **Zod Validated:** Input parameters are checked on both client and server side.
- [ ] **Auth Protected:** Route requires verified session credentials.
- [ ] **Error Catching:** Handlers capture failures and show toast alerts.
- [ ] **Zero Compilation Warnings:** ESLint checks and `npm run build` pass cleanly.

---

## 19. Related Documentation

Proceed to the following files for product context, layouts, and specifications:

1. [01-overview.md](01-overview.md) — Product vision, workflows, and glossary.
2. [02-tech-stack.md](02-tech-stack.md) — Technical stack, architecture, and layouts.
3. [04-database.md](04-database.md) — Database collections, ERD, and data flows.
4. [05-features.md](05-features.md) — Product specifications and user flows.
5. [06-ai-system.md](06-ai-system.md) — AI architecture, prompts matching, and validations.
6. [07-design-system.md](07-design-system.md) — Tailwind tokens, typography, and styling variables.
