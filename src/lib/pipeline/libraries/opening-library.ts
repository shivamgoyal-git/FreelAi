/**
 * Opening Library — 40+ opening patterns grouped by industry.
 *
 * Selection: hash(jobDescription) % openings[industry].length
 * Deterministic per job, varied across different jobs.
 * Never repeats the same opening for the same job.
 */

export type OpeningIndustry =
  | "video-editing"
  | "web-development"
  | "design"
  | "seo"
  | "copywriting"
  | "automation"
  | "marketing"
  | "general";

export const OPENINGS: Record<OpeningIndustry, string[]> = {
  "video-editing": [
    "I noticed your project calls for a documentary-style edit — that's the format I enjoy most.",
    "The turnaround window you've mentioned is tight, and I've handled that kind of pressure before.",
    "One thing that stood out reading your post was the storytelling requirement — that's where I focus most of my time.",
    "The long-term nature of this project caught my eye. Consistent editing across a series is something I've done a lot.",
    "Reading your description, the part that resonated was the color grade requirement — it's a step a lot of editors rush.",
    "The combination of documentary editing and motion graphics in your post isn't common, and it's exactly what I do.",
    "Your requirement for subtitles and b-roll integration is something I build into my standard workflow.",
    "I noticed you're looking for someone who can work independently — I edit without needing constant direction.",
    "The style you described in your post is close to a project I finished recently, so this feels relevant to pitch on.",
    "Fast turnaround for documentary content is something I've built a specific workflow around.",
  ],
  "web-development": [
    "I read through your job post and the technical stack you're describing is exactly what I've been working with.",
    "The architecture challenge you've outlined is something I've solved in a couple of different ways — happy to walk through them.",
    "Your requirement for a clean, fast frontend without unnecessary dependencies is the approach I take by default.",
    "I noticed you're moving from a monolith to microservices — that's a transition I've helped two teams with.",
    "The performance metrics you mentioned as a goal are achievable. I've hit similar targets on comparable projects.",
    "Reading your post, I'm confident the auth flow you need isn't as complicated as it might seem right now.",
    "Your codebase sounds like it's at a pivot point — I've been in that exact situation and know what decisions matter most.",
    "The API design requirements you listed are solid. I'd suggest a few small additions that make versioning much easier later.",
    "I noticed you mentioned tight deadlines alongside a complex backend requirement — that's a combination I'm used to.",
    "Your job post is unusually clear about what you want, which makes it much easier to give you an accurate scope.",
  ],
  "design": [
    "Reading your brief, the visual direction you're describing feels close to work I've done in this space.",
    "Your emphasis on brand consistency across platforms is something I take seriously in every project.",
    "The UI challenge you described — making a complex product feel simple — is something I've solved before.",
    "I noticed you're working with an existing brand identity rather than starting from scratch. That's usually the harder brief.",
    "Your requirement for Figma handoffs that developers can actually use is a standard I hold myself to.",
    "The product you're building sounds like it needs design that earns trust quickly. That's a specific kind of challenge.",
    "Reading through your requirements, the component library scope is larger than most clients realize upfront — I'd plan for that.",
    "I noticed you mentioned accessibility requirements. That's something I build in from the wireframe stage, not as an afterthought.",
    "The rebrand direction you've outlined is bold. Done well, it'll shift how your clients perceive you immediately.",
    "Your project description mentions a tight timeline for design work that usually takes longer. I want to be realistic about what's possible.",
  ],
  "seo": [
    "I read through your post and the domain authority challenge you're describing is a common bottleneck — there's a clear path through it.",
    "Your current traffic profile sounds like a site that's been penalized or has thin content issues. I've diagnosed both before.",
    "The keyword gap you mentioned is something I'd want to audit before committing to a strategy.",
    "I noticed you're targeting a competitive niche. The approach I'd take is different from what most SEO services pitch.",
    "Reading your requirements, the technical SEO work alone could account for a significant ranking improvement before any content is created.",
    "Your site structure sounds like it's working against the content strategy you want. Fixing that first matters.",
    "I noticed you mentioned local SEO alongside national rankings — those are two different strategies and I'd want to separate them clearly.",
    "The backlink profile issue you described is fixable, but it takes time done properly. I'd rather be honest about that now.",
  ],
  "copywriting": [
    "Reading your brief, the voice you're describing is one I've written in before — conversational but with real authority.",
    "Your product needs copy that sells without sounding like it's selling. That's a specific craft.",
    "The email sequence you've outlined is solid structurally. The gap is usually in the subject lines and the first sentence.",
    "I noticed your current website copy is doing too much at once. Simplifying the message usually improves conversion.",
    "Your target audience sounds skeptical, which means the copy needs to earn trust before it asks for anything.",
    "Reading the examples you shared, the tone is close to what you want — it just needs sharper hooks and cleaner calls to action.",
    "I noticed you're launching a new product to an existing audience. That's actually easier than cold traffic — the copy can be warmer.",
  ],
  "automation": [
    "The workflow you described is exactly the kind of repetitive process that breaks down when done manually at scale.",
    "I noticed your current setup relies on manual steps between tools that could be connected automatically.",
    "Reading your requirements, the integration isn't technically complex — the tricky part is handling the edge cases cleanly.",
    "Your zapier workflow sounds like it's hitting limits that a custom integration would solve properly.",
    "I noticed you're dealing with data syncing issues between systems. I've built bridges between those platforms before.",
    "The automation you need is straightforward, but the error handling and retry logic is what makes it reliable in production.",
  ],
  "marketing": [
    "I read through your campaign brief and the audience targeting you're describing is actually more refined than most clients provide.",
    "Your current ad performance gap is probably in the creative, not the targeting — I've seen this pattern before.",
    "Reading your post, the funnel you've built is solid. The weak point is usually the handoff between awareness and consideration.",
    "I noticed you're running broad targeting right now. Narrowing it counterintuitively tends to improve ROAS.",
    "Your launch timeline is aggressive, but the campaign structure you need isn't complicated if we prioritize correctly.",
    "I noticed you're measuring success by clicks rather than conversion. That's worth a conversation before we finalize the strategy.",
  ],
  "general": [
    "I read through your job post carefully and I think I have a clear picture of what you need.",
    "The project you described sounds straightforward on the surface, but there are a couple of details I'd want to clarify early.",
    "One thing that stood out reading your requirements was the timeline — I want to make sure we're aligned on what's realistic.",
    "I noticed a few requirements in your post that suggest you've done this kind of project before and know exactly what went wrong last time.",
    "Reading your description, the challenge isn't just the deliverable — it's making sure the process is smooth from your side.",
    "Your job post is clear about outcomes, which makes it much easier to give you a useful response rather than a generic pitch.",
    "I noticed you mentioned reliability as a priority. That's something I take seriously, so let me explain how I work.",
    "The specific details you included in your post made this easier to respond to thoughtfully.",
  ],
};

