import { prisma } from "@/lib/prisma";
import type { ProposalStatus, FreelancePlatform } from "@prisma/client";

export class ProposalsService {
  static async getProposalsByUserId(userId: string) {
    const proposals = await prisma.proposal.findMany({
      where: { userId },
      include: { client: true },
      orderBy: { createdAt: "desc" },
    });

    return proposals.map((p) => ({
      ...p,
      _id: p.id,
      clientId: p.client ? { ...p.client, _id: p.client.id } : p.clientId,
    }));
  }

  static async getProposalById(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;

    const proposal = await prisma.proposal.findFirst({
      where,
      include: { client: true },
    });

    if (!proposal) return null;

    return {
      ...proposal,
      _id: proposal.id,
      clientId: proposal.client ? { ...proposal.client, _id: proposal.client.id } : proposal.clientId,
    };
  }

  static async createProposal(userId: string, data: any) {
    const ws = await prisma.workspace.findFirst({ where: { ownerId: userId } });
    const budgetVal = Number(data.budget || data.value) || 0;

    const proposal = await prisma.proposal.create({
      data: {
        userId,
        workspaceId: ws?.id,
        clientId: data.clientId || null,
        clientName: data.clientName || "",
        title: data.title || "Proposal",
        status: (data.status as ProposalStatus) || "draft",
        value: budgetVal,
        currency: data.currency || "USD",
        isFavorite: !!data.isFavorite,
        platform: (data.platform as FreelancePlatform) || "Direct",
        jobPost: data.jobPost || "",
        portfolios: data.portfolios || [],
        budget: budgetVal,
        timeline: data.timeline || "",
        tone: data.tone || "",
        templateId: data.templateId || null,
        activeVersionIndex: Number(data.activeVersionIndex) || 0,
        versions: data.versions || [],
        intelligence: data.intelligence || null,
        intelligenceHistory: data.intelligenceHistory || null,
        proposalMemory: data.proposalMemory || null,
      },
      include: { client: true },
    });

    return {
      ...proposal,
      _id: proposal.id,
    };
  }

  static async updateProposal(id: string, userId: string, data: any) {
    const budgetVal = data.budget !== undefined ? Number(data.budget) : data.value !== undefined ? Number(data.value) : undefined;

    const updated = await prisma.proposal.updateMany({
      where: { id, userId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.clientId !== undefined && { clientId: data.clientId }),
        ...(data.clientName !== undefined && { clientName: data.clientName }),
        ...(data.status && { status: data.status }),
        ...(budgetVal !== undefined && { value: budgetVal, budget: budgetVal }),
        ...(data.currency && { currency: data.currency }),
        ...(data.isFavorite !== undefined && { isFavorite: !!data.isFavorite }),
        ...(data.platform && { platform: data.platform }),
        ...(data.jobPost !== undefined && { jobPost: data.jobPost }),
        ...(data.portfolios && { portfolios: data.portfolios }),
        ...(data.timeline !== undefined && { timeline: data.timeline }),
        ...(data.tone !== undefined && { tone: data.tone }),
        ...(data.templateId !== undefined && { templateId: data.templateId }),
        ...(data.activeVersionIndex !== undefined && { activeVersionIndex: Number(data.activeVersionIndex) }),
        ...(data.versions && { versions: data.versions }),
        ...(data.intelligence !== undefined && { intelligence: data.intelligence }),
        ...(data.intelligenceHistory !== undefined && { intelligenceHistory: data.intelligenceHistory }),
        ...(data.proposalMemory !== undefined && { proposalMemory: data.proposalMemory }),
      },
    });

    if (updated.count === 0) return null;
    return this.getProposalById(id, userId);
  }

  static async deleteProposal(id: string, userId: string) {
    const result = await prisma.proposal.deleteMany({
      where: { id, userId },
    });
    return result.count > 0;
  }
}
