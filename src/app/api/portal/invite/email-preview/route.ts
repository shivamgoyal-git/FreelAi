import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateClientInvitationHtml } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (process.env.NODE_ENV !== "development" && !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (token) {
      const invitation = await prisma.clientInvitation.findUnique({
        where: { token },
      });

      if (invitation) {
        const client = await prisma.client.findUnique({
          where: { id: invitation.clientId },
        });
        const projects = await prisma.project.findMany({
          where: { clientId: invitation.clientId },
          include: { milestones: true },
        });

        const profile = await prisma.freelancerProfile.findUnique({
          where: { userId: invitation.freelancerId },
        });

        const personal = (profile?.personal as any) || {};
        const business = (profile?.business as any) || {};

        const html = generateClientInvitationHtml({
          freelancerName: personal.fullName || "Shivam Goyal",
          freelancerEmail: "shivam@freelai.com",
          freelancerCompany: business.companyName || "FreeAI Studio",
          clientName: client?.name || "Rahul Sharma",
          clientEmail: invitation.email,
          clientCompany: client?.company || "Acme Corp",
          invitationUrl: `${req.nextUrl.origin}/portal/invite/${invitation.token}`,
          expiresAt: invitation.expiresAt,
          project:
            projects.length === 1
              ? {
                  title: projects[0].title,
                  description: projects[0].description || "",
                  status: projects[0].status,
                  budget: projects[0].budget,
                  currency: projects[0].currency || "USD",
                  progress: projects[0].progress,
                  dueDate: projects[0].dueDate || "",
                  milestones: (projects[0].milestones || []).map((m) => ({
                    title: m.title,
                    dueDate: m.dueDate || undefined,
                    completed: !!m.completed,
                  })),
                }
              : undefined,
          projects:
            projects.length > 1
              ? projects.map((p) => ({
                  title: p.title,
                  status: p.status,
                  progress: p.progress,
                  dueDate: p.dueDate || "",
                }))
              : undefined,
        });

        return new NextResponse(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
    }

    // Default sample preview
    const sampleHtml = generateClientInvitationHtml({
      freelancerName: "Shivam Goyal",
      freelancerEmail: "shivam@freelai.com",
      freelancerCompany: "Apex Design & Tech",
      clientName: "Rahul Sharma",
      clientEmail: "rahul@acme.com",
      clientCompany: "Acme Innovations Inc.",
      invitationUrl: `${req.nextUrl.origin}/portal/invite/sample-token-123456`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      project: {
        title: "Enterprise Client Portal & Redesign",
        description:
          "End-to-end UX/UI revamp and Next.js fullstack development with AI automation features and milestone-based deliverables.",
        status: "active",
        budget: 85000,
        currency: "INR",
        progress: 65,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        milestones: [
          { title: "Architecture & Design System", completed: true },
          {
            title: "Client Portal & Payment Flow",
            completed: false,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            title: "Production Deployment & QA",
            completed: false,
            dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      },
    });

    return new NextResponse(sampleHtml, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("[GET /api/portal/invite/email-preview] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
