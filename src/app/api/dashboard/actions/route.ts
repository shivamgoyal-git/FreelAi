import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { logActivity } from "@/lib/activity";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const { action, promptText } = await req.json();

    if (!promptText || !promptText.trim()) {
      return NextResponse.json({ error: "Prompt text is required" }, { status: 400 });
    }

    const trimmedPrompt = promptText.trim();
    const userId = session.user.id;

    if (action === "proposal") {
      // 1. Simulate a beautiful AI Proposal output
      const generatedProposal = `### AI-Generated Proposal for: "${trimmedPrompt}"

**Executive Summary**
We propose a comprehensive end-to-end design and development solution tailored to your target audience. By utilizing our expertise in modern aesthetics, interactive components, and responsive typography, we will deliver an outstanding digital presence.

**Scope of Work**
1. **Discovery & UX Strategy**: Mapping user personas and defining information architecture.
2. **Visual Design System**: A high-fidelity, polished style guide with dark/light variables.
3. **Frontend Implementation**: Modern, accessible React component architecture with fluid animations.
4. **Testing & QA**: Comprehensive browser validation and speed optimization.

**Timeline & Milestones**
* **Milestone 1**: Wireframes & Layout approval (Week 1) — *30% deposit*
* **Milestone 2**: High-Fidelity UI Mockups (Week 2) — *40% progress payment*
* **Milestone 3**: Clean Code Delivery & Handoff (Week 3) — *30% final payment*

*Generated instantly by FreelAi Copilot.*`;

      // Log the activity
      await logActivity(
        userId,
        "proposal_generated",
        "Proposal generated",
        `AI proposal created: "${trimmedPrompt.substring(0, 50)}${trimmedPrompt.length > 50 ? "..." : ""}"`
      );

      return NextResponse.json({
        success: true,
        type: "proposal",
        response: generatedProposal,
      });

    } else if (action === "prompt") {
      // 2. Simulate Antigravity AI Helper response
      const responses = [
        `### Antigravity AI Assistant Response

Here is a refined cold pitch outreach message for your design services:

"Hi there,

I noticed your recent launch and loved the branding. However, I saw a few quick performance and layout optimizations that could help improve conversion rates on mobile devices.

I've put together a brief 2-minute visual breakdown of how we could boost your landing page readability. Let me know if you have 5 minutes to chat this week!

Best,
${session.user.name ?? "Freelancer"}"`,
        `### Antigravity AI Assistant Response

Here are 3 quick tips to optimize your current workflow:

1. **Automate Invoice Triggers**: Set up automatic reminder emails 2 days before a project milestone is due.
2. **Group Project Assets**: Always compile your design assets and fonts into a central Figma file link to save time during client handoff.
3. **Follow-Up Cadence**: Send a friendly follow-up 48 hours after submitting a proposal to stay top-of-mind.`,
        `### Antigravity AI Assistant Response

Based on your prompt: **"${trimmedPrompt}"**, here is the suggested pricing breakdown:

* **Hourly Strategy**: For high-ambiguity discovery work, bill at a premium hourly rate (e.g. $85-$120/hr).
* **Value-Based Fixed Pricing**: For well-defined deliverables like brand guidelines, charge a flat fee scaled to the client's business size (e.g. $2,500-$4,000).`
      ];

      // Select a response based on the prompt's content length or key terms
      const selectedResponse = responses[trimmedPrompt.length % responses.length];

      // Log the activity
      await logActivity(
        userId,
        "antigravity_prompt",
        "Antigravity Prompt run",
        `Ran AI prompt: "${trimmedPrompt.substring(0, 50)}${trimmedPrompt.length > 50 ? "..." : ""}"`
      );

      return NextResponse.json({
        success: true,
        type: "prompt",
        response: selectedResponse,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to run dashboard action";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
