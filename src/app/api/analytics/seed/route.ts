import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // 1. Clean existing records for this user
    await Promise.all([
      prisma.deliverableVersion.deleteMany({ where: { deliverable: { userId } } }),
      prisma.deliverable.deleteMany({ where: { userId } }),
      prisma.projectFile.deleteMany({ where: { userId } }),
      prisma.invoiceItem.deleteMany({ where: { invoice: { userId } } }),
      prisma.invoice.deleteMany({ where: { userId } }),
      prisma.milestone.deleteMany({ where: { project: { userId } } }),
      prisma.project.deleteMany({ where: { userId } }),
      prisma.clientInvitation.deleteMany({ where: { freelancerId: userId } }),
      prisma.client.deleteMany({ where: { userId } }),
      prisma.proposal.deleteMany({ where: { userId } }),
      prisma.activity.deleteMany({ where: { userId } }),
    ]);

    const now = new Date();
    const subMonths = (m: number) => {
      const d = new Date();
      d.setMonth(now.getMonth() - m);
      return d;
    };

    const ws = await prisma.workspace.findFirst({ where: { ownerId: userId } });

    // 2. Seed Clients
    const client1 = await prisma.client.create({
      data: {
        userId,
        workspaceId: ws?.id,
        name: "Acme Corporation",
        email: "billing@acme.com",
        company: "Acme Corp",
        status: "active",
        tags: ["enterprise", "tech"],
        totalProjects: 3,
        totalEarned: 24000,
      },
    });

    const client2 = await prisma.client.create({
      data: {
        userId,
        workspaceId: ws?.id,
        name: "Stark Industries",
        email: "contracts@stark.com",
        company: "Stark Ind.",
        status: "active",
        tags: ["high-budget", "defense"],
        totalProjects: 2,
        totalEarned: 45000,
      },
    });

    const client3 = await prisma.client.create({
      data: {
        userId,
        workspaceId: ws?.id,
        name: "Wayne Enterprises",
        email: "accounts@wayne.com",
        company: "Wayne Ent.",
        status: "active",
        tags: ["design", "finance"],
        totalProjects: 2,
        totalEarned: 18000,
      },
    });

    const client4 = await prisma.client.create({
      data: {
        userId,
        workspaceId: ws?.id,
        name: "Pied Piper",
        email: "richard@piedpiper.com",
        company: "Pied Piper",
        status: "active",
        tags: ["startup", "compression"],
        totalProjects: 1,
        totalEarned: 8500,
      },
    });

    const client5 = await prisma.client.create({
      data: {
        userId,
        workspaceId: ws?.id,
        name: "Tyrell Corporation",
        email: "replicant@tyrell.co",
        company: "Tyrell Corp",
        status: "inactive",
        tags: ["ai", "robotics"],
        totalProjects: 1,
        totalEarned: 12000,
      },
    });

    // 3. Seed Proposals
    await prisma.proposal.createMany({
      data: [
        {
          userId,
          workspaceId: ws?.id,
          title: "Enterprise Brand Redesign",
          clientId: client1.id,
          clientName: client1.name,
          status: "won",
          value: 15000,
          currency: "USD",
          createdAt: subMonths(8),
        },
        {
          userId,
          workspaceId: ws?.id,
          title: "AI Interface Prototyping",
          clientId: client2.id,
          clientName: client2.name,
          status: "won",
          value: 30000,
          currency: "USD",
          createdAt: subMonths(6),
        },
        {
          userId,
          workspaceId: ws?.id,
          title: "Financial Dashboard Design System",
          clientId: client3.id,
          clientName: client3.name,
          status: "won",
          value: 20000,
          currency: "USD",
          createdAt: subMonths(4),
        },
        {
          userId,
          workspaceId: ws?.id,
          title: "Decentralized Video Platform UI",
          clientId: client4.id,
          clientName: client4.name,
          status: "won",
          value: 12000,
          currency: "USD",
          createdAt: subMonths(2),
        },
        {
          userId,
          workspaceId: ws?.id,
          title: "Replicant UI Simulation System",
          clientId: client5.id,
          clientName: client5.name,
          status: "won",
          value: 12000,
          currency: "USD",
          createdAt: subMonths(5),
        },
        {
          userId,
          workspaceId: ws?.id,
          title: "SaaS Marketing Website Design",
          clientId: client1.id,
          clientName: client1.name,
          status: "sent",
          value: 8000,
          currency: "USD",
          createdAt: subMonths(1),
        },
        {
          userId,
          workspaceId: ws?.id,
          title: "Smart Armor Diagnostics Dashboard",
          clientId: client2.id,
          clientName: client2.name,
          status: "sent",
          value: 50000,
          currency: "USD",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          userId,
          workspaceId: ws?.id,
          title: "Batcomputer Analytics Interface",
          clientId: client3.id,
          clientName: client3.name,
          status: "lost",
          value: 45000,
          currency: "USD",
          createdAt: subMonths(3),
        },
        {
          userId,
          workspaceId: ws?.id,
          title: "Middle-Out Protocol Integration Consultancy",
          clientId: client4.id,
          clientName: client4.name,
          status: "lost",
          value: 18000,
          currency: "USD",
          createdAt: subMonths(3),
        },
        {
          userId,
          workspaceId: ws?.id,
          title: "Nexus-9 Lifecycle Monitor",
          clientId: client5.id,
          clientName: client5.name,
          status: "draft",
          value: 25000,
          currency: "USD",
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    // 4. Seed Projects
    const proj1 = await prisma.project.create({
      data: {
        userId,
        workspaceId: ws?.id,
        title: "Acme Web Portal Development",
        description: "Rebuilding the core customer portal with Next.js.",
        clientId: client1.id,
        clientName: client1.name,
        category: "development",
        status: "completed",
        priority: "high",
        budget: 15000,
        currency: "USD",
        paid: 15000,
        progress: 100,
        startDate: subMonths(8).toISOString().split("T")[0],
        dueDate: subMonths(6).toISOString().split("T")[0],
        createdAt: subMonths(8),
      },
    });

    const proj2 = await prisma.project.create({
      data: {
        userId,
        workspaceId: ws?.id,
        title: "Acme Brand Strategy Design",
        description: "Modernizing Acme branding guidelines.",
        clientId: client1.id,
        clientName: client1.name,
        category: "design",
        status: "active",
        priority: "medium",
        budget: 9000,
        currency: "USD",
        paid: 6000,
        progress: 65,
        startDate: subMonths(2).toISOString().split("T")[0],
        dueDate: subMonths(-1).toISOString().split("T")[0],
        createdAt: subMonths(2),
      },
    });

    const proj3 = await prisma.project.create({
      data: {
        userId,
        workspaceId: ws?.id,
        title: "Stark AI Interface R&D",
        description: "Creating prototypes for next-generation holographic HUDs.",
        clientId: client2.id,
        clientName: client2.name,
        category: "development",
        status: "completed",
        priority: "urgent",
        budget: 30000,
        currency: "USD",
        paid: 30000,
        progress: 100,
        startDate: subMonths(6).toISOString().split("T")[0],
        dueDate: subMonths(4).toISOString().split("T")[0],
        createdAt: subMonths(6),
      },
    });

    const proj4 = await prisma.project.create({
      data: {
        userId,
        workspaceId: ws?.id,
        title: "Stark Diagnostics Tool",
        description: "Analytical app for armor subsystem monitoring.",
        clientId: client2.id,
        clientName: client2.name,
        category: "development",
        status: "active",
        priority: "high",
        budget: 15000,
        currency: "USD",
        paid: 5000,
        progress: 30,
        startDate: subMonths(1).toISOString().split("T")[0],
        dueDate: subMonths(-2).toISOString().split("T")[0],
        createdAt: subMonths(1),
      },
    });

    const proj5 = await prisma.project.create({
      data: {
        userId,
        workspaceId: ws?.id,
        title: "Wayne Corporate Dashboard UI",
        description: "Redesigning Wayne Enterprises internal investment analytics interface.",
        clientId: client3.id,
        clientName: client3.name,
        category: "design",
        status: "completed",
        priority: "high",
        budget: 18000,
        currency: "USD",
        paid: 18000,
        progress: 100,
        startDate: subMonths(4).toISOString().split("T")[0],
        dueDate: subMonths(2).toISOString().split("T")[0],
        createdAt: subMonths(4),
      },
    });

    const proj6 = await prisma.project.create({
      data: {
        userId,
        workspaceId: ws?.id,
        title: "Wayne Crypto Platform Advisory",
        description: "Security assessment and UI design patterns for Wayne FinTech.",
        clientId: client3.id,
        clientName: client3.name,
        category: "consulting",
        status: "on_hold",
        priority: "medium",
        budget: 10000,
        currency: "USD",
        paid: 2000,
        progress: 20,
        startDate: subMonths(3).toISOString().split("T")[0],
        dueDate: subMonths(1).toISOString().split("T")[0],
        createdAt: subMonths(3),
      },
    });

    const proj7 = await prisma.project.create({
      data: {
        userId,
        workspaceId: ws?.id,
        title: "Pied Piper Platform Revamp",
        description: "Modernizing the Web UI of the decentralized cloud client.",
        clientId: client4.id,
        clientName: client4.name,
        category: "design",
        status: "active",
        priority: "medium",
        budget: 8500,
        currency: "USD",
        paid: 4000,
        progress: 50,
        startDate: subMonths(2).toISOString().split("T")[0],
        dueDate: subMonths(-1).toISOString().split("T")[0],
        createdAt: subMonths(2),
      },
    });

    const proj8 = await prisma.project.create({
      data: {
        userId,
        workspaceId: ws?.id,
        title: "Tyrell Replicant Simulator",
        description: "Consulting on the UI for biometric responses.",
        clientId: client5.id,
        clientName: client5.name,
        category: "consulting",
        status: "completed",
        priority: "medium",
        budget: 12000,
        currency: "USD",
        paid: 12000,
        progress: 100,
        startDate: subMonths(5).toISOString().split("T")[0],
        dueDate: subMonths(3).toISOString().split("T")[0],
        createdAt: subMonths(5),
      },
    });

    // 5. Seed Invoices
    await prisma.invoice.create({
      data: {
        userId,
        workspaceId: ws?.id,
        invoiceNumber: "INV-2026-001",
        clientId: client1.id,
        projectId: proj1.id,
        status: "paid",
        issueDate: subMonths(8),
        dueDate: subMonths(7),
        subtotal: 5000,
        discount: 0,
        discountAmount: 0,
        taxableAmount: 5000,
        taxRate: 10,
        taxAmount: 500,
        total: 5500,
        amountPaid: 5500,
        remainingAmount: 0,
        currency: "USD",
        createdAt: subMonths(8),
        updatedAt: subMonths(7.5),
      },
    });

    await prisma.invoice.create({
      data: {
        userId,
        workspaceId: ws?.id,
        invoiceNumber: "INV-2026-002",
        clientId: client1.id,
        projectId: proj1.id,
        status: "paid",
        issueDate: subMonths(7),
        dueDate: subMonths(6),
        subtotal: 10000,
        discount: 0,
        discountAmount: 0,
        taxableAmount: 10000,
        taxRate: 10,
        taxAmount: 1000,
        total: 11000,
        amountPaid: 11000,
        remainingAmount: 0,
        currency: "USD",
        createdAt: subMonths(7),
        updatedAt: subMonths(6.8),
      },
    });

    await prisma.invoice.create({
      data: {
        userId,
        workspaceId: ws?.id,
        invoiceNumber: "INV-2026-003",
        clientId: client1.id,
        projectId: proj2.id,
        status: "partially_paid",
        issueDate: subMonths(2),
        dueDate: subMonths(1),
        subtotal: 9000,
        discount: 0,
        discountAmount: 0,
        taxableAmount: 9000,
        taxRate: 10,
        taxAmount: 900,
        total: 9900,
        amountPaid: 6600,
        remainingAmount: 3300,
        currency: "USD",
        createdAt: subMonths(2),
        updatedAt: subMonths(1.5),
      },
    });

    await prisma.invoice.create({
      data: {
        userId,
        workspaceId: ws?.id,
        invoiceNumber: "INV-2026-004",
        clientId: client2.id,
        projectId: proj3.id,
        status: "paid",
        issueDate: subMonths(6),
        dueDate: subMonths(5),
        subtotal: 30000,
        discount: 0,
        discountAmount: 0,
        taxableAmount: 30000,
        taxRate: 10,
        taxAmount: 3000,
        total: 33000,
        amountPaid: 33000,
        remainingAmount: 0,
        currency: "USD",
        createdAt: subMonths(6),
        updatedAt: subMonths(5.9),
      },
    });

    await prisma.invoice.create({
      data: {
        userId,
        workspaceId: ws?.id,
        invoiceNumber: "INV-2026-005",
        clientId: client2.id,
        projectId: proj4.id,
        status: "sent",
        issueDate: subMonths(1),
        dueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        subtotal: 5000,
        discount: 0,
        discountAmount: 0,
        taxableAmount: 5000,
        taxRate: 10,
        taxAmount: 500,
        total: 5500,
        amountPaid: 0,
        remainingAmount: 5500,
        currency: "USD",
        createdAt: subMonths(1),
        updatedAt: subMonths(1),
      },
    });

    await prisma.invoice.create({
      data: {
        userId,
        workspaceId: ws?.id,
        invoiceNumber: "INV-2026-006",
        clientId: client3.id,
        projectId: proj5.id,
        status: "paid",
        issueDate: subMonths(4),
        dueDate: subMonths(3),
        subtotal: 18000,
        discount: 0,
        discountAmount: 0,
        taxableAmount: 18000,
        taxRate: 10,
        taxAmount: 1800,
        total: 19800,
        amountPaid: 19800,
        remainingAmount: 0,
        currency: "USD",
        createdAt: subMonths(4),
        updatedAt: subMonths(3.9),
      },
    });

    await prisma.invoice.create({
      data: {
        userId,
        workspaceId: ws?.id,
        invoiceNumber: "INV-2026-007",
        clientId: client3.id,
        projectId: proj6.id,
        status: "overdue",
        issueDate: subMonths(3),
        dueDate: subMonths(2),
        subtotal: 10000,
        discount: 0,
        discountAmount: 0,
        taxableAmount: 10000,
        taxRate: 10,
        taxAmount: 1000,
        total: 11000,
        amountPaid: 2200,
        remainingAmount: 8800,
        currency: "USD",
        createdAt: subMonths(3),
        updatedAt: subMonths(2.5),
      },
    });

    await prisma.invoice.create({
      data: {
        userId,
        workspaceId: ws?.id,
        invoiceNumber: "INV-2026-008",
        clientId: client4.id,
        projectId: proj7.id,
        status: "sent",
        issueDate: subMonths(1),
        dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        subtotal: 4000,
        discount: 0,
        discountAmount: 0,
        taxableAmount: 4000,
        taxRate: 10,
        taxAmount: 400,
        total: 4400,
        amountPaid: 0,
        remainingAmount: 4400,
        currency: "USD",
        createdAt: subMonths(1),
        updatedAt: subMonths(1),
      },
    });

    await prisma.invoice.create({
      data: {
        userId,
        workspaceId: ws?.id,
        invoiceNumber: "INV-2026-009",
        clientId: client5.id,
        projectId: proj8.id,
        status: "paid",
        issueDate: subMonths(5),
        dueDate: subMonths(4),
        subtotal: 12000,
        discount: 0,
        discountAmount: 0,
        taxableAmount: 12000,
        taxRate: 10,
        taxAmount: 1200,
        total: 13200,
        amountPaid: 13200,
        remainingAmount: 0,
        currency: "USD",
        createdAt: subMonths(5),
        updatedAt: subMonths(4.7),
      },
    });

    await prisma.invoice.create({
      data: {
        userId,
        workspaceId: ws?.id,
        invoiceNumber: "INV-2026-010",
        clientId: client1.id,
        status: "draft",
        issueDate: new Date(),
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 2500,
        discount: 0,
        discountAmount: 0,
        taxableAmount: 2500,
        taxRate: 10,
        taxAmount: 250,
        total: 2750,
        amountPaid: 0,
        remainingAmount: 2750,
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 6. Seed Activities
    await prisma.activity.createMany({
      data: [
        {
          userId,
          type: "invoice_paid",
          title: "Invoice INV-2026-009 Paid",
          description: "Received payment of $13,200 from Tyrell Corporation for Replicant Simulator UI.",
          createdAt: subMonths(4.7),
        },
        {
          userId,
          type: "client_added",
          title: "New Client Added",
          description: "Pied Piper has been onboarded.",
          createdAt: subMonths(2),
        },
        {
          userId,
          type: "proposal_generated",
          title: "Proposal generated",
          description: "AI-powered proposal generated for 'Batcomputer Analytics Interface'.",
          createdAt: subMonths(3),
        },
        {
          userId,
          type: "invoice_sent",
          title: "Invoice INV-2026-008 Sent",
          description: "Scoping proposal invoice sent to Pied Piper ($4,400).",
          createdAt: subMonths(1),
        },
        {
          userId,
          type: "invoice_paid",
          title: "Invoice INV-2026-003 Partially Paid",
          description: "Received partial payment of $6,600 from Acme Corporation.",
          createdAt: subMonths(1.5),
        },
      ],
    });

    return NextResponse.json({ success: true, message: "Demo workspace generated successfully in PostgreSQL!" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to seed demo data";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
