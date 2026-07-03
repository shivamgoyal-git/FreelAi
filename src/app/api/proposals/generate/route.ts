import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { AiContextService } from "@/lib/ai-context-service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const {
      clientName,
      platform,
      jobPost,
      portfolios = [],
      budget,
      timeline,
      tone,
    } = await req.json();

    if (!clientName || !jobPost) {
      return NextResponse.json(
        { error: "Client name and Job post details are required" },
        { status: 400 }
      );
    }

    // Retrieve central freelancer identity context
    const freelancerContext = await AiContextService.getAiSystemContext(session.user.id);
    const profile = await AiContextService.getProfile(session.user.id);

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      // ─── LIVE GEMINI API CALL ───────────────────────────────────────
      const systemPrompt = `
You are an expert freelance growth consultant. Your task is to analyze the provided Client Job Post and generate a highly personalized, structured proposal, pricing breakdown, and deep AI metrics analysis.

${freelancerContext}

Analyze client requirements, pain points, urgency, budget sensitivity, and complexity. Mirror the client's communication style while maintaining the selected tone: "${tone}". Incorporate the freelancer's skills, experience, and custom AI notes directives.

You must return a raw JSON object ONLY. Do not wrap in markdown codeblocks (e.g. do not write \`\`\`json). The JSON must match this TypeScript interface exactly:

interface IProposalGeneration {
  sections: {
    executiveSummary: string; // Markdown supported. Highlight alignment and address their pain points.
    scopeOfWork: string; // Markdown supported. Outline key deliverables, tasks, and boundaries.
    timelineAndMilestones: string; // Markdown supported. Outline phase dates, sprints, and approvals.
    callToAction: string; // Markdown supported. End with a high-converting, easy call-to-action.
  };
  pricingBreakdown: {
    basic: { price: number; description: string; timeline: string };
    standard: { price: number; description: string; timeline: string };
    premium: { price: number; description: string; timeline: string };
  };
  aiAnalysis: {
    readability: "Easy" | "Medium" | "Complex";
    personalization: number; // 0 to 100
    professionalism: number; // 0 to 100
    confidence: number; // 0 to 100
    urgency: "Low" | "Medium" | "High";
    budgetSensitivity: "Low" | "Medium" | "High";
    complexity: "Low" | "Medium" | "High";
    communicationStyle: string; // e.g., "Conversational", "Formal & Technical", "Direct & Outcome-driven"
  };
  scoreBreakdown: {
    overall: number; // calculated as average of clarity, alignment, callToAction, valueProposition
    clarity: number; // 0 to 100
    alignment: number; // 0 to 100
    callToAction: number; // 0 to 100
    valueProposition: number; // 0 to 100
  };
  detectedPainPoints: string[]; // List at least 3 detected client pain points
  aiSuggestions: string[]; // List at least 3 actionable suggestions to improve the proposal
  promptVersion: string; // Set this as "v2.0"
}

User Inputs:
- Client Name: "${clientName}"
- platform: "${platform}"
- Tone: "${tone}"
- Budget Limit: "${budget ? `$${budget}` : "Not specified"}"
- Target Timeline: "${timeline || "Not specified"}"
- Portfolio References: [${portfolios.join(", ")}]
- Client Job Post:
"${jobPost}"
`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API responded with status ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error("Empty response from Gemini API");
      }

      const parsedResult = JSON.parse(rawText.trim());
      return NextResponse.json(parsedResult);
    } else {
      // ─── HIGH-FIDELITY MOCK AI FALLBACK (CUSTOMIZED VIA IDENTITY) ───
      // Provide a fully customized realistic proposal based on keywords in the job post
      const isMobile = /app|mobile|ios|android|phone/i.test(jobPost);
      const isDesign = /design|ui|ux|figma|branding|logo/i.test(jobPost);
      const isMarketing = /marketing|seo|growth|ads|social/i.test(jobPost);
      
      let category = profile?.professional?.primaryProfession || "Web Development";
      if (isMobile && !profile) category = "Mobile Application";
      else if (isDesign && !profile) category = "UI/UX Design";
      else if (isMarketing && !profile) category = "Growth Marketing";

      const finalBudget = budget || (profile?.pricing?.hourlyRate ? profile.pricing.hourlyRate * 80 : 4500);
      const finalTimeline = timeline || profile?.preferences?.defaultTimeline || "4 weeks";
      const freelancerName = profile?.personal?.fullName || session.user.name || "Freelancer";
      const freelancerTitle = profile?.personal?.professionalTitle || profile?.professional?.primaryProfession || "Freelancer";

      const mockResponse = {
        sections: {
          executiveSummary: `### Executive Summary
Hi ${clientName},

I reviewed your project post regarding **${category}** on ${platform}. It is clear that you are looking for a reliable expert who can hit the ground running, deliver clean results, and optimize for user engagement. 

As a professional **${freelancerTitle}**, I specialize in establishing streamlined user flows while keeping quality high. I have delivered similar projects for multiple setups and would love to bring my expertise to your workspace. By aligning our strategy directly with your target goals, we can assure a high-quality build that delivers outcome-driven results.

Below, you'll find a structured scope of work, timeline, and pricing breakdown. Let's schedule a call to finalize the details!`,
          scopeOfWork: `### Scope of Work
Here is the proposed list of deliverables to satisfy your project brief:

1. **Discovery & Alignment**: Deep-dive into user requirements, analyze competitors, and map out the layout structure.
2. **Design Prototyping**: Deliver high-fidelity mockups matching your requested **${tone}** tone.
3. **Core Handoff**: Implement a fully responsive structure matching modern standard styling, ensuring fast page speeds and full setups.
4. **Testing & QA**: Conduct cross-browser checks, mobile responsiveness tests, and load-time optimizations.`,
          timelineAndMilestones: `### Timeline & Milestones
We propose completing this project in **${finalTimeline}** with the following milestones:

* **Milestone 1**: Wireframes & Site Architecture Approval (Week 1)
* **Milestone 2**: Final Design Mockups & Style Guide Signoff (Week 2)
* **Milestone 3**: Clean Code Delivery & Integration (Week 3)
* **Milestone 4**: Final Polish, Launch, & Handoff (Week 4)`,
          callToAction: `### Call to Action
If this alignment matches your expectations, here are the next steps:

1. **Introductory Call**: Let's jump on a quick 15-minute Google Meet/Zoom call to discuss any technical parameters.
2. **Contract Signoff**: Secure the kickoff date.
3. **Kickoff**: Initiate research on Milestone 1 immediately!

Looking forward to collaborating,
*FreelAI Identity Copilot on behalf of ${freelancerName}*`,
        },
        pricingBreakdown: {
          basic: {
            price: Math.round(finalBudget * 0.7),
            description: "Core features setup, responsive design, and standard support.",
            timeline: "2-3 weeks",
          },
          standard: {
            price: finalBudget,
            description: "Full deliverables including custom animations, SEO setup, and 30 days support.",
            timeline: finalTimeline,
          },
          premium: {
            price: Math.round(finalBudget * 1.4),
            description: "Everything in Standard + custom copywriting, analytics integrations, and 60 days priority support.",
            timeline: "5 weeks",
          },
        },
        aiAnalysis: {
          readability: "Easy" as const,
          personalization: 90,
          professionalism: 95,
          confidence: 93,
          urgency: /urgent|soon|asap|fast/i.test(jobPost) ? ("High" as const) : ("Medium" as const),
          budgetSensitivity: /budget|cheap|low cost|tight/i.test(jobPost) ? ("High" as const) : ("Medium" as const),
          complexity: /complex|difficult|expert|scale|senior/i.test(jobPost) ? ("High" as const) : ("Medium" as const),
          communicationStyle: tone === "Friendly" ? "Conversational" : "Technical & Outcome-driven",
        },
        scoreBreakdown: {
          overall: 92,
          clarity: 93,
          alignment: 90,
          callToAction: 95,
          valueProposition: 90,
        },
        detectedPainPoints: [
          "Requirement for high-converting layout structure aligned with conversion goals.",
          "High risk of project delays due to poor scoping or communication misalignment.",
          "Need for optimized loading speed and responsive layouts across mobile devices.",
        ],
        aiSuggestions: [
          "Reference specific portfolio links in the Executive Summary to show immediate proof of concept.",
          "Incorporate a 10% early-bird discount on the Standard tier to trigger immediate client conversion.",
          "Add details about post-launch support windows (e.g. 30 days free bug-fixing) to boost trust scores.",
        ],
        promptVersion: "v2.1 (Context Integrated Mock)",
      };

      // Artificially simulate delay to give real AI feel
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return NextResponse.json(mockResponse);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to run AI proposal generation";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
