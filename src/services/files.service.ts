import { prisma } from "@/lib/prisma";
import { deleteFromStorage } from "@/lib/storage";
import type { FileCategory } from "@prisma/client";

export class FilesService {
  static async getFiles(filters: { clientId?: string; projectId?: string; isClientVisible?: boolean }) {
    const where: any = {};
    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.isClientVisible !== undefined) where.isClientVisible = filters.isClientVisible;

    const files = await prisma.projectFile.findMany({
      where,
      include: { project: true, client: true },
      orderBy: { createdAt: "desc" },
    });

    return files.map((f) => ({
      ...f,
      _id: f.id,
      projectName: f.project?.title,
      clientName: f.client?.name,
    }));
  }

  static async createFileRecord(data: {
    userId: string;
    clientId: string;
    projectId: string;
    name: string;
    url: string;
    storageKey?: string;
    size?: string;
    fileType?: string;
    uploadedBy?: string;
    uploaderName?: string;
    category?: FileCategory;
    isClientVisible?: boolean;
  }) {
    const ws = await prisma.workspace.findFirst({ where: { ownerId: data.userId } });

    const file = await prisma.projectFile.create({
      data: {
        userId: data.userId,
        workspaceId: ws?.id,
        clientId: data.clientId,
        projectId: data.projectId,
        name: data.name,
        url: data.url,
        storageKey: data.storageKey || null,
        size: data.size || "0 KB",
        fileType: data.fileType || "document",
        uploadedBy: data.uploadedBy || "freelancer",
        uploaderName: data.uploaderName || "",
        category: data.category || "asset",
        isClientVisible: data.isClientVisible !== undefined ? data.isClientVisible : true,
      },
    });

    return {
      ...file,
      _id: file.id,
    };
  }

  static async deleteFile(id: string, userId: string) {
    const file = await prisma.projectFile.findFirst({
      where: { id, userId },
    });
    if (!file) return false;

    if (file.storageKey) {
      await deleteFromStorage(file.storageKey);
    }

    await prisma.projectFile.delete({ where: { id } });
    return true;
  }
}
