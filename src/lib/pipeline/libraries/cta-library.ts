/**
 * CTA Library — 30+ call-to-action templates grouped by style.
 *
 * Selection: hash(clientName + platform) % ctas[style].length
 * Deterministic per client, varied across clients.
 */

export type CtaStyle = "soft" | "direct" | "question";

export const CTAS: Record<CtaStyle, string[]> = {
  soft: [
    "If this sounds like a fit, I'd love to hear more about what you're working on.",
    "Feel free to message me with any questions — I'm easy to reach and quick to reply.",
    "Happy to share more details about my process or past work if that would help.",
    "If you'd like to move forward, just send me a message and we can get the details sorted.",
    "I'm available to start as soon as you're ready to discuss the scope.",
    "Feel free to send over any additional context — I'll give you a more tailored response once I have the full picture.",
    "If anything in my message isn't clear, just ask — I'd rather clarify now than get into the project with misaligned expectations.",
    "I'm open to a short intro call if you'd prefer to talk through the details rather than messaging back and forth.",
    "Happy to answer any follow-up questions before you make a decision.",
    "If the timeline or budget needs adjusting, I'm flexible — let's figure out what works.",
  ],
  direct: [
    "I can have a proposal with more detail ready within a few hours if you'd like to see the full scope.",
    "Let's set up a 15-minute call this week — it'll save a lot of back and forth.",
    "I can start this week. Send me a message and we'll get it moving.",
    "I'd be happy to send over a sample of similar work before we commit to anything.",
    "Send me the project files when you're ready and I'll get started on the first draft immediately.",
    "I can turn this around within your deadline. Message me to confirm and I'll block the time.",
    "If you're ready to move forward, I just need the green light and I'll set everything up.",
    "Drop me a message with the final brief and I'll send a formal quote within the hour.",
    "I'm available on short notice if the deadline is tighter than your post suggests.",
    "Message me directly and I'll send you my portfolio and a sample project plan.",
  ],
  question: [
    "Would it help to see a sample from a similar project before we move forward?",
    "Are you open to a quick 15-minute call to make sure we're aligned on the brief?",
    "Do you have existing brand assets I should be working with, or is this starting fresh?",
    "What does your current approval process look like — is there a team involved or is it just you?",
    "Would you prefer async communication or do you like regular check-in calls during a project?",
    "Is the timeline flexible, or is the deadline a hard constraint?",
    "Are you looking for ongoing support after delivery, or is this a one-time project?",
    "Would a phased approach work — deliver the core first and expand from there?",
    "Have you worked with a freelancer on this before, or is this the first time you're outsourcing this?",
    "Is there a specific reason you chose this platform for this project, or are you comparing freelancers across a few channels?",
  ],
};

/**
 * Deterministically select a CTA style based on client tone and urgency.
 */
export function resolveCtaStyle(
  clientTone: string,
  urgency: string
): CtaStyle {
  const tone = clientTone.toLowerCase();
  const urg = urgency.toLowerCase();

  if (urg === "high" || tone.includes("urgent") || tone.includes("asap")) return "direct";
  if (tone.includes("friendly") || tone.includes("casual") || tone.includes("warm")) return "question";
  return "soft";
}

/**
 * Deterministically select a CTA from the resolved style pool.
 * Same client+platform always gets same CTA. Different clients get different ones.
 */
export function selectCta(
  clientName: string,
  platform: string,
  style: CtaStyle
): string {
  const pool = CTAS[style];
  let hash = 2166136261;
  const seed = (clientName + platform).toLowerCase();
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return pool[hash % pool.length];
}
