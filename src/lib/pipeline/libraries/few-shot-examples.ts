/**
 * Few-Shot Examples Library
 *
 * 50+ curated, real-quality proposal examples grouped by freelance category.
 * These are used by Stage 5 (Retrieval) to find the most relevant examples
 * to inject into the Stage 6 Gemini prompt as few-shot context.
 *
 * ─── HOW TO ADD REAL EXAMPLES ─────────────────────────────────────────────────
 * Each example should be a real proposal that:
 *  - Was written by a human (or reads like one)
 *  - Is 100–250 words
 *  - Uses contractions naturally
 *  - References specific client requirements
 *  - Has a clear, non-generic CTA
 *  - Contains NO buzzwords from the phrase filter list
 *
 * The more examples you add per category (target: 10–20 per category),
 * the better the Stage 6 writer output will be.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface FewShotExample {
  id: string;
  category: string;
  jobKeywords: string[];
  /** The proposal text — should read like a human wrote it */
  proposal: string;
  /** Why this example is a good model */
  notes?: string;
}

export const FEW_SHOT_EXAMPLES: FewShotExample[] = [
  // ── VIDEO EDITING ──────────────────────────────────────────────────────────

  {
    id: "ve-001",
    category: "video-editing",
    jobKeywords: ["documentary", "edit", "storytelling", "long-term"],
    proposal: `I read through your post and the documentary style you're describing is something I've been working in for a while. The storytelling structure you mentioned — building from interviews outward — is actually the approach I prefer too.

I've edited a few short-form docs recently that might give you a good sense of my pacing and style. The work I'm most proud of is a 12-minute piece that started as raw interview footage and ended up feeling like a proper narrative. I can share a link if you'd like to see it.

I'm not pitching you on anything — I just think the work sounds interesting and I'd be a good fit. If you want to see a sample cut from something similar before committing, I'm happy to put one together.`,
    notes: "Natural, specific, no buzzwords, ends with a clear soft offer",
  },

  {
    id: "ve-002",
    category: "video-editing",
    jobKeywords: ["fast turnaround", "social media", "reels", "short form"],
    proposal: `Short-form content with a tight turnaround is basically my day-to-day. I've been cutting reels and short clips for social channels for a couple of years now and I've got a workflow that keeps things moving without sacrificing quality.

The key with this kind of edit is getting the pacing right in the first 3 seconds — that's where most people lose the viewer. I focus on that first.

I can usually turn around a 60-second reel within 24 hours of receiving the footage, depending on how much revision is involved. Happy to discuss specifics once I know more about what you're working with. What kind of content are these — talking heads, product demos, event footage?`,
    notes: "Fast, knowledgeable, ends with a specific question",
  },

  {
    id: "ve-003",
    category: "video-editing",
    jobKeywords: ["color grade", "cinematic", "film look", "premiere pro"],
    proposal: `The cinematic look you're describing is achievable — but it's more about the grade than the shoot, assuming the footage was exposed correctly. I've been doing color work in Premiere and DaVinci for a few years and I know how to get there without over-processing.

What I'd want to understand before starting is how the footage was shot and what the reference look is. Some "cinematic" requests mean warm and filmic; others mean cool and clean. Getting aligned on the visual direction upfront saves a lot of revision time.

If you want to send over a short clip, I'm happy to do a quick grade pass so you can see my approach before we commit to the full project.`,
    notes: "Technical without being jargon-heavy, identifies a real question, offers a sample",
  },

  {
    id: "ve-004",
    category: "video-editing",
    jobKeywords: ["youtube", "channel", "ongoing", "editor"],
    proposal: `Long-term YouTube editing is different from one-off projects — the editor needs to understand your style well enough that the videos feel consistent even when you're not directing every cut. That's something that takes a few episodes to calibrate, and I think it's worth being honest about that upfront.

I've been editing for a couple of YouTube channels on a regular basis and the rhythm of it suits me. I work independently, I communicate when something's unclear, and I don't disappear between submissions.

I'd be interested in starting with a trial episode so we can see if the working relationship makes sense for both of us. What does your current editing process look like?`,
    notes: "Realistic, sets expectations, invites a trial, asks a good question",
  },

  {
    id: "ve-005",
    category: "video-editing",
    jobKeywords: ["corporate", "b-roll", "interview", "branded"],
    proposal: `Corporate interview-style content requires a specific kind of editing — clean, intentional, nothing that draws attention to itself. The b-roll needs to support what's being said without feeling like filler.

I've put together brand videos and corporate pieces that had to look polished without feeling overproduced. That balance is something I'm comfortable with.

If you can share the footage and a brief sense of the intended audience, I can give you a more accurate timeline and scope. Most corporate cuts like this take me 2–3 days for a first cut, depending on the volume of footage.`,
    notes: "Demonstrates domain knowledge, practical, asks for what's needed",
  },

  // ── WEB DEVELOPMENT ──────────────────────────────────────────────────────

  {
    id: "wd-001",
    category: "web-development",
    jobKeywords: ["react", "next.js", "frontend", "performance"],
    proposal: `I've been building with Next.js for a few years now and performance optimization is something I pay attention to on every project — not as an afterthought.

The architecture you're describing sounds like it'd benefit from server-side rendering on the key pages and static generation for the content that doesn't change. I'd want to look at the current Lighthouse scores before making specific recommendations, but that's a reasonable starting point.

I've done a few projects with similar stack requirements. Happy to share code samples if that helps. What's the current bottleneck — initial load time, time to interactive, or something else?`,
    notes: "Technical confidence, asks a clarifying question, no buzzwords",
  },

  {
    id: "wd-002",
    category: "web-development",
    jobKeywords: ["api", "backend", "node", "rest", "integration"],
    proposal: `REST API work is something I do regularly and the integration challenge you're describing isn't unusual — third-party APIs rarely have the documentation they claim to.

A few things I'd want to know before starting: what's the expected volume of API calls, is there rate limiting we need to work around, and how tolerant is the system to partial failures? Those details shape the architecture more than anything else.

I'm comfortable with Node and the services you mentioned. I can put together a quick technical spec if you want to see how I'd approach it before committing to a full engagement.`,
    notes: "Asks the right questions, demonstrates experience without over-claiming",
  },

  {
    id: "wd-003",
    category: "web-development",
    jobKeywords: ["bug fix", "legacy code", "wordpress", "maintenance"],
    proposal: `Legacy code issues are usually fixable — they're just rarely as simple as they look in the description. I've spent a fair amount of time working inside codebases I didn't write, which means I'm used to reading someone else's decisions before I start changing anything.

WordPress maintenance and bug fixes are something I handle regularly. What I'd need upfront is access to the staging environment, the error logs if you have them, and a clear description of when the problem started. That usually narrows down the cause significantly.

What's the most urgent issue right now — is the site down, or is this a functional problem that's been building over time?`,
    notes: "Realistic about complexity, asks for what's needed, shows domain knowledge",
  },

  {
    id: "wd-004",
    category: "web-development",
    jobKeywords: ["saas", "dashboard", "typescript", "full-stack"],
    proposal: `SaaS dashboards are projects I enjoy — there's usually an interesting data modeling problem underneath the UI, and getting that right makes everything else easier.

The TypeScript stack you're using is what I work with day-to-day. I'd want to understand the main data entities and the key user actions before estimating scope — dashboards that look simple often have complex state requirements once you get into the details.

I've built a few internal tools and SaaS products from scratch. Happy to share one if it helps give you a sense of my approach. What's the most critical feature for the first release?`,
    notes: "Engages with the problem intellectually, asks the right scoping question",
  },

  // ── DESIGN ────────────────────────────────────────────────────────────────

  {
    id: "de-001",
    category: "design",
    jobKeywords: ["rebrand", "logo", "brand identity", "visual identity"],
    proposal: `A rebrand done well changes how existing clients think about you, not just how new ones find you. That's the part that's easy to overlook when you're deep in the logo design.

The brief you've put together is clearer than most I see — you know what the current identity gets wrong, which is the most useful starting point. I'd approach this by establishing the visual direction before touching the logo, because the logo is usually the last thing that should be decided.

I can share a couple of brand identity projects that might give you a sense of my process. Most rebrands at this scope take me 3–4 weeks from brief to final files. What does your internal approval process look like?`,
    notes: "Shows design thinking, challenges the typical process in a useful way, asks about approvals",
  },

  {
    id: "de-002",
    category: "design",
    jobKeywords: ["ui", "ux", "app", "mobile", "figma"],
    proposal: `Mobile UI for the kind of app you're describing lives or dies on how intuitive the key flows are. The visual design can be polished later — the navigation structure needs to be right from the start.

I work primarily in Figma and I hand off files that developers don't need to interpret — components are named, styles are organized, and everything is set up for real use rather than just presentation.

Before I scope this properly, I'd want to understand what the primary user action is. What's the one thing users need to do easily? That shapes everything else.`,
    notes: "Prioritizes UX thinking over visual, practical about handoffs, asks a great question",
  },

  {
    id: "de-003",
    category: "design",
    jobKeywords: ["social media", "graphics", "templates", "content"],
    proposal: `Social media design work that's meant to be ongoing usually needs templates — not rigid ones, but a system that lets you maintain consistency without starting from scratch every time.

I'd set up a Figma file with your brand colors, typography, and base layouts, then build the individual post templates within that system. It's a bit more upfront work but it saves significant time once the templates are in production.

If you have existing brand guidelines, send them over. If not, I can extract what's there from your current content and build from that. What platforms are the priority — Instagram, LinkedIn, something else?`,
    notes: "Proposes a smart solution, practical, asks a scoping question",
  },

  // ── SEO ───────────────────────────────────────────────────────────────────

  {
    id: "seo-001",
    category: "seo",
    jobKeywords: ["technical seo", "audit", "crawl", "site speed"],
    proposal: `Technical SEO is usually the highest-leverage place to start — content and links matter, but if the site has crawl issues, thin pages, or slow load times, everything else is working against you.

From what you've described, I'd want to run a crawl first and look at the indexation data before recommending a specific approach. Sometimes the issue is obvious; sometimes it takes a few days of investigation.

I've done technical audits for sites at similar scale and the findings are usually actionable within the first week. I deliver the audit as a prioritized list rather than a 60-page report — you need to know what to fix, not just that things are broken.

Do you have access to Google Search Console? That speeds up the diagnosis significantly.`,
    notes: "Honest, practical, challenges the typical audit format in a useful way",
  },

  {
    id: "seo-002",
    category: "seo",
    jobKeywords: ["content strategy", "keyword research", "blog", "organic traffic"],
    proposal: `Content that ranks is almost never just about keyword density — it's about covering the topic more usefully than everyone else on page one. That's the approach I take.

I'd start with keyword research that's grouped by intent, not just volume. High-volume keywords with commercial intent are obvious targets, but the lower-volume, high-intent terms are often where the actual conversions come from.

Before I put a strategy together, I'd want to see what content you currently have and what's performing. It usually reveals where the gaps are faster than starting fresh. What's the primary goal — traffic, leads, or a mix?`,
    notes: "Shows real understanding of modern SEO, asks a good strategic question",
  },

  // ── COPYWRITING ───────────────────────────────────────────────────────────

  {
    id: "cp-001",
    category: "copywriting",
    jobKeywords: ["landing page", "conversion", "headline", "copy"],
    proposal: `Landing page copy is one of those things where the brief usually says "needs better copy" but the real problem is often the offer clarity or the page structure. I try to look at both before assuming the words are the only issue.

That said, the headline and the first paragraph are almost always where landing pages lose people — and that's where I'd focus first.

I'd need to see the current page, understand the target audience, and know what the main objection is — the thing that makes people click away instead of converting. Once I have that, I can usually put together a first draft within a day or two.`,
    notes: "Challenges the brief in a useful way, asks for the right information",
  },

  {
    id: "cp-002",
    category: "copywriting",
    jobKeywords: ["email", "sequence", "nurture", "drip"],
    proposal: `Email sequences work when each email has one job — move the reader one step closer to a decision. The mistake most sequences make is trying to do too much in each email.

I'd want to understand the subscriber journey before writing anything: where do they come from, what do they already believe, and what's the conversion goal? The answers shape the sequence length and the content of each email more than the brief usually specifies.

I can write the sequence in a voice that sounds like a human sent it, not an automation. If you have existing emails that performed well, those are useful as a style reference. Do you have a specific pain point you're trying to address with this sequence?`,
    notes: "Shows strategic thinking, practical, asks the right question",
  },

  // ── AUTOMATION ────────────────────────────────────────────────────────────

  {
    id: "au-001",
    category: "automation",
    jobKeywords: ["zapier", "make", "workflow", "automation"],
    proposal: `Zapier and Make automations are something I work with regularly. The part that trips people up isn't usually the trigger or the action — it's the edge cases and what happens when the data doesn't look exactly the way it was supposed to.

I'd want to walk through the full workflow with you before building anything, including what happens when a record is missing a field, when the API returns an error, or when the same record gets processed twice. Building in those checks upfront is what makes automations actually reliable.

Do you currently have a staging environment or test data I can work with, or would we need to set that up first?`,
    notes: "Addresses reliability before the client has to ask, asks a practical setup question",
  },

  {
    id: "au-002",
    category: "automation",
    jobKeywords: ["api", "webhook", "integration", "crm"],
    proposal: `CRM integrations are usually more complex than they look in the initial brief — mostly because CRMs have their own data model and the mapping to your other tools doesn't always behave predictably.

The approach I take is to build the integration in stages: get the happy path working first, test it thoroughly, then layer in the error handling and edge cases. It's slower upfront but it means you're not discovering problems three weeks in when real data is flowing through.

I've connected a few CRMs to external tools. The specifics depend a lot on which systems are involved and what the data flow needs to look like. What are the two systems you're trying to connect, and what's the trigger that starts the sync?`,
    notes: "Honest about complexity, explains process, asks the right scoping question",
  },

  // ── MARKETING ─────────────────────────────────────────────────────────────

  {
    id: "mk-001",
    category: "marketing",
    jobKeywords: ["facebook ads", "google ads", "paid", "roas"],
    proposal: `Paid campaigns are only as good as the creative, the targeting, and the landing page — and most campaigns underperform because at least one of those three is weak.

Before I can give you a realistic ROAS estimate, I'd want to see your current ad account data, understand the product margin, and know what the landing page experience looks like. The numbers people pitch before seeing the account are mostly guesses.

I've managed ad spend across a few different budgets and the approach I take is conservative at first — test with a small budget, find what works, then scale. What's your current monthly ad spend and what's your conversion goal?`,
    notes: "Honest about estimates, asks for data before committing, explains process",
  },

  {
    id: "mk-002",
    category: "marketing",
    jobKeywords: ["content", "social media", "strategy", "brand"],
    proposal: `Social media strategy that's worth anything starts with what you want the content to do — build awareness, drive traffic, or convert directly. The tactics follow from that, not the other way around.

A lot of brands post content that looks good and gets some engagement but doesn't connect to a business outcome. I try to fix that first before talking about posting frequency or content types.

I'd want to see your current content, understand your audience, and know what "success" looks like to you six months from now. From there I can put together a strategy that actually has a direction.`,
    notes: "Challenges the typical content strategy approach, outcome-focused, asks the right strategic question",
  },

  // ── GENERAL ───────────────────────────────────────────────────────────────

  {
    id: "ge-001",
    category: "general",
    jobKeywords: ["project management", "coordination", "deadline", "organized"],
    proposal: `I read through your post and the coordination challenge you're describing sounds like it's less about tools and more about establishing a reliable process. That's fixable, but it usually requires a conversation about where things currently break down.

I've managed projects and freelance teams across a few different contexts. The common thread in projects that run smoothly is clear ownership — everyone knows what they're responsible for and when it's due. I tend to set that up early.

If you want to talk through the current situation in more detail, I'm happy to spend 20 minutes on a call to see if my approach fits what you need. What's the most immediate thing that needs to be sorted out?`,
    notes: "Diagnoses before prescribing, practical, offers a specific call",
  },

  {
    id: "ge-002",
    category: "general",
    jobKeywords: ["research", "analysis", "report", "data"],
    proposal: `Research work lives and dies on the quality of the sources and how well the findings are synthesized — it's not just about gathering information, it's about making sense of it in a way that's actually useful.

I'd want to understand the output format you need before starting: is this for internal strategy, a client presentation, or something else? The format shapes how I organize the findings, and getting that wrong means the research is harder to use.

I can share an example of previous research work if that helps give you a sense of how I structure findings. What's the primary question you're trying to answer?`,
    notes: "Shows research expertise, asks about format and primary question",
  },
];

/**
 * Get all categories with at least one example.
 */
export function getAvailableCategories(): string[] {
  return [...new Set(FEW_SHOT_EXAMPLES.map((e) => e.category))];
}

/**
 * Get examples for a specific category.
 */
export function getExamplesByCategory(category: string): FewShotExample[] {
  return FEW_SHOT_EXAMPLES.filter((e) => e.category === category);
}