/**
 * Deterministically select an opening for a given job.
 * Same job always gets the same opening. Different jobs get different ones.
 */
export function selectOpening(
  jobDescription: string,
  industry: OpeningIndustry
): string {
  const pool = OPENINGS[industry] || OPENINGS["general"];
  // Simple FNV-1a hash for deterministic index selection
  let hash = 2166136261;
  for (let i = 0; i < jobDescription.length; i++) {
    hash ^= jobDescription.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return pool[hash % pool.length];
}

/**
 * Map a job industry string from Stage 1 to an OpeningIndustry key.
 */
export function resolveOpeningIndustry(industry: string): OpeningIndustry {
  const lower = industry.toLowerCase();
  if (lower.includes("video") || lower.includes("edit") || lower.includes("film")) return "video-editing";
  if (lower.includes("web") || lower.includes("dev") || lower.includes("software") || lower.includes("code") || lower.includes("app")) return "web-development";
  if (lower.includes("design") || lower.includes("ui") || lower.includes("ux") || lower.includes("figma") || lower.includes("brand")) return "design";
  if (lower.includes("seo") || lower.includes("search") || lower.includes("organic")) return "seo";
  if (lower.includes("copy") || lower.includes("content") || lower.includes("writ")) return "copywriting";
  if (lower.includes("automat") || lower.includes("zapier") || lower.includes("integrat") || lower.includes("workflow")) return "automation";
  if (lower.includes("market") || lower.includes("ads") || lower.includes("campaign") || lower.includes("social")) return "marketing";
  return "general";
}
