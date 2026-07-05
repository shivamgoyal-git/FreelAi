/**
 * Industry Template Library
 *
 * Pre-written structural scaffolds per freelance category.
 * AI fills the gaps; it doesn't invent the structure.
 *
 * Each template defines:
 *  - sectionOrder: the preferred order of sections
 *  - toneGuidance: extra writing direction for this category
 *  - commonPainPoints: frequently appearing pain points for this industry
 *  - commonDeliverables: standard deliverables the client probably expects
 *  - warningFlags: things to watch out for in this category
 */

export type TemplateId =
  | "web-developer"
  | "ui-designer"
  | "video-editor"
  | "seo-specialist"
  | "copywriter"
  | "graphic-designer"
  | "automation-engineer"
  | "marketing-specialist"
  | "general";

export interface IndustryTemplate {
  id: TemplateId;
  label: string;
  sectionOrder: string[];
  toneGuidance: string;
  commonPainPoints: string[];
  commonDeliverables: string[];
  warningFlags: string[];
  /** Injected into Stage 6 prompt as structural guidance */
  structurePrompt: string;
}

export const TEMPLATES: Record<TemplateId, IndustryTemplate> = {
  "web-developer": {
    id: "web-developer",
    label: "Web Developer",
    sectionOrder: ["opening", "client-problem", "technical-approach", "portfolio-evidence", "timeline", "pricing", "cta"],
    toneGuidance: "Be precise about technology choices. Clients hiring developers want to know you understand the technical problem, not just that you can code.",
    commonPainPoints: [
      "Previous developer left the project incomplete",
      "Site is slow or has performance issues",
      "Code is messy and hard to maintain",
      "Need features added without breaking existing work",
      "Deadline is tight",
    ],
    commonDeliverables: ["Source code", "Documentation", "Deployment", "Testing", "Code review"],
    warningFlags: [
      "Don't claim to know a technology unless it's in the job post or your profile",
      "Don't invent client names or project names",
      "Don't promise unrealistic timelines",
    ],
    structurePrompt: `Structure the proposal as follows:
1. Opening: Reference one specific technical detail from the job post
2. Client Problem: Show you understand the real challenge, not just the surface request
3. Technical Approach: Briefly describe the approach — tools, architecture decision, or key consideration
4. Portfolio Evidence: Reference one specific past project (only if it exists in the matched portfolio)
5. Timeline: Realistic estimate based on scope
6. Pricing: Reference your rate only if budget was provided
7. CTA: Ask one specific question or invite a call`,
  },

  "ui-designer": {
    id: "ui-designer",
    label: "UI/UX Designer",
    sectionOrder: ["opening", "client-problem", "design-approach", "portfolio-evidence", "process", "timeline", "cta"],
    toneGuidance: "Lead with design thinking, not software tools. Clients hiring designers want someone who understands user intent, not just someone who knows Figma.",
    commonPainPoints: [
      "Current design feels outdated or inconsistent",
      "Users are confused by the interface",
      "Need Figma files developers can actually use",
      "Rebrand is overdue",
      "Product doesn't reflect the brand quality",
    ],
    commonDeliverables: ["Wireframes", "High-fidelity mockups", "Figma components", "Design system", "Prototype", "Handoff assets"],
    warningFlags: [
      "Don't promise a design system if the scope doesn't support it",
      "Don't invent tools the client didn't mention",
      "Don't use design jargon to impress — be clear",
    ],
    structurePrompt: `Structure the proposal as follows:
1. Opening: Reference the visual or UX challenge specifically mentioned
2. Client Problem: Show you understand what the design needs to accomplish for the user
3. Design Approach: Describe your process briefly — research, wireframes, iteration
4. Portfolio Evidence: Reference one project with similar visual scope (only from matched portfolio)
5. Process: Mention review rounds and how you handle feedback
6. Timeline: Per deliverable if possible
7. CTA: Ask about brand assets or existing design files`,
  },

  "video-editor": {
    id: "video-editor",
    label: "Video Editor",
    sectionOrder: ["opening", "style-understanding", "editorial-approach", "portfolio-evidence", "workflow", "timeline", "cta"],
    toneGuidance: "Talk about storytelling, pacing, and the feeling of the edit — not just software. Clients hiring video editors care about the result, not the tool.",
    commonPainPoints: [
      "Previous editor didn't understand the brand tone",
      "Turnaround was too slow",
      "Revisions were unlimited and draining",
      "Editor needed too much direction",
      "Color grade was inconsistent",
    ],
    commonDeliverables: ["Rough cut", "Final cut", "Color grade", "Audio mix", "Motion graphics", "Subtitles", "Export formats"],
    warningFlags: [
      "Don't claim to know a style unless you have portfolio evidence",
      "Don't promise a turnaround you can't meet",
      "Don't invent awards or client names",
    ],
    structurePrompt: `Structure the proposal as follows:
1. Opening: Reference the specific style, format, or tone from the job post
2. Style Understanding: Show you understand how this content should feel, not just what it should include
3. Editorial Approach: Briefly describe how you'd approach the cut — pacing, structure, storytelling
4. Portfolio Evidence: Reference one relevant project (only from matched portfolio)
5. Workflow: Mention your revision process and delivery format
6. Timeline: Based on the scope described
7. CTA: Offer to share a sample or ask about raw footage details`,
  },

  "seo-specialist": {
    id: "seo-specialist",
    label: "SEO Specialist",
    sectionOrder: ["opening", "diagnosis", "strategy", "portfolio-evidence", "timeline", "expectations", "cta"],
    toneGuidance: "Be honest about SEO timelines. Clients are burned by promises. Being realistic builds more trust than overpromising.",
    commonPainPoints: [
      "Traffic dropped after an algorithm update",
      "Rankings are stagnant despite content efforts",
      "Competitors outrank them on key terms",
      "Technical SEO issues haven't been addressed",
      "Content strategy isn't aligned with search intent",
    ],
    commonDeliverables: ["Technical audit", "Keyword research", "On-page optimization", "Content strategy", "Backlink analysis", "Monthly reporting"],
    warningFlags: [
      "Don't promise specific ranking positions",
      "Don't promise timeline shorter than 3 months for organic results",
      "Don't invent case study numbers",
    ],
    structurePrompt: `Structure the proposal as follows:
1. Opening: Reference the specific SEO challenge or site type mentioned
2. Diagnosis: Show you've identified the likely root cause from the job description
3. Strategy: Brief overview of your approach — technical, content, or authority
4. Portfolio Evidence: Reference one relevant result or project (only from matched portfolio)
5. Timeline: Honest expectations about when results appear
6. Expectations: Briefly address what's realistic vs. what's a red flag
7. CTA: Ask about access to Search Console or current audit`,
  },

  "copywriter": {
    id: "copywriter",
    label: "Copywriter",
    sectionOrder: ["opening", "audience-insight", "approach", "portfolio-evidence", "process", "timeline", "cta"],
    toneGuidance: "Your proposal is itself a portfolio piece. Write it the same way you'd write copy for this client.",
    commonPainPoints: [
      "Current copy doesn't convert",
      "Tone is inconsistent across pages",
      "Headlines aren't compelling",
      "Copy is too long and clients don't read it",
      "Launch deadline is tight",
    ],
    commonDeliverables: ["Website copy", "Email sequences", "Ad copy", "Landing pages", "Product descriptions", "Blog posts"],
    warningFlags: [
      "Don't invent conversion rates or case studies",
      "Don't write in a different style than the proposal itself shows",
      "Don't promise results that depend on traffic or ad spend",
    ],
    structurePrompt: `Structure the proposal as follows:
1. Opening: Show you understand the audience, not just the deliverable
2. Audience Insight: Briefly demonstrate you know who the copy needs to reach and why they're skeptical
3. Approach: Describe your copy framework or how you approach this type of content
4. Portfolio Evidence: Reference one piece of relevant past work (only from matched portfolio)
5. Process: Mention how you handle briefs, revisions, and sign-off
6. Timeline: Per deliverable
7. CTA: Ask about brand voice guidelines or existing content`,
  },

  "graphic-designer": {
    id: "graphic-designer",
    label: "Graphic Designer",
    sectionOrder: ["opening", "visual-direction", "portfolio-evidence", "process", "timeline", "cta"],
    toneGuidance: "Show visual sensibility through word choice, not just portfolio links. Clients want to feel you see what they see.",
    commonPainPoints: [
      "Design looks outdated",
      "Brand assets are inconsistent across materials",
      "Need print-ready files from a designer who understands production",
      "Previous designer was slow to revise",
      "Budget is tight but quality still matters",
    ],
    commonDeliverables: ["Logo", "Brand identity", "Print materials", "Social media assets", "Packaging", "Illustrations"],
    warningFlags: [
      "Don't promise unlimited revisions unless that's your actual model",
      "Don't invent tools or software certifications",
      "Don't claim expertise in a style you can't show",
    ],
    structurePrompt: `Structure the proposal as follows:
1. Opening: Reference the specific visual direction or brand challenge
2. Visual Direction: Show you understand the aesthetic the client is after
3. Portfolio Evidence: Reference one relevant visual project (only from matched portfolio)
4. Process: Mention how you handle concepts, revisions, and final file delivery
5. Timeline: Per deliverable, including revision rounds
6. CTA: Ask about existing brand guidelines or target audience`,
  },

  "automation-engineer": {
    id: "automation-engineer",
    label: "Automation / Integration Engineer",
    sectionOrder: ["opening", "problem-identification", "technical-approach", "portfolio-evidence", "reliability", "timeline", "cta"],
    toneGuidance: "Clients fear that automations break silently. Address reliability early. That's the real concern behind most automation briefs.",
    commonPainPoints: [
      "Manual process is taking too much team time",
      "Data isn't syncing between tools correctly",
      "Previous automation broke and nobody noticed",
      "Need error handling and notifications",
      "Zaps/Make scenarios are at their limit",
    ],
    commonDeliverables: ["Workflow automation", "API integration", "Error handling", "Testing", "Documentation", "Monitoring setup"],
    warningFlags: [
      "Don't promise an automation will never break",
      "Don't underestimate edge cases",
      "Don't invent platforms you haven't worked with",
    ],
    structurePrompt: `Structure the proposal as follows:
1. Opening: Reference the specific tools or workflow mentioned
2. Problem Identification: Show you understand why the current process breaks down
3. Technical Approach: Describe the integration approach — tools, error handling, testing
4. Portfolio Evidence: Reference a relevant past automation (only from matched portfolio)
5. Reliability: Address how you handle edge cases and errors
6. Timeline: With testing phase included
7. CTA: Ask for access to the tools involved or a walkthrough of the current process`,
  },

  "marketing-specialist": {
    id: "marketing-specialist",
    label: "Marketing Specialist",
    sectionOrder: ["opening", "campaign-understanding", "strategy", "portfolio-evidence", "measurement", "timeline", "cta"],
    toneGuidance: "Speak to outcomes and metrics, not tactics. Clients hire marketers for results. Show you think about the numbers.",
    commonPainPoints: [
      "Ad spend is high but ROI is unclear",
      "Need a launch campaign on short notice",
      "Previous agency didn't communicate clearly",
      "Brand messaging is inconsistent",
      "Content isn't driving engagement",
    ],
    commonDeliverables: ["Campaign strategy", "Ad creatives", "Email campaigns", "Content calendar", "Analytics reporting", "Social media management"],
    warningFlags: [
      "Don't promise specific ROAS without knowing the ad account history",
      "Don't claim to be able to double revenue without data",
      "Don't invent client brands or campaign results",
    ],
    structurePrompt: `Structure the proposal as follows:
1. Opening: Reference the campaign goal or market position mentioned
2. Campaign Understanding: Show you understand the target audience and competitive context
3. Strategy: Describe your approach — channels, messaging, measurement
4. Portfolio Evidence: Reference a relevant campaign or result (only from matched portfolio)
5. Measurement: Mention how you'll track and report success
6. Timeline: Campaign phases if relevant
7. CTA: Ask about current ad accounts, analytics access, or existing brand assets`,
  },

  "general": {
    id: "general",
    label: "General Freelancer",
    sectionOrder: ["opening", "client-problem", "approach", "portfolio-evidence", "timeline", "cta"],
    toneGuidance: "Be direct and personal. Show you read the job post carefully. Reference one specific detail from it.",
    commonPainPoints: [
      "Need reliable delivery on time",
      "Clear communication throughout",
      "Quality work that doesn't need to be redone",
      "Understands the brief without constant supervision",
    ],
    commonDeliverables: ["Deliverable per brief", "Revisions", "Final handoff"],
    warningFlags: [
      "Don't be generic — reference the specific job",
      "Don't claim skills you don't have",
    ],
    structurePrompt: `Structure the proposal as follows:
1. Opening: Reference one specific detail from the job post
2. Client Problem: Show you understand what the client really needs
3. Approach: Describe how you'd tackle this project
4. Portfolio Evidence: Reference one relevant past project (only from matched portfolio)
5. Timeline: Realistic estimate
6. CTA: Clear next step invitation`,
  },
};

/**
 * Map a job industry string to a template ID.
 */
export function resolveTemplateId(industry: string, skills: string[]): TemplateId {
  const lower = industry.toLowerCase();
  const skillStr = skills.map((s) => s.toLowerCase()).join(" ");

  if (lower.includes("video") || lower.includes("edit") || skillStr.includes("video")) return "video-editor";
  if (lower.includes("seo") || lower.includes("search engine") || skillStr.includes("seo")) return "seo-specialist";
  if (lower.includes("copy") || lower.includes("content writ") || skillStr.includes("copywriting")) return "copywriter";
  if ((lower.includes("graphic") || lower.includes("brand")) && !lower.includes("web")) return "graphic-designer";
  if (lower.includes("ui") || lower.includes("ux") || lower.includes("design") || skillStr.includes("figma")) return "ui-designer";
  if (lower.includes("automat") || lower.includes("integrat") || lower.includes("workflow")) return "automation-engineer";
  if (lower.includes("market") || lower.includes("advertis") || lower.includes("campaign")) return "marketing-specialist";
  if (lower.includes("web") || lower.includes("dev") || lower.includes("software") || lower.includes("app")) return "web-developer";
  return "general";
}
