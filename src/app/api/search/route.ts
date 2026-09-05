import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const userId = session.user.id;
    const q = query.trim();

    const [clients, projects, proposals, invoices, portfolioItems] = await Promise.all([
      prisma.client.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { company: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 3,
      }),
      prisma.project.findMany({
        where: {
          userId,
          title: { contains: q, mode: "insensitive" },
        },
        take: 3,
      }),
      prisma.proposal.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { clientName: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 3,
      }),
      prisma.invoice.findMany({
        where: {
          userId,
          invoiceNumber: { contains: q, mode: "insensitive" },
        },
        take: 3,
      }),
      prisma.portfolioProject.findMany({
        where: {
          userId,
          title: { contains: q, mode: "insensitive" },
        },
        take: 3,
      }),
    ]);

    const results: any[] = [];

    clients.forEach((c) => {
      results.push({
        id: c.id,
        type: "Client",
        label: c.name + (c.company ? ` (${c.company})` : ""),
        href: `/dashboard/clients`,
      });
    });

    projects.forEach((p) => {
      results.push({
        id: p.id,
        type: "Project",
        label: p.title,
        href: `/dashboard/projects`,
      });
    });

    proposals.forEach((pr) => {
      results.push({
        id: pr.id,
        type: "Proposal",
        label: pr.title + (pr.clientName ? ` for ${pr.clientName}` : ""),
        href: `/dashboard/proposals`,
      });
    });

    invoices.forEach((inv) => {
      results.push({
        id: inv.id,
        type: "Invoice",
        label: `${inv.invoiceNumber} - Total $${inv.total.toLocaleString()}`,
        href: `/dashboard/invoices`,
      });
    });

    portfolioItems.forEach((pt) => {
      results.push({
        id: pt.id,
        type: "Portfolio Item",
        label: pt.title,
        href: `/dashboard/portfolio`,
      });
    });

    return NextResponse.json({ results });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
