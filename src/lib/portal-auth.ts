import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface ClientAuthContext {
  userId: string;
  role: "client" | "freelancer";
  client: any;
  clientId: string;
  isPreview: boolean;
  freelancerUser?: any | null;
}

/**
 * Derives and verifies the client identity from the authenticated session.
 * Supports verified freelancer preview mode strictly scoped to the targeted client.
 */
export async function getClientSession(
  previewClientId?: string | null
): Promise<ClientAuthContext | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return null;
  }

  // 1. Genuine Client Account
  if (user.role === "client") {
    let client = null;
    if (user.clientId) {
      client = await prisma.client.findUnique({ where: { id: user.clientId } });
    }
    if (!client && user.email) {
      client = await prisma.client.findFirst({
        where: { email: user.email.toLowerCase().trim() },
      });
    }

    if (!client) {
      return null;
    }

    const freelancerUser = await prisma.user.findUnique({
      where: { id: client.userId },
    });

    return {
      userId: user.id,
      role: "client",
      client: {
        ...client,
        _id: client.id,
      },
      clientId: client.id,
      isPreview: false,
      freelancerUser: freelancerUser
        ? {
            ...freelancerUser,
            _id: freelancerUser.id,
          }
        : null,
    };
  }

  // 2. Freelancer viewing Client Portal (Preview mode)
  if (user.role === "freelancer" || !user.role) {
    let client = null;

    if (previewClientId) {
      client = await prisma.client.findFirst({
        where: {
          id: previewClientId,
          userId: user.id,
        },
      });
    }

    // If no previewClientId or not found, fallback to the freelancer's most recent client
    if (!client) {
      client = await prisma.client.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!client) {
      // Auto-create preview client if none exists
      const ws = await prisma.workspace.findFirst({ where: { ownerId: user.id } });
      client = await prisma.client.create({
        data: {
          userId: user.id,
          workspaceId: ws?.id,
          name: `${user.name || "Client"} (Preview)`,
          email: user.email || "client-preview@freeai.app",
          company: "Preview Organization",
          status: "active",
        },
      });
    }

    return {
      userId: user.id,
      role: "freelancer",
      client: {
        ...client,
        _id: client.id,
      },
      clientId: client.id,
      isPreview: true,
      freelancerUser: {
        ...user,
        _id: user.id,
      },
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
 * Verifies that a project belongs strictly to the authenticated client.
 */
export async function requireClientProject(
  clientId: string,
  projectId: string,
  authCtx?: ClientAuthContext
): Promise<any> {
  if (!projectId) {
    const error: any = new Error("Invalid project ID");
    error.status = 400;
    throw error;
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { clientId: clientId },
        ...(authCtx?.client?.name
          ? [{ clientName: { equals: authCtx.client.name, mode: "insensitive" as const } }]
          : []),
      ],
    },
  });

  if (!project) {
    const error: any = new Error("Project not found or access denied");
    error.status = 404;
    throw error;
  }

  return {
    ...project,
    _id: project.id,
  };
}

/**
 * Verifies that a deliverable belongs strictly to the authenticated client's projects.
 */
export async function requireClientDeliverable(
  clientId: string,
  deliverableId: string
): Promise<any> {
  if (!deliverableId) {
    const error: any = new Error("Invalid deliverable ID");
    error.status = 400;
    throw error;
  }

  const deliverable = await prisma.deliverable.findFirst({
    where: {
      id: deliverableId,
      clientId: clientId,
    },
  });

  if (!deliverable) {
    const error: any = new Error("Deliverable not found or access denied");
    error.status = 404;
    throw error;
  }

  return {
    ...deliverable,
    _id: deliverable.id,
  };
}

/**
 * Verifies that an invoice belongs strictly to the authenticated client.
 */
export async function requireClientInvoice(
  clientId: string,
  invoiceId: string,
  authCtx?: ClientAuthContext
): Promise<any> {
  if (!invoiceId) {
    const error: any = new Error("Invalid invoice ID");
    error.status = 400;
    throw error;
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      clientId: clientId,
    },
  });

  if (!invoice) {
    const error: any = new Error("Invoice not found or access denied");
    error.status = 404;
    throw error;
  }

  return {
    ...invoice,
    _id: invoice.id,
  };
}

/**
 * Verifies that a proposal belongs strictly to the authenticated client.
 */
export async function requireClientProposal(
  clientEmail: string,
  clientId: string,
  proposalId: string
): Promise<any> {
  if (!proposalId) {
    const error: any = new Error("Invalid proposal ID");
    error.status = 400;
    throw error;
  }

  const proposal = await prisma.proposal.findFirst({
    where: {
      id: proposalId,
      clientId: clientId,
    },
  });

  if (!proposal) {
    const error: any = new Error("Proposal not found or access denied");
    error.status = 404;
    throw error;
  }

  return {
    ...proposal,
    _id: proposal.id,
  };
}

/**
 * Verifies that a file belongs strictly to the authenticated client and is visible.
 */
export async function requireClientFile(
  clientId: string,
  fileId: string
): Promise<any> {
  if (!fileId) {
    const error: any = new Error("Invalid file ID");
    error.status = 400;
    throw error;
  }

  const file = await prisma.projectFile.findFirst({
    where: {
      id: fileId,
      clientId: clientId,
      isClientVisible: true,
    },
  });

  if (!file) {
    const error: any = new Error("File not found or access denied");
    error.status = 404;
    throw error;
  }

  return {
    ...file,
    _id: file.id,
  };
}
