import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Proposal from "@/models/Proposal";
import Invoice from "@/models/Invoice";
import PortfolioProject from "@/models/PortfolioProject";

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
    await connectDB();
    const userId = session.user.id;

    // Build regex search pattern
    const searchRegex = new RegExp(query, "i");

    // Search different models in parallel
    const [clients, projects, proposals, invoices, portfolioItems] = await Promise.all([
      Client.find({ userId, $or: [{ name: searchRegex }, { company: searchRegex }] }).limit(3),
      Project.find({ userId, title: searchRegex }).limit(3),
      Proposal.find({ userId, $or: [{ title: searchRegex }, { clientName: searchRegex }] }).limit(3),
      Invoice.find({ userId, invoiceNumber: searchRegex }).limit(3),
      PortfolioProject.find({ userId, title: searchRegex }).limit(3),
    ]);

    const results: any[] = [];

    // Map clients
    clients.forEach((c) => {
      results.push({
        id: c._id.toString(),
        type: "Client",
        label: c.name + (c.company ? ` (${c.company})` : ""),
        href: `/dashboard/clients`,
      });
    });

    // Map projects
    projects.forEach((p) => {
      results.push({
        id: p._id.toString(),
        type: "Project",
        label: p.title,
        href: `/dashboard/projects`,
      });
    });

    // Map proposals
    proposals.forEach((pr) => {
      results.push({
        id: pr._id.toString(),
        type: "Proposal",
        label: pr.title + (pr.clientName ? ` for ${pr.clientName}` : ""),
        href: `/dashboard/proposals`,
      });
    });

    // Map invoices
    invoices.forEach((inv) => {
      results.push({
        id: inv._id.toString(),
        type: "Invoice",
        label: `${inv.invoiceNumber} - Total $${inv.total.toLocaleString()}`,
        href: `/dashboard/invoices`,
      });
    });

    // Map portfolio items
    portfolioItems.forEach((pt) => {
      results.push({
        id: pt._id.toString(),
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
