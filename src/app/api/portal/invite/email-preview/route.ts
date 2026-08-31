import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import ClientInvitation from "@/models/ClientInvitation";
import Client from "@/models/Client";
import Project from "@/models/Project";
import FreelancerProfile from "@/models/FreelancerProfile";
import { generateClientInvitationHtml } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    // Allow in dev or when user is authenticated
    if (process.env.NODE_ENV !== "development" && !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    await connectDB();

    if (token) {
      const invitation = await ClientInvitation.findOne({ token });
      if (invitation) {
        const client = await Client.findById(invitation.clientId);
        const projects = await Project.find({
          clientId: invitation.clientId.toString(),
        });

        const profile = await FreelancerProfile.findOne({
          userId: invitation.freelancerId,
        });

        const html = generateClientInvitationHtml({
          freelancerName: (profile as any)?.personalInfo?.fullName || "Shivam Goyal",
          freelancerEmail: "shivam@freelai.com",
          freelancerCompany: (profile as any)?.businessInfo?.companyName || "FreeAI Studio",
          clientName: client?.name || "Rahul Sharma",
          clientEmail: invitation.email,
          clientCompany: client?.company || "Acme Corp",
          invitationUrl: `${req.nextUrl.origin}/portal/invite/${invitation.token}`,
          expiresAt: invitation.expiresAt,
          project:
            projects.length === 1
              ? {
                  title: projects[0].title,
                  description: projects[0].description,
                  status: projects[0].status,
                  budget: projects[0].budget,
                  currency: projects[0].currency,
                  progress: projects[0].progress,
                  dueDate: projects[0].dueDate,
                  milestones: (projects[0].milestones || []).map((m: any) => ({
                    title: m.title,
                    dueDate: m.dueDate,
                    completed: !!m.completed,
                  })),
                }
              : undefined,
          projects:
            projects.length > 1
              ? projects.map((p: any) => ({
                  title: p.title,
                  status: p.status,
                  progress: p.progress,
                  dueDate: p.dueDate,
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
