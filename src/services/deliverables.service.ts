import { prisma } from "@/lib/prisma";
import type { DeliverableStatus } from "@prisma/client";

export class DeliverablesService {
  static async getDeliverablesByProjectId(projectId: string) {
    const deliverables = await prisma.deliverable.findMany({
      where: { projectId },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return deliverables.map((d) => ({
      ...d,
      _id: d.id,
      versions: d.versions.map((v) => ({ ...v, _id: v.id })),
    }));
  }

  static async getDeliverablesByClientId(clientId: string) {
    const deliverables = await prisma.deliverable.findMany({
      where: { clientId },
      include: {
        project: true,
        versions: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return deliverables.map((d) => ({
      ...d,
      _id: d.id,
      projectName: d.project?.title,
      versions: d.versions.map((v) => ({ ...v, _id: v.id })),
    }));
  }

  static async createDeliverable(userId: string, data: {
    projectId: string;
    clientId: string;
    milestoneId?: string;
    title: string;
    version?: string;
    description?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: string;
    fileType?: string;
    externalUrl?: string;
    uploadedBy?: string;
  }) {
    const ws = await prisma.workspace.findFirst({ where: { ownerId: userId } });
    const versionNum = data.version || "v1";

    const deliverable = await prisma.deliverable.create({
      data: {
        userId,
        workspaceId: ws?.id,
        projectId: data.projectId,
        clientId: data.clientId,
        milestoneId: data.milestoneId || null,
        title: data.title,
        version: versionNum,
        description: data.description || "",
        fileUrl: data.fileUrl || "",
        fileName: data.fileName || "",
        fileSize: data.fileSize || "",
        fileType: data.fileType || "",
        externalUrl: data.externalUrl || "",
        status: "pending_review",
        uploadedBy: data.uploadedBy || "freelancer",
        versions: {
          create: {
            id: `v-${Date.now()}`,
            versionNumber: versionNum,
            fileUrl: data.fileUrl || "",
            fileName: data.fileName || "",
            fileSize: data.fileSize || "",
            fileType: data.fileType || "",
            externalUrl: data.externalUrl || "",
            uploadedBy: data.uploadedBy || "freelancer",
            status: "pending_review",
          },
        },
      },
      include: {
        versions: true,
      },
    });

    return {
      ...deliverable,
      _id: deliverable.id,
    };
  }

  static async submitNewVersion(deliverableId: string, data: {
    version: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: string;
    fileType?: string;
    externalUrl?: string;
    uploadedBy?: string;
    description?: string;
  }) {
    await prisma.deliverableVersion.create({
      data: {
        id: `v-${Date.now()}`,
        deliverableId,
        versionNumber: data.version,
        fileUrl: data.fileUrl || "",
        fileName: data.fileName || "",
        fileSize: data.fileSize || "",
        fileType: data.fileType || "",
        externalUrl: data.externalUrl || "",
        uploadedBy: data.uploadedBy || "freelancer",
        status: "pending_review",
      },
    });

    const updated = await prisma.deliverable.update({
      where: { id: deliverableId },
      data: {
        version: data.version,
        fileUrl: data.fileUrl || "",
        fileName: data.fileName || "",
        fileSize: data.fileSize || "",
        fileType: data.fileType || "",
        externalUrl: data.externalUrl || "",
        status: "pending_review",
        clientFeedback: "",
        feedbackDate: null,
      },
      include: { versions: true },
    });

    return {
      ...updated,
      _id: updated.id,
    };
  }

  static async updateReviewStatus(deliverableId: string, data: {
    status: DeliverableStatus;
    clientFeedback?: string;
  }) {
    const isApproved = data.status === "approved";
    const now = new Date();

    const updated = await prisma.deliverable.update({
      where: { id: deliverableId },
      data: {
        status: data.status,
        clientFeedback: data.clientFeedback || "",
        feedbackDate: now,
        ...(isApproved ? { approvedDate: now } : {}),
      },
      include: { versions: true },
    });

    return {
      ...updated,
      _id: updated.id,
    };
  }
}
