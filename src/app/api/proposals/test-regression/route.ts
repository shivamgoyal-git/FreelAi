import { NextRequest, NextResponse } from "next/server";
import { JobAnalyzer } from "@/lib/job-analyzer";
import { PortfolioMatcher } from "@/lib/portfolio-matcher";
import { ValidationEngine, type GenerationContext } from "@/lib/validation-engine";

export async function GET(req: NextRequest) {
  const results: Array<{ name: string; passed: boolean; message: string }> = [];

  // Helper to push results
  const assert = (name: string, condition: boolean, message: string) => {
    results.push({ name, passed: condition, message });
  };

  try {
    // ─── TEST 1: Empty Job Description ───
    try {
      const result = await JobAnalyzer.analyze("");
      assert(
        "Empty Job Description",
        result.data.requiredSkills.includes("Freelance Consulting"),
        "Empty description correctly fallbacks to general consulting skills."
      );
    } catch (err: any) {
      assert("Empty Job Description", true, `Gracefully caught or rejected empty description: ${err.message}`);
    }

    // ─── TEST 2: Video Editing Job Description (Contamination check) ───
    const videoJob = "Looking for a video editor to cut YouTube documentary movies. Needs motion graphics and Premiere Pro storytelling skills.";
    const videoAnalysis = (await JobAnalyzer.analyze(videoJob)).data;
    assert(
      "Video Editing Job Analysis Skills",
      videoAnalysis.requiredSkills.every((s) => !/react|next|node|tailwind/i.test(s)),
      "Video Editing analysis contains no React/Next/Tailwind/Node skills."
    );

    // Mock Context
    const mockContext: GenerationContext = {
      freelancerProfile: {
        personal: { fullName: "Jane Doe" },
        professional: { skills: ["Video Editing", "Premiere Pro", "After Effects", "React"] },
      },
      matchedPortfolio: [
        {
          project: {
            _id: "p1",
            title: "YouTube Documentary Editing Portfolio",
            description: "Edited 10 documentaries in Premiere Pro.",
            skills: ["Video Editing", "Premiere Pro"],
            link: "https://youtube.com",
          },
          matchScore: 95,
          matchReason: "Direct match",
          skillsMatched: ["Video Editing", "Premiere Pro"],
          technologiesMatched: ["Premiere Pro"],
        },
      ],
      currentJobAnalysis: videoAnalysis,
      rawJobPost: videoJob,
      currentUserInput: { clientName: "TestClient", platform: "Upwork", budget: 0, timeline: "", tone: "Auto" },
      aiPreferences: {},
      generationId: "test-gen-id",
      createdAt: new Date(),
    };

    // Test Portfolio filtering (ensure no React Dashboard is matched)
    const matchedProjects = await PortfolioMatcher.findTopMatches("test-user-id", videoAnalysis);
    assert(
      "Portfolio Match Filtering",
      matchedProjects.every((p) => !/react|dashboard/i.test(p.project.title)),
      "Mismatched portfolio items (e.g. React Dashboard) are filtered out."
    );

    // Validate a mock proposal for video editing
    const videoProposalDraft = `Hi, I saw your post looking for a video editor. I have experience cutting YouTube documentaries in Premiere Pro and adding motion graphics. Here is my portfolio project YouTube Documentary Editing Portfolio. Let's schedule a call to connect.`;
    const videoValidation = ValidationEngine.validate(videoProposalDraft, mockContext);
    assert(
      "Video Editing Proposal Verification",
      videoValidation.passed && !videoProposalDraft.toLowerCase().includes("react"),
      "Video Editing proposal passes validation and contains zero React references."
    );

    // ─── TEST 3: React Dashboard Job Description (Match Check) ───
    const reactJob = "We need a frontend engineer skilled in React and Next.js to build a SaaS analytics dashboard. Fully responsive CSS.";
    const reactAnalysis = (await JobAnalyzer.analyze(reactJob)).data;
    assert(
      "React Job Analysis Tech Stack",
      reactAnalysis.technologies.includes("React") || reactAnalysis.requiredSkills.some((s) => s.toLowerCase().includes("react")),
      "React Job correctly extracts React/Next.js stack."
    );

    const reactContext: GenerationContext = {
      freelancerProfile: {
        personal: { fullName: "Jane Doe" },
        professional: { skills: ["React", "Next.js", "TypeScript"] },
      },
      matchedPortfolio: [
        {
          project: {
            _id: "p2",
            title: "React SaaS Dashboard Build",
            description: "Analytics dashboard in Next.js",
            skills: ["React", "Next.js"],
            link: "https://github.com",
          },
          matchScore: 98,
          matchReason: "Direct match",
          skillsMatched: ["React", "Next.js"],
          technologiesMatched: ["React", "Next.js"],
        },
      ],
      currentJobAnalysis: reactAnalysis,
      rawJobPost: reactJob,
      currentUserInput: { clientName: "TestClient", platform: "Upwork", budget: 500, timeline: "2 weeks", tone: "Auto" },
      aiPreferences: {},
      generationId: "test-gen-id-react",
      createdAt: new Date(),
    };

    const reactProposalDraft = `Hi, I reviewed your SaaS analytics dashboard job. I'm a developer who specializes in SaaS Dashboard Development using React and Next.js. I have worked on similar dashboards, specifically my React SaaS Dashboard Build project. Let's discuss.`;
    const reactValidation = ValidationEngine.validate(reactProposalDraft, reactContext);
    assert(
      "React Dashboard Proposal Verification",
      reactValidation.passed,
      "React proposal passes validation successfully."
    );

    // ─── TEST 4: Graphic Design Job (Contamination check 2) ───
    const designJob = "Looking for a graphic designer to create a brand logo and identity board in Figma. Vector graphics expert.";
    const designAnalysis = (await JobAnalyzer.analyze(designJob)).data;
    assert(
      "Graphic Design Job Analysis",
      designAnalysis.requiredSkills.every((s) => !/mongodb|backend|node/i.test(s)),
      "Graphic Design analysis does not contain backend or MongoDB keywords."
    );

    const designProposalDraft = `Hi, I saw your post for a logo brand designer. I work in Figma creating vector brand boards. Let's hop on a call to talk.`;
    const designContext: GenerationContext = {
      freelancerProfile: {
        personal: { fullName: "Jane Doe" },
        professional: { skills: ["UI/UX Design", "Figma", "MongoDB"] },
      },
      matchedPortfolio: [],
      currentJobAnalysis: designAnalysis,
      rawJobPost: designJob,
      currentUserInput: { clientName: "TestClient", platform: "Upwork", budget: 0, timeline: "", tone: "Auto" },
      aiPreferences: {},
      generationId: "test-gen-id-design",
      createdAt: new Date(),
    };
    const designValidation = ValidationEngine.validate(designProposalDraft, designContext);
    assert(
      "Graphic Design Proposal Verification",
      !designProposalDraft.toLowerCase().includes("mongodb") && designValidation.passed,
      "Graphic Design proposal does not reference backend technologies and passes validation."
    );

    // ─── TEST 5: Missing Timeline or Budget (No inventions check) ───
    const missingContext: GenerationContext = {
      ...reactContext,
      currentUserInput: { clientName: "Test", platform: "Upwork", budget: 0, timeline: "", tone: "Auto" },
    };
    const proposalWithInventedTimeline = `I can build this React dashboard. The price is $1200 and it will take 3 weeks to finish.`;
    const inventedValidation = ValidationEngine.validate(proposalWithInventedTimeline, missingContext);
    assert(
      "Missing Budget/Timeline Validator",
      inventedValidation.violations.some((v) => v.includes("Hallucination")),
      "Correctly flags invented budget pricing or timeline dates not in context."
    );

    return NextResponse.json({
      success: results.every((r) => r.passed),
      testCount: results.length,
      results,
      debug: {
        videoViolations: videoValidation.violations,
        reactViolations: reactValidation.violations,
        designViolations: designValidation.violations,
        inventedViolations: inventedValidation.violations,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
