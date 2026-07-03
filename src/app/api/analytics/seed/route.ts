import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Invoice from "@/models/Invoice";
import Proposal from "@/models/Proposal";
import Activity from "@/models/Activity";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  await connectDB();

  try {
    // 1. Clean existing records for this user to ensure clean state
    await Promise.all([
      Client.deleteMany({ userId }),
      Project.deleteMany({ userId }),
      Invoice.deleteMany({ userId }),
      Proposal.deleteMany({ userId }),
      Activity.deleteMany({ userId }),
    ]);

    const now = new Date();
    const subMonths = (m: number) => {
      const d = new Date();
      d.setMonth(now.getMonth() - m);
      return d;
    };

    // 2. Seed Clients (Normalized, status: active, inactive, prospect, archived)
    const seedClients = [
      {
        userId,
        name: "Acme Corporation",
        email: "billing@acme.com",
        company: "Acme Corp",
        status: "active",
        tags: ["enterprise", "tech"],
        totalProjects: 3,
        totalEarned: 24000,
      },
      {
        userId,
        name: "Stark Industries",
        email: "contracts@stark.com",
        company: "Stark Ind.",
        status: "active",
        tags: ["high-budget", "defense"],
        totalProjects: 2,
        totalEarned: 45000,
      },
      {
        userId,
        name: "Wayne Enterprises",
        email: "accounts@wayne.com",
        company: "Wayne Ent.",
        status: "active",
        tags: ["design", "finance"],
        totalProjects: 2,
        totalEarned: 18000,
      },
      {
        userId,
        name: "Pied Piper",
        email: "richard@piedpiper.com",
        company: "Pied Piper",
        status: "active",
        tags: ["startup", "compression"],
        totalProjects: 1,
        totalEarned: 8500,
      },
      {
        userId,
        name: "Tyrell Corporation",
        email: "replicant@tyrell.co",
        company: "Tyrell Corp",
        status: "inactive",
        tags: ["ai", "robotics"],
        totalProjects: 1,
        totalEarned: 12000,
      },
    ];

    const insertedClients = await Client.insertMany(seedClients);

    const clientMap = {
      acme: insertedClients[0]._id,
      stark: insertedClients[1]._id,
      wayne: insertedClients[2]._id,
      pied: insertedClients[3]._id,
      tyrell: insertedClients[4]._id,
    };

    // 3. Seed Proposals (Normalized, reference client id, no clientName duplicates)
    const seedProposals = [
      {
        userId,
        title: "Enterprise Brand Redesign",
        clientId: clientMap.acme,
        status: "won",
        value: 15000,
        currency: "USD",
        createdAt: subMonths(8),
      },
      {
        userId,
        title: "AI Interface Prototyping",
        clientId: clientMap.stark,
        status: "won",
        value: 30000,
        currency: "USD",
        createdAt: subMonths(6),
      },
      {
        userId,
        title: "Financial Dashboard Design System",
        clientId: clientMap.wayne,
        status: "won",
        value: 20000,
        currency: "USD",
        createdAt: subMonths(4),
      },
      {
        userId,
        title: "Decentralized Video Platform UI",
        clientId: clientMap.pied,
        status: "won",
        value: 12000,
        currency: "USD",
        createdAt: subMonths(2),
      },
      {
        userId,
        title: "Replicant UI Simulation System",
        clientId: clientMap.tyrell,
        status: "won",
        value: 12000,
        currency: "USD",
        createdAt: subMonths(5),
      },
      // Sent & Lost & Draft Proposals
      {
        userId,
        title: "SaaS Marketing Website Design",
        clientId: clientMap.acme,
        status: "sent",
        value: 8000,
        currency: "USD",
        createdAt: subMonths(1),
      },
      {
        userId,
        title: "Smart Armor Diagnostics Dashboard",
        clientId: clientMap.stark,
        status: "sent",
        value: 50000,
        currency: "USD",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        userId,
        title: "Batcomputer Analytics Interface",
        clientId: clientMap.wayne,
        status: "lost",
        value: 45000,
        currency: "USD",
        createdAt: subMonths(3),
      },
      {
        userId,
        title: "Middle-Out Protocol Integration Consultancy",
        clientId: clientMap.pied,
        status: "lost",
        value: 18000,
        currency: "USD",
        createdAt: subMonths(3),
      },
      {
        userId,
        title: "Nexus-9 Lifecycle Monitor",
        clientId: clientMap.tyrell,
        status: "draft",
        value: 25000,
        currency: "USD",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      },
    ];

    await Proposal.insertMany(seedProposals);

    // 4. Seed Projects (budget, paid, status: draft, active, in_review, completed, on_hold, cancelled)
    const seedProjects = [
      {
        userId,
        title: "Acme Web Portal Development",
        description: "Rebuilding the core customer portal with Next.js.",
        clientId: clientMap.acme.toString(),
        clientName: insertedClients[0].name, // Keep existing field compatibility
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
      {
        userId,
        title: "Acme Brand Strategy Design",
        description: "Modernizing Acme branding guidelines.",
        clientId: clientMap.acme.toString(),
        clientName: insertedClients[0].name,
        category: "design",
        status: "active",
        priority: "medium",
        budget: 9000,
        currency: "USD",
        paid: 6000,
        progress: 65,
        startDate: subMonths(2).toISOString().split("T")[0],
        dueDate: subMonths(-1).toISOString().split("T")[0], // Future due date
        createdAt: subMonths(2),
      },
      {
        userId,
        title: "Stark AI Interface R&D",
        description: "Creating prototypes for next-generation holographic HUDs.",
        clientId: clientMap.stark.toString(),
        clientName: insertedClients[1].name,
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
      {
        userId,
        title: "Stark Diagnostics Tool",
        description: "Analytical app for armor subsystem monitoring.",
        clientId: clientMap.stark.toString(),
        clientName: insertedClients[1].name,
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
      {
        userId,
        title: "Wayne Corporate Dashboard UI",
        description: "Redesigning Wayne Enterprises internal investment analytics interface.",
        clientId: clientMap.wayne.toString(),
        clientName: insertedClients[2].name,
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
      {
        userId,
        title: "Wayne Crypto Platform Advisory",
        description: "Security assessment and UI design patterns for Wayne FinTech.",
        clientId: clientMap.wayne.toString(),
        clientName: insertedClients[2].name,
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
      {
        userId,
        title: "Pied Piper Platform Revamp",
        description: "Modernizing the Web UI of the decentralized cloud client.",
        clientId: clientMap.pied.toString(),
        clientName: insertedClients[3].name,
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
      {
        userId,
        title: "Tyrell Replicant Simulator",
        description: "Consulting on the UI for biometric responses.",
        clientId: clientMap.tyrell.toString(),
        clientName: insertedClients[4].name,
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
    ];

    const insertedProjects = await Project.insertMany(seedProjects);

    const projectMap = {
      acmeWeb: insertedProjects[0]._id,
      acmeBrand: insertedProjects[1]._id,
      starkAI: insertedProjects[2]._id,
      starkDiag: insertedProjects[3]._id,
      wayneDash: insertedProjects[4]._id,
      wayneCrypto: insertedProjects[5]._id,
      piedPiper: insertedProjects[6]._id,
      tyrellSim: insertedProjects[7]._id,
    };

    // 5. Seed Invoices (status: draft, sent, partially_paid, paid, overdue, cancelled)
    const seedInvoices = [
      // Acme Web Portal Invoices (Fully Paid)
      {
        userId,
        invoiceNumber: "INV-2026-001",
        clientId: clientMap.acme,
        projectId: projectMap.acmeWeb,
        status: "paid",
        issueDate: subMonths(8),
        dueDate: subMonths(7),
        items: [{ description: "Initial Portal Setup & Design Handoff", quantity: 1, rate: 5000, amount: 5000 }],
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
        updatedAt: subMonths(7.5), // Paid 15 days later
      },
      {
        userId,
        invoiceNumber: "INV-2026-002",
        clientId: clientMap.acme,
        projectId: projectMap.acmeWeb,
        status: "paid",
        issueDate: subMonths(7),
        dueDate: subMonths(6),
        items: [{ description: "Next.js Integration and CMS setup", quantity: 1, rate: 10000, amount: 10000 }],
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
        updatedAt: subMonths(6.8), // Paid 6 days later
      },
      // Acme Brand Strategy (Partially Paid)
      {
        userId,
        invoiceNumber: "INV-2026-003",
        clientId: clientMap.acme,
        projectId: projectMap.acmeBrand,
        status: "partially_paid",
        issueDate: subMonths(2),
        dueDate: subMonths(1),
        items: [{ description: "Brand Strategy Deliverable Phase 1", quantity: 1, rate: 9000, amount: 9000 }],
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
      // Stark AI Interface (Fully Paid)
      {
        userId,
        invoiceNumber: "INV-2026-004",
        clientId: clientMap.stark,
        projectId: projectMap.starkAI,
        status: "paid",
        issueDate: subMonths(6),
        dueDate: subMonths(5),
        items: [{ description: "Holographic UX Consulting Fee", quantity: 1, rate: 30000, amount: 30000 }],
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
        updatedAt: subMonths(5.9), // Paid 3 days later
      },
      // Stark Diagnostics Tool (Sent - Unpaid, Future Due)
      {
        userId,
        invoiceNumber: "INV-2026-005",
        clientId: clientMap.stark,
        projectId: projectMap.starkDiag,
        status: "sent",
        issueDate: subMonths(1),
        dueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // Due in 15 days
        items: [{ description: "Milestone 1 Core Development", quantity: 1, rate: 5000, amount: 5000 }],
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
      // Wayne Corporate Dashboard (Fully Paid)
      {
        userId,
        invoiceNumber: "INV-2026-006",
        clientId: clientMap.wayne,
        projectId: projectMap.wayneDash,
        status: "paid",
        issueDate: subMonths(4),
        dueDate: subMonths(3),
        items: [{ description: "Wayne Investment UI Mockups & Assets", quantity: 1, rate: 18000, amount: 18000 }],
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
        updatedAt: subMonths(3.9), // Paid 3 days later
      },
      // Wayne Crypto Platform Advisory (Overdue Invoice)
      {
        userId,
        invoiceNumber: "INV-2026-007",
        clientId: clientMap.wayne,
        projectId: projectMap.wayneCrypto,
        status: "overdue",
        issueDate: subMonths(3),
        dueDate: subMonths(2), // 2 months ago, overdue!
        items: [{ description: "FinTech Security Architecture Advisory", quantity: 1, rate: 10000, amount: 10000 }],
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
      // Pied Piper Revamp (Sent - Due soon)
      {
        userId,
        invoiceNumber: "INV-2026-008",
        clientId: clientMap.pied,
        projectId: projectMap.piedPiper,
        status: "sent",
        issueDate: subMonths(1),
        dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // Due in 4 days
        items: [{ description: "Phase 1 UX Research and Wireframing", quantity: 1, rate: 4000, amount: 4000 }],
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
      // Tyrell Replicant Simulator (Fully Paid)
      {
        userId,
        invoiceNumber: "INV-2026-009",
        clientId: clientMap.tyrell,
        projectId: projectMap.tyrellSim,
        status: "paid",
        issueDate: subMonths(5),
        dueDate: subMonths(4),
        items: [{ description: "Simulation HUD UX Consulting & Setup", quantity: 1, rate: 12000, amount: 12000 }],
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
        updatedAt: subMonths(4.7), // Paid 9 days later
      },
      // Draft Invoice
      {
        userId,
        invoiceNumber: "INV-2026-010",
        clientId: clientMap.acme,
        status: "draft",
        issueDate: new Date(),
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        items: [{ description: "Monthly maintenance retainer", quantity: 1, rate: 2500, amount: 2500 }],
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
      // Cancelled Invoice
      {
        userId,
        invoiceNumber: "INV-2026-011",
        clientId: clientMap.pied,
        status: "cancelled",
        issueDate: subMonths(3),
        dueDate: subMonths(2),
        items: [{ description: "Draft scoping exploration fee", quantity: 1, rate: 3000, amount: 3000 }],
        subtotal: 3000,
        discount: 0,
        discountAmount: 0,
        taxableAmount: 3000,
        taxRate: 10,
        taxAmount: 300,
        total: 3300,
        amountPaid: 0,
        remainingAmount: 3300,
        currency: "USD",
        createdAt: subMonths(3),
        updatedAt: subMonths(2.9),
      },
    ];

    await Invoice.insertMany(seedInvoices);

    // 6. Seed Activities
    const seedActivities = [
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
        description: "AI-powered proposal generated for ' Batcomputer Analytics Interface '.",
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
    ];

    await Activity.insertMany(seedActivities);

    return NextResponse.json({ success: true, message: "Demo workspace generated successfully!" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to seed demo data";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
