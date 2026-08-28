import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Client, { IClient } from "@/models/Client";
import Project, { IProject } from "@/models/Project";
import Deliverable, { IDeliverable } from "@/models/Deliverable";
import Invoice, { IInvoice } from "@/models/Invoice";
import Proposal, { IProposal } from "@/models/Proposal";
import ProjectFile, { IProjectFile } from "@/models/ProjectFile";
import User, { IUser } from "@/models/User";
import mongoose from "mongoose";

export interface ClientAuthContext {
  userId: string;
  role: "client" | "freelancer";
  client: IClient;
  clientId: string;
  isPreview: boolean;
  freelancerUser?: IUser | null;
}

/**
 * Derives and verifies the client identity from the authenticated session.
 * Supports verified freelancer preview mode. If a freelancer accesses the portal
 * without a specific previewClientId, it defaults to their active/first client.
 */
export async function getClientSession(
  previewClientId?: string | null
): Promise<ClientAuthContext | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  await connectDB();

  const user = await User.findById(session.user.id);
  if (!user) {
    return null;
  }

  // 1. Genuine Client Account
  if (user.role === "client") {
    let client: IClient | null = null;
    if (user.clientId) {
      client = await Client.findById(user.clientId);
    }
    if (!client && user.email) {
      client = await Client.findOne({ email: user.email.toLowerCase().trim() });
    }

    if (!client) {
      return null;
    }

    const freelancerUser = await User.findById(client.userId);

    return {
      userId: user._id.toString(),
      role: "client",
      client,
      clientId: client._id.toString(),
      isPreview: false,
      freelancerUser,
    };
  }

  // 2. Freelancer viewing Client Portal (Preview mode)
  if (user.role === "freelancer" || !user.role) {
    let client: IClient | null = null;

    if (previewClientId && mongoose.Types.ObjectId.isValid(previewClientId)) {
      client = await Client.findOne({
        _id: previewClientId,
        userId: user._id.toString(),
      });
    }

    // If no previewClientId or not found, fallback to the freelancer's most recent client
    if (!client) {
      client = await Client.findOne({ userId: user._id.toString() }).sort({ createdAt: -1 });
    }

    // If freelancer doesn't have any client yet, create a default preview client profile
    if (!client) {
      client = await Client.create({
        userId: user._id.toString(),
        name: `${user.name || "Client"} (Preview)`,
        email: user.email || "client-preview@freeai.app",
        company: "Preview Organization",
        status: "active",
      });
    }

    return {
      userId: user._id.toString(),
      role: "freelancer",
      client,
      clientId: client._id.toString(),
      isPreview: true,
      freelancerUser: user,
    };
  }

  return null;
}

/**
 * Requires client access or throws an Error with a status property.
 */
export async function requireClient(previewClientId?: string | null): Promise<ClientAuthContext> {
  const authCtx = await getClientSession(previewClientId);
  if (!authCtx) {
    const error: any = new Error("Unauthorized or invalid client access");
    error.status = 401;
    throw error;
  }
  return authCtx;
}

/**
 * Verifies that a project belongs to the authenticated client or freelancer preview.
 */
export async function requireClientProject(
  clientId: string,
  projectId: string,
  authCtx?: ClientAuthContext
): Promise<IProject> {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    const error: any = new Error("Invalid project ID");
    error.status = 400;
    throw error;
  }

  const queryConditions: any[] = [
    { clientId: clientId },
    { clientId: new mongoose.Types.ObjectId(clientId) },
  ];

  if (authCtx?.client?.name) {
    queryConditions.push({ clientName: authCtx.client.name });
  }

  if (authCtx?.role === "freelancer" && authCtx.userId) {
    queryConditions.push({ userId: authCtx.userId });
  }

  const project = await Project.findOne({
    _id: projectId,
    $or: queryConditions,
  });

  if (!project) {
    // If not found, also check if project exists by _id for this freelancer's workspace
    if (authCtx?.userId) {
      const fallbackProject = await Project.findOne({
        _id: projectId,
        userId: authCtx.userId,
      });
      if (fallbackProject) return fallbackProject;
    }

    const error: any = new Error("Project not found or access denied");
    error.status = 404;
    throw error;
  }

  return project;
}

