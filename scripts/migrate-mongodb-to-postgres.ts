import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole, ClientStatus, ProjectStatus, ProjectPriority, ProjectCategory, InvoiceStatus, DeliverableStatus, ProposalStatus, FreelancePlatform, InvitationStatus, FileCategory, ActivityType, NotificationType } from "@prisma/client";

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runMigration() {
  console.log("\n=======================================================");
  console.log("   FREELAI: MONGODB -> POSTGRESQL DATA MIGRATION");
  console.log("=======================================================\n");

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined in .env.local");
  }

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  if (!db) throw new Error("Could not get MongoDB database reference");
  console.log("✓ Connected to MongoDB Atlas.\n");

  const report = {
    workspaces: 0,
    users: 0,
    clients: 0,
    projects: 0,
    invoices: 0,
    proposals: 0,
    deliverables: 0,
    messages: 0,
    notifications: 0,
    activities: 0,
    invitations: 0,
    profiles: 0,
    files: 0,
    portfolioProjects: 0,
  };

  try {
    // 1. MIGRATE USERS (Initial pass without clientId to avoid circular FK)
    console.log("--> Migrating Users (Pass 1)...");
    const mongoUsers = await db.collection("users").find({}).toArray();
    for (const u of mongoUsers) {
      const id = u._id.toString();
      const email = u.email.toLowerCase().trim();
      const role = u.role === "client" ? UserRole.client : UserRole.freelancer;

      await prisma.user.upsert({
        where: { email },
        update: {
          name: u.name || "User",
          image: u.image || null,
          password: u.password || null,
          role,
          clientId: null,
          onboardingCompleted: !!u.onboardingCompleted,
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
        },
        create: {
          id,
          name: u.name || "User",
          email,
          image: u.image || null,
          password: u.password || null,
          role,
          clientId: null,
          onboardingCompleted: !!u.onboardingCompleted,
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
        },
      });
      report.users++;

      // Create default Workspace for freelancer users
      if (role === UserRole.freelancer) {
        const existingWs = await prisma.workspace.findFirst({ where: { ownerId: id } });
        if (!existingWs) {
          const slug = `ws-${id.slice(-8)}`;
          await prisma.workspace.create({
            data: {
              name: `${u.name || "My"}'s Workspace`,
              slug,
              ownerId: id,
            },
          });
          report.workspaces++;
        }
      }
    }
    console.log(`✓ Users migrated: ${report.users}, Workspaces ensured.`);

    // Helper to get workspaceId for a user
    const getWorkspaceId = async (userId: string) => {
      const ws = await prisma.workspace.findFirst({ where: { ownerId: userId } });
      return ws ? ws.id : null;
    };

    // 2. MIGRATE CLIENTS
    console.log("--> Migrating Clients...");
    const mongoClients = await db.collection("clients").find({}).toArray();
    for (const c of mongoClients) {
      const id = c._id.toString();
      const userId = c.userId?.toString();

      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        console.warn(`[Skip Client] Freelancer user ${userId} not found for client ${c.name}`);
        continue;
      }

      const workspaceId = await getWorkspaceId(userId);
      const validStatuses: ClientStatus[] = ["active", "inactive", "prospect", "archived"];
      const status = validStatuses.includes(c.status) ? (c.status as ClientStatus) : ClientStatus.active;

      await prisma.client.upsert({
        where: { id },
        update: {
          userId,
          workspaceId,
          name: c.name || "Client",
          email: c.email || "",
          phone: c.phone || "",
          company: c.company || "",
          website: c.website || "",
          location: c.location || "",
          avatar: c.avatar || null,
          status,
          tags: Array.isArray(c.tags) ? c.tags : [],
          notes: c.notes || "",
          totalProjects: Number(c.totalProjects) || 0,
          totalEarned: Number(c.totalEarned) || 0,
          rating: typeof c.rating === "number" ? c.rating : null,
          createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        },
        create: {
          id,
          userId,
          workspaceId,
          name: c.name || "Client",
          email: c.email || "",
          phone: c.phone || "",
          company: c.company || "",
          website: c.website || "",
          location: c.location || "",
          avatar: c.avatar || null,
          status,
          tags: Array.isArray(c.tags) ? c.tags : [],
          notes: c.notes || "",
          totalProjects: Number(c.totalProjects) || 0,
          totalEarned: Number(c.totalEarned) || 0,
          rating: typeof c.rating === "number" ? c.rating : null,
          createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        },
      });
      report.clients++;
    }
    console.log(`✓ Clients migrated: ${report.clients}`);

    // Link client users back to their client record
    console.log("--> Linking Client User Accounts (Pass 2)...");
    for (const u of mongoUsers) {
      if (u.role === "client" && u.clientId) {
        const clientIdStr = u.clientId.toString();
        const clientExists = await prisma.client.findUnique({ where: { id: clientIdStr } });
        if (clientExists) {
          await prisma.user.update({
            where: { email: u.email.toLowerCase().trim() },
            data: { clientId: clientIdStr },
          });
        }
      }
    }
    console.log("✓ Linked client user accounts.");

    // 3. MIGRATE PROJECTS
    console.log("--> Migrating Projects & Milestones...");
    const mongoProjects = await db.collection("projects").find({}).toArray();
    for (const p of mongoProjects) {
      const id = p._id.toString();
      const userId = p.userId?.toString();

      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) continue;

      const workspaceId = await getWorkspaceId(userId);

      let clientId = p.clientId?.toString() || null;
      if (clientId) {
        const clientExists = await prisma.client.findUnique({ where: { id: clientId } });
        if (!clientExists) clientId = null;
      }

      const validStatuses: ProjectStatus[] = ["draft", "active", "in_review", "completed", "on_hold", "cancelled"];
      const status = validStatuses.includes(p.status) ? (p.status as ProjectStatus) : ProjectStatus.draft;

      const validPriorities: ProjectPriority[] = ["low", "medium", "high", "urgent"];
      const priority = validPriorities.includes(p.priority) ? (p.priority as ProjectPriority) : ProjectPriority.medium;

      const validCategories: ProjectCategory[] = ["design", "development", "illustration", "video", "writing", "marketing", "consulting", "other"];
      const category = validCategories.includes(p.category) ? (p.category as ProjectCategory) : ProjectCategory.design;

      await prisma.project.upsert({
        where: { id },
        update: {
          userId,
          workspaceId,
          clientId,
          clientName: p.clientName || "",
          title: p.title || "Project",
          description: p.description || "",
          category,
          status,
          priority,
          budget: Number(p.budget) || 0,
          currency: p.currency || "USD",
          paid: Number(p.paid) || 0,
          progress: Number(p.progress) || 0,
          startDate: p.startDate || "",
          dueDate: p.dueDate || "",
          tags: Array.isArray(p.tags) ? p.tags : [],
          notes: p.notes || "",
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        },
        create: {
          id,
          userId,
          workspaceId,
          clientId,
          clientName: p.clientName || "",
          title: p.title || "Project",
          description: p.description || "",
          category,
          status,
          priority,
          budget: Number(p.budget) || 0,
          currency: p.currency || "USD",
          paid: Number(p.paid) || 0,
          progress: Number(p.progress) || 0,
          startDate: p.startDate || "",
          dueDate: p.dueDate || "",
          tags: Array.isArray(p.tags) ? p.tags : [],
          notes: p.notes || "",
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        },
      });
      report.projects++;

      // Migrate Milestones
      if (Array.isArray(p.milestones)) {
        for (const m of p.milestones) {
          const mId = m.id || `${id}-${Date.now()}`;
          await prisma.milestone.upsert({
            where: { id: mId },
            update: {
              title: m.title || "Milestone",
              dueDate: m.dueDate || "",
              completed: !!m.completed,
            },
            create: {
              id: mId,
              projectId: id,
              title: m.title || "Milestone",
              dueDate: m.dueDate || "",
              completed: !!m.completed,
            },
          });
        }
      }
    }
    console.log(`✓ Projects migrated: ${report.projects}`);

    // 4. MIGRATE INVOICES
    console.log("--> Migrating Invoices...");
    const mongoInvoices = await db.collection("invoices").find({}).toArray();
    for (const inv of mongoInvoices) {
      const id = inv._id.toString();
      const userId = inv.userId?.toString();
      const clientId = inv.clientId?.toString();

      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      const clientExists = clientId ? await prisma.client.findUnique({ where: { id: clientId } }) : null;
      if (!userExists || !clientExists) continue;

      const workspaceId = await getWorkspaceId(userId);

      let projectId = inv.projectId?.toString() || null;
      if (projectId) {
        const projExists = await prisma.project.findUnique({ where: { id: projectId } });
        if (!projExists) projectId = null;
      }

      const validStatuses: InvoiceStatus[] = ["draft", "sent", "partially_paid", "paid", "overdue", "cancelled"];
      const status = validStatuses.includes(inv.status) ? (inv.status as InvoiceStatus) : InvoiceStatus.draft;

      await prisma.invoice.upsert({
        where: { id },
        update: {
          userId,
          workspaceId,
          clientId: clientId!,
          projectId,
          invoiceNumber: inv.invoiceNumber || `INV-${id.slice(-6)}`,
          status,
          issueDate: inv.issueDate ? new Date(inv.issueDate) : new Date(),
          dueDate: inv.dueDate ? new Date(inv.dueDate) : new Date(),
          subtotal: Number(inv.subtotal) || 0,
          discount: Number(inv.discount) || 0,
          discountAmount: Number(inv.discountAmount) || 0,
          taxableAmount: Number(inv.taxableAmount) || 0,
          taxRate: Number(inv.taxRate) || 0,
          taxAmount: Number(inv.taxAmount) || 0,
          total: Number(inv.total) || 0,
          amountPaid: Number(inv.amountPaid) || 0,
          remainingAmount: Number(inv.remainingAmount) || 0,
          currency: inv.currency || "INR",
          notes: inv.notes || "",
          paymentTerms: inv.paymentTerms || "",
          createdAt: inv.createdAt ? new Date(inv.createdAt) : new Date(),
        },
        create: {
          id,
          userId,
          workspaceId,
          clientId: clientId!,
          projectId,
          invoiceNumber: inv.invoiceNumber || `INV-${id.slice(-6)}`,
          status,
          issueDate: inv.issueDate ? new Date(inv.issueDate) : new Date(),
          dueDate: inv.dueDate ? new Date(inv.dueDate) : new Date(),
          subtotal: Number(inv.subtotal) || 0,
          discount: Number(inv.discount) || 0,
          discountAmount: Number(inv.discountAmount) || 0,
          taxableAmount: Number(inv.taxableAmount) || 0,
          taxRate: Number(inv.taxRate) || 0,
          taxAmount: Number(inv.taxAmount) || 0,
          total: Number(inv.total) || 0,
          amountPaid: Number(inv.amountPaid) || 0,
          remainingAmount: Number(inv.remainingAmount) || 0,
          currency: inv.currency || "INR",
          notes: inv.notes || "",
          paymentTerms: inv.paymentTerms || "",
          createdAt: inv.createdAt ? new Date(inv.createdAt) : new Date(),
        },
      });
      report.invoices++;

      // Migrate Invoice Items
      if (Array.isArray(inv.items)) {
        await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
        for (let i = 0; i < inv.items.length; i++) {
          const item = inv.items[i];
          await prisma.invoiceItem.create({
            data: {
              id: `${id}-item-${i + 1}`,
              invoiceId: id,
              description: item.description || "Service",
              quantity: Number(item.quantity) || 1,
              rate: Number(item.rate) || 0,
              amount: Number(item.amount) || 0,
            },
          });
        }
      }
    }
    console.log(`✓ Invoices migrated: ${report.invoices}`);

    // 5. MIGRATE DELIVERABLES
    console.log("--> Migrating Deliverables...");
    const mongoDeliverables = await db.collection("deliverables").find({}).toArray();
    for (const d of mongoDeliverables) {
      const id = d._id.toString();
      const userId = d.userId?.toString();
      const projectId = d.projectId?.toString();
      const clientId = d.clientId?.toString();

      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      const projExists = await prisma.project.findUnique({ where: { id: projectId } });
      const clientExists = await prisma.client.findUnique({ where: { id: clientId } });
      if (!userExists || !projExists || !clientExists) continue;

      const workspaceId = await getWorkspaceId(userId);
      const validStatuses: DeliverableStatus[] = ["draft", "pending_review", "changes_requested", "approved"];
      const status = validStatuses.includes(d.status) ? (d.status as DeliverableStatus) : DeliverableStatus.pending_review;

      await prisma.deliverable.upsert({
        where: { id },
        update: {
          userId,
          workspaceId,
          projectId,
          clientId,
          milestoneId: d.milestoneId || null,
          title: d.title || "Deliverable",
          version: d.version || "v1",
          description: d.description || "",
          fileUrl: d.fileUrl || "",
          fileName: d.fileName || "",
          fileSize: d.fileSize || "",
          fileType: d.fileType || "",
          externalUrl: d.externalUrl || "",
          status,
          clientFeedback: d.clientFeedback || "",
          feedbackDate: d.feedbackDate ? new Date(d.feedbackDate) : null,
          approvedDate: d.approvedDate ? new Date(d.approvedDate) : null,
          uploadedBy: d.uploadedBy || "freelancer",
          createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
        },
        create: {
          id,
          userId,
          workspaceId,
          projectId,
          clientId,
          milestoneId: d.milestoneId || null,
          title: d.title || "Deliverable",
          version: d.version || "v1",
          description: d.description || "",
          fileUrl: d.fileUrl || "",
          fileName: d.fileName || "",
          fileSize: d.fileSize || "",
          fileType: d.fileType || "",
          externalUrl: d.externalUrl || "",
          status,
          clientFeedback: d.clientFeedback || "",
          feedbackDate: d.feedbackDate ? new Date(d.feedbackDate) : null,
          approvedDate: d.approvedDate ? new Date(d.approvedDate) : null,
          uploadedBy: d.uploadedBy || "freelancer",
          createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
        },
      });
      report.deliverables++;
    }
    console.log(`✓ Deliverables migrated: ${report.deliverables}`);

    // 6. MIGRATE PROPOSALS
    console.log("--> Migrating Proposals...");
    const mongoProposals = await db.collection("proposals").find({}).toArray();
    for (const prop of mongoProposals) {
      const id = prop._id.toString();
      const userId = prop.userId?.toString();
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) continue;

      const workspaceId = await getWorkspaceId(userId);

      let clientId = prop.clientId?.toString() || null;
      if (clientId) {
        const cExists = await prisma.client.findUnique({ where: { id: clientId } });
        if (!cExists) clientId = null;
      }

      const validStatuses: ProposalStatus[] = ["draft", "sent", "won", "lost"];
      const status = validStatuses.includes(prop.status) ? (prop.status as ProposalStatus) : ProposalStatus.draft;

      const validPlatforms: FreelancePlatform[] = ["Upwork", "Freelancer", "Fiverr", "LinkedIn", "Direct", "Other"];
      const platform = validPlatforms.includes(prop.platform) ? (prop.platform as FreelancePlatform) : FreelancePlatform.Direct;

      await prisma.proposal.upsert({
        where: { id },
        update: {
          userId,
          workspaceId,
          clientId,
          clientName: prop.clientName || "",
          title: prop.title || "Proposal",
          status,
          value: Number(prop.value || prop.budget) || 0,
          currency: prop.currency || "USD",
          isFavorite: !!prop.isFavorite,
          platform,
          jobPost: prop.jobPost || "",
          portfolios: Array.isArray(prop.portfolios) ? prop.portfolios : [],
          budget: Number(prop.budget) || 0,
          timeline: prop.timeline || "",
          tone: prop.tone || "",
          templateId: prop.templateId || null,
          activeVersionIndex: Number(prop.activeVersionIndex) || 0,
          versions: prop.versions || [],
          intelligence: prop.intelligence || null,
          intelligenceHistory: prop.intelligenceHistory || null,
          proposalMemory: prop.proposalMemory || null,
          createdAt: prop.createdAt ? new Date(prop.createdAt) : new Date(),
        },
        create: {
          id,
          userId,
          workspaceId,
          clientId,
          clientName: prop.clientName || "",
          title: prop.title || "Proposal",
          status,
          value: Number(prop.value || prop.budget) || 0,
          currency: prop.currency || "USD",
          isFavorite: !!prop.isFavorite,
          platform,
          jobPost: prop.jobPost || "",
          portfolios: Array.isArray(prop.portfolios) ? prop.portfolios : [],
          budget: Number(prop.budget) || 0,
          timeline: prop.timeline || "",
          tone: prop.tone || "",
          templateId: prop.templateId || null,
          activeVersionIndex: Number(prop.activeVersionIndex) || 0,
          versions: prop.versions || [],
          intelligence: prop.intelligence || null,
          intelligenceHistory: prop.intelligenceHistory || null,
          proposalMemory: prop.proposalMemory || null,
          createdAt: prop.createdAt ? new Date(prop.createdAt) : new Date(),
        },
      });
      report.proposals++;
    }
    console.log(`✓ Proposals migrated: ${report.proposals}`);

    // 7. MIGRATE MESSAGES
    console.log("--> Migrating Messages...");
    const mongoMessages = await db.collection("messages").find({}).toArray();
    for (const m of mongoMessages) {
      const id = m._id.toString();
      const clientId = m.clientId?.toString();
      const clientExists = await prisma.client.findUnique({ where: { id: clientId } });
      if (!clientExists) continue;

      let projectId = m.projectId?.toString() || null;
      if (projectId) {
        const pExists = await prisma.project.findUnique({ where: { id: projectId } });
        if (!pExists) projectId = null;
      }

      await prisma.message.upsert({
        where: { id },
        update: {
          clientId,
          projectId,
          userId: m.userId?.toString() || "",
          senderRole: m.senderRole || "client",
          senderId: m.senderId || "",
          senderName: m.senderName || "User",
          senderAvatar: m.senderAvatar || "",
          content: m.content || "",
          attachments: m.attachments || [],
          readByClient: !!m.readByClient,
          readByFreelancer: !!m.readByFreelancer,
          createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
        },
        create: {
          id,
          clientId,
          projectId,
          userId: m.userId?.toString() || "",
          senderRole: m.senderRole || "client",
          senderId: m.senderId || "",
          senderName: m.senderName || "User",
          senderAvatar: m.senderAvatar || "",
          content: m.content || "",
          attachments: m.attachments || [],
          readByClient: !!m.readByClient,
          readByFreelancer: !!m.readByFreelancer,
          createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
        },
      });
      report.messages++;
    }
    console.log(`✓ Messages migrated: ${report.messages}`);

    // 8. MIGRATE CLIENT INVITATIONS
    console.log("--> Migrating Client Invitations...");
    const mongoInvites = await db.collection("clientinvitations").find({}).toArray();
    for (const inv of mongoInvites) {
      const id = inv._id.toString();
      const clientId = inv.clientId?.toString();
      const clientExists = await prisma.client.findUnique({ where: { id: clientId } });
      if (!clientExists) continue;

      const validStatuses: InvitationStatus[] = ["pending", "accepted", "expired", "revoked"];
      const status = validStatuses.includes(inv.status) ? (inv.status as InvitationStatus) : InvitationStatus.pending;

      await prisma.clientInvitation.upsert({
        where: { token: inv.token },
        update: {
          freelancerId: inv.freelancerId?.toString() || "",
          clientId,
          email: inv.email || "",
          status,
          expiresAt: inv.expiresAt ? new Date(inv.expiresAt) : new Date(),
          acceptedAt: inv.acceptedAt ? new Date(inv.acceptedAt) : null,
          createdAt: inv.createdAt ? new Date(inv.createdAt) : new Date(),
        },
        create: {
          id,
          freelancerId: inv.freelancerId?.toString() || "",
          clientId,
          email: inv.email || "",
          token: inv.token,
          status,
          expiresAt: inv.expiresAt ? new Date(inv.expiresAt) : new Date(),
          acceptedAt: inv.acceptedAt ? new Date(inv.acceptedAt) : null,
          createdAt: inv.createdAt ? new Date(inv.createdAt) : new Date(),
        },
      });
      report.invitations++;
    }
    console.log(`✓ Client Invitations migrated: ${report.invitations}`);

    // 9. MIGRATE FREELANCER PROFILES
    console.log("--> Migrating Freelancer Profiles...");
    const mongoProfiles = await db.collection("freelancerprofiles").find({}).toArray();
    for (const prof of mongoProfiles) {
      const id = prof._id.toString();
      const userId = prof.userId?.toString();
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) continue;

      await prisma.freelancerProfile.upsert({
        where: { userId },
        update: {
          personal: prof.personal || prof.personalInfo || {},
          business: prof.business || prof.businessInfo || {},
          professional: prof.professional || prof.professionalInfo || {},
          pricing: prof.pricing || prof.pricingInfo || {},
          workPreferences: prof.workPreferences || {},
          aiPreferences: prof.aiPreferences || {},
          brandVoice: prof.brandVoice || {},
          aiNotes: prof.aiNotes || "",
          availability: prof.availability || "Available",
          socialLinks: prof.socialLinks || {},
          preferences: prof.preferences || {},
          profileCompleteness: Number(prof.profileCompleteness) || 0,
        },
        create: {
          id,
          userId,
          personal: prof.personal || prof.personalInfo || {},
          business: prof.business || prof.businessInfo || {},
          professional: prof.professional || prof.professionalInfo || {},
          pricing: prof.pricing || prof.pricingInfo || {},
          workPreferences: prof.workPreferences || {},
          aiPreferences: prof.aiPreferences || {},
          brandVoice: prof.brandVoice || {},
          aiNotes: prof.aiNotes || "",
          availability: prof.availability || "Available",
          socialLinks: prof.socialLinks || {},
          preferences: prof.preferences || {},
          profileCompleteness: Number(prof.profileCompleteness) || 0,
        },
      });
      report.profiles++;
    }
    console.log(`✓ Profiles migrated: ${report.profiles}`);

    // 10. MIGRATE PORTFOLIO PROJECTS
    console.log("--> Migrating Portfolio Projects...");
    const mongoPortfolio = await db.collection("portfolioprojects").find({}).toArray();
    for (const port of mongoPortfolio) {
      const id = port._id.toString();
      const userId = port.userId?.toString();
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) continue;

      await prisma.portfolioProject.upsert({
        where: { id },
        update: {
          userId,
          title: port.title || "Portfolio Project",
          description: port.description || "",
          skills: Array.isArray(port.skills) ? port.skills : [],
          link: port.link || "",
          createdAt: port.createdAt ? new Date(port.createdAt) : new Date(),
        },
        create: {
          id,
          userId,
          title: port.title || "Portfolio Project",
          description: port.description || "",
          skills: Array.isArray(port.skills) ? port.skills : [],
          link: port.link || "",
          createdAt: port.createdAt ? new Date(port.createdAt) : new Date(),
        },
      });
      report.portfolioProjects++;
    }
    console.log(`✓ Portfolio Projects migrated: ${report.portfolioProjects}`);

    // 11. MIGRATE ACTIVITIES
    console.log("--> Migrating Activities...");
    const mongoActivities = await db.collection("activities").find({}).toArray();
    for (const a of mongoActivities) {
      const id = a._id.toString();
      const userId = a.userId?.toString();
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) continue;

      let projectId = a.projectId?.toString() || null;
      if (projectId) {
        const pExists = await prisma.project.findUnique({ where: { id: projectId } });
        if (!pExists) projectId = null;
      }

      let clientId = a.clientId?.toString() || null;
      if (clientId) {
        const cExists = await prisma.client.findUnique({ where: { id: clientId } });
        if (!cExists) clientId = null;
      }

      let invoiceId = a.invoiceId?.toString() || null;
      if (invoiceId) {
        const iExists = await prisma.invoice.findUnique({ where: { id: invoiceId } });
        if (!iExists) invoiceId = null;
      }

      const validTypes: ActivityType[] = [
        "client_added", "proposal_generated", "invoice_created", "invoice_sent",
        "invoice_partially_paid", "invoice_paid", "invoice_overdue", "invoice_cancelled",
        "project_created", "project_updated", "antigravity_prompt", "deliverable_uploaded",
        "deliverable_approved", "changes_requested", "message_sent", "proposal_accepted",
        "client_invited", "client_joined", "milestone_completed", "file_uploaded"
      ];
      const type = validTypes.includes(a.type) ? (a.type as ActivityType) : ActivityType.project_created;

      await prisma.activity.upsert({
        where: { id },
        update: {
          userId,
          type,
          title: a.title || "Activity",
          description: a.description || "",
          projectId,
          clientId,
          invoiceId,
          actorRole: a.actorRole || "freelancer",
          createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
        },
        create: {
          id,
          userId,
          type,
          title: a.title || "Activity",
          description: a.description || "",
          projectId,
          clientId,
          invoiceId,
          actorRole: a.actorRole || "freelancer",
          createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
        },
      });
      report.activities++;
    }
    console.log(`✓ Activities migrated: ${report.activities}`);

    // 12. MIGRATE NOTIFICATIONS
    console.log("--> Migrating Notifications...");
    const mongoNotifs = await db.collection("notifications").find({}).toArray();
    for (const n of mongoNotifs) {
      const id = n._id.toString();
      const recipientId = n.recipientId?.toString() || "";
      if (!recipientId) continue;

      let projectId = n.projectId?.toString() || null;
      if (projectId) {
        const pExists = await prisma.project.findUnique({ where: { id: projectId } });
        if (!pExists) projectId = null;
      }

      let invoiceId = n.invoiceId?.toString() || null;
      if (invoiceId) {
        const iExists = await prisma.invoice.findUnique({ where: { id: invoiceId } });
        if (!iExists) invoiceId = null;
      }

      const validNotifTypes: NotificationType[] = [
        "deliverable_uploaded", "deliverable_approved", "changes_requested",
        "invoice_sent", "invoice_due", "invoice_overdue", "invoice_paid",
        "new_message", "proposal_received", "proposal_accepted",
        "milestone_completed", "client_invited", "client_joined", "general"
      ];
      const type = validNotifTypes.includes(n.type) ? (n.type as NotificationType) : NotificationType.general;

      await prisma.notification.upsert({
        where: { id },
        update: {
          recipientId,
          recipientRole: n.recipientRole || "freelancer",
          title: n.title || "Notification",
          message: n.message || "",
          type,
          link: n.link || "",
          read: !!n.read,
          projectId,
          invoiceId,
          createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
        },
        create: {
          id,
          recipientId,
          recipientRole: n.recipientRole || "freelancer",
          title: n.title || "Notification",
          message: n.message || "",
          type,
          link: n.link || "",
          read: !!n.read,
          projectId,
          invoiceId,
          createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
        },
      });
      report.notifications++;
    }
    console.log(`✓ Notifications migrated: ${report.notifications}`);

    // 13. MIGRATE PROJECT FILES
    console.log("--> Migrating Project Files...");
    const mongoFiles = await db.collection("projectfiles").find({}).toArray();
    for (const f of mongoFiles) {
      const id = f._id.toString();
      const userId = f.userId?.toString();
      const projectId = f.projectId?.toString();
      const clientId = f.clientId?.toString();

      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      const projExists = await prisma.project.findUnique({ where: { id: projectId } });
      const clientExists = await prisma.client.findUnique({ where: { id: clientId } });
      if (!userExists || !projExists || !clientExists) continue;

      const workspaceId = await getWorkspaceId(userId);
      const validCats: FileCategory[] = ["deliverable", "contract", "guidelines", "invoice", "asset", "other"];
      const category = validCats.includes(f.category) ? (f.category as FileCategory) : FileCategory.asset;

      await prisma.projectFile.upsert({
        where: { id },
        update: {
          userId,
          workspaceId,
          projectId,
          clientId,
          name: f.name || "File",
          url: f.url || "",
          size: f.size || "0 KB",
          fileType: f.fileType || "document",
          uploadedBy: f.uploadedBy || "freelancer",
          uploaderName: f.uploaderName || "",
          category,
          isClientVisible: typeof f.isClientVisible === "boolean" ? f.isClientVisible : true,
          createdAt: f.createdAt ? new Date(f.createdAt) : new Date(),
        },
        create: {
          id,
          userId,
          workspaceId,
          projectId,
          clientId,
          name: f.name || "File",
          url: f.url || "",
          size: f.size || "0 KB",
          fileType: f.fileType || "document",
          uploadedBy: f.uploadedBy || "freelancer",
          uploaderName: f.uploaderName || "",
          category,
          isClientVisible: typeof f.isClientVisible === "boolean" ? f.isClientVisible : true,
          createdAt: f.createdAt ? new Date(f.createdAt) : new Date(),
        },
      });
      report.files++;
    }
    console.log(`✓ Project Files migrated: ${report.files}`);

    console.log("\n=======================================================");
    console.log("   MIGRATION COMPLETED SUCCESSFULLY!");
    console.log("=======================================================");
    console.table(report);

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
    await pool.end();
  }
}

runMigration();