/**
 * Verifies that a deliverable belongs to the authenticated client's projects.
 */
export async function requireClientDeliverable(
  clientId: string,
  deliverableId: string,
  authCtx?: ClientAuthContext
): Promise<IDeliverable> {
  if (!mongoose.Types.ObjectId.isValid(deliverableId)) {
    const error: any = new Error("Invalid deliverable ID");
    error.status = 400;
    throw error;
  }

  const queryConditions: any[] = [
    { clientId: clientId },
  ];

  if (authCtx?.role === "freelancer" && authCtx.userId) {
    queryConditions.push({ userId: authCtx.userId });
  }

  const deliverable = await Deliverable.findOne({
    _id: deliverableId,
    $or: queryConditions,
  });

  if (!deliverable) {
    const error: any = new Error("Deliverable not found or access denied");
    error.status = 404;
    throw error;
  }

  return deliverable;
}

/**
 * Verifies that an invoice belongs to the authenticated client.
 */
export async function requireClientInvoice(
  clientId: string,
  invoiceId: string,
  authCtx?: ClientAuthContext
): Promise<IInvoice> {
  if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
    const error: any = new Error("Invalid invoice ID");
    error.status = 400;
    throw error;
  }

  const queryConditions: any[] = [
    { clientId: clientId },
  ];

  if (authCtx?.client?.email) {
    queryConditions.push({ clientEmail: authCtx.client.email.toLowerCase().trim() });
  }

  if (authCtx?.role === "freelancer" && authCtx.userId) {
    queryConditions.push({ userId: authCtx.userId });
  }

  const invoice = await Invoice.findOne({
    _id: invoiceId,
    $or: queryConditions,
  });

  if (!invoice) {
    const error: any = new Error("Invoice not found or access denied");
    error.status = 404;
    throw error;
  }

  return invoice;
}

/**
 * Verifies that a proposal belongs to the authenticated client.
 */
export async function requireClientProposal(
  clientEmail: string,
  clientId: string,
  proposalId: string,
  authCtx?: ClientAuthContext
): Promise<IProposal> {
  if (!mongoose.Types.ObjectId.isValid(proposalId)) {
    const error: any = new Error("Invalid proposal ID");
    error.status = 400;
    throw error;
  }

  const queryConditions: any[] = [
    { clientEmail: clientEmail.toLowerCase().trim() },
    { clientId: clientId },
  ];

  if (authCtx?.role === "freelancer" && authCtx.userId) {
    queryConditions.push({ userId: authCtx.userId });
  }

  const proposal = await Proposal.findOne({
    _id: proposalId,
    $or: queryConditions,
  });

  if (!proposal) {
    const error: any = new Error("Proposal not found or access denied");
    error.status = 404;
    throw error;
  }

  return proposal;
}

/**
 * Verifies that a file belongs to the authenticated client and is visible.
 */
export async function requireClientFile(
  clientId: string,
  fileId: string,
  authCtx?: ClientAuthContext
): Promise<IProjectFile> {
  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    const error: any = new Error("Invalid file ID");
    error.status = 400;
    throw error;
  }

  const queryConditions: any[] = [
    { clientId: clientId },
  ];

  if (authCtx?.role === "freelancer" && authCtx.userId) {
    queryConditions.push({ userId: authCtx.userId });
  }

  const file = await ProjectFile.findOne({
    _id: fileId,
    $or: queryConditions,
    isClientVisible: true,
  });

  if (!file) {
    const error: any = new Error("File not found or access denied");
    error.status = 404;
    throw error;
  }

  return file;
}
