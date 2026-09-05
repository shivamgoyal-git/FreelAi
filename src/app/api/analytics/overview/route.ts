import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDateRange } from "@/utils/analyticsHelper";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "month";
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");

    const { startDate, endDate, prevStartDate, prevEndDate } = getDateRange(range, start, end);

    const [
      currInvoices,
      prevInvoices,
      activeClients,
      prevActiveClients,
      currProjects,
      prevProjects,
      currProposals,
      prevProposals,
    ] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          userId,
          status: { not: "cancelled" },
          issueDate: { gte: startDate, lte: endDate },
        },
      }),
      prisma.invoice.findMany({
        where: {
          userId,
          status: { not: "cancelled" },
          issueDate: { gte: prevStartDate, lte: prevEndDate },
        },
      }),
      prisma.client.count({ where: { userId, status: "active" } }),
      prisma.client.count({ where: { userId, status: "active", createdAt: { lte: prevEndDate } } }),
      prisma.project.findMany({
        where: {
          userId,
          status: { not: "cancelled" },
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      prisma.project.findMany({
        where: {
          userId,
          status: { not: "cancelled" },
          createdAt: { gte: prevStartDate, lte: prevEndDate },
        },
      }),
      prisma.proposal.findMany({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      prisma.proposal.findMany({
        where: {
          userId,
          createdAt: { gte: prevStartDate, lte: prevEndDate },
        },
      }),
    ]);

    // Current Invoice Stats
    let totalRevenue = 0;
    let outstandingRevenue = 0;
    let totalBilled = 0;
    let paidDurationSum = 0;
    let paidInvoicesCount = 0;

    currInvoices.forEach((inv) => {
      totalRevenue += inv.amountPaid;
      outstandingRevenue += inv.remainingAmount;
      totalBilled += inv.total;
      if (inv.status === "paid") {
        paidDurationSum += new Date(inv.updatedAt).getTime() - new Date(inv.issueDate).getTime();
        paidInvoicesCount += 1;
      }
    });

    const avgInvoiceValue = currInvoices.length > 0 ? totalBilled / currInvoices.length : 0;
    const avgPaymentTimeDays = paidInvoicesCount > 0 ? (paidDurationSum / paidInvoicesCount) / (1000 * 60 * 60 * 24) : 0;

    // Previous Invoice Stats
    let prevTotalRevenue = 0;
    let prevTotalBilled = 0;
    prevInvoices.forEach((inv) => {
      prevTotalRevenue += inv.amountPaid;
      prevTotalBilled += inv.total;
    });
    const prevAvgInvoiceValue = prevInvoices.length > 0 ? prevTotalBilled / prevInvoices.length : 0;

    // Projects stats
    const completedProjects = currProjects.filter((p) => p.status === "completed").length;
    const prevCompletedProjects = prevProjects.filter((p) => p.status === "completed").length;
    const currTotalBudget = currProjects.reduce((sum, p) => sum + p.budget, 0);
    const prevTotalBudget = prevProjects.reduce((sum, p) => sum + p.budget, 0);
    const avgProjectValue = currProjects.length > 0 ? currTotalBudget / currProjects.length : 0;
    const prevAvgProjectValue = prevProjects.length > 0 ? prevTotalBudget / prevProjects.length : 0;

    // Proposals stats
    const currWon = currProposals.filter((p) => p.status === "won").length;
    const currLost = currProposals.filter((p) => p.status === "lost").length;
    const currSent = currProposals.filter((p) => p.status === "sent").length;
    const currDenom = currWon + currLost + currSent;
    const winRate = currDenom > 0 ? (currWon / currDenom) * 100 : 0;

    const prevWon = prevProposals.filter((p) => p.status === "won").length;
    const prevLost = prevProposals.filter((p) => p.status === "lost").length;
    const prevSent = prevProposals.filter((p) => p.status === "sent").length;
    const prevDenom = prevWon + prevLost + prevSent;
    const prevWinRate = prevDenom > 0 ? (prevWon / prevDenom) * 100 : 0;

    // Collection rate
    const collectionRate = totalBilled > 0 ? (totalRevenue / totalBilled) * 100 : 0;
    const prevCollectionRate = prevTotalBilled > 0 ? (prevTotalRevenue / prevTotalBilled) * 100 : 0;

    const calcGrowth = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    const revenueGrowth = calcGrowth(totalRevenue, prevTotalRevenue);
    const clientsGrowth = calcGrowth(activeClients, prevActiveClients);
    const completedProjectsGrowth = calcGrowth(completedProjects, prevCompletedProjects);
    const avgProjectValueGrowth = calcGrowth(avgProjectValue, prevAvgProjectValue);
    const winRateGrowth = winRate - prevWinRate;
    const collectionRateGrowth = collectionRate - prevCollectionRate;
    const avgInvoiceValueGrowth = calcGrowth(avgInvoiceValue, prevAvgInvoiceValue);

    const insights: string[] = [];
    if (currInvoices.length === 0 && currProjects.length === 0 && currProposals.length === 0) {
      insights.push("Welcome! Your workspace is currently empty. Use the 'Generate Demo Workspace' action to preview the analytics engine with simulated data.");
    } else {
      if (collectionRate < 75 && outstandingRevenue > 1000) {
        insights.push(`Your collection rate is currently ${collectionRate.toFixed(1)}%. Consider setting up automated reminders for your $${outstandingRevenue.toLocaleString()} outstanding payments.`);
      } else if (collectionRate >= 90) {
        insights.push("Excellent collection efficiency! You are recovering over 90% of billed revenue within the period.");
      }

      if (revenueGrowth > 15) {
        insights.push(`Strong financial performance! Revenue increased by ${revenueGrowth.toFixed(1)}% compared to the previous period.`);
      } else if (revenueGrowth < -10) {
        insights.push(`Revenue has decreased by ${Math.abs(revenueGrowth).toFixed(1)}% compared to the prior period. Try pitching new proposals or checking outstanding invoices.`);
      }

      if (winRate > 60) {
        insights.push(`Outstanding proposal win rate of ${winRate.toFixed(0)}%! Your value proposition is hitting the mark with prospective clients.`);
      } else if (winRate > 0 && winRate < 35) {
        insights.push(`Proposal win rate is at ${winRate.toFixed(0)}%. Consider reviewing client briefs or utilizing AI Boost to optimize your next proposal pitch.`);
      }

      if (avgPaymentTimeDays > 14) {
        insights.push(`Your average payment time is ${avgPaymentTimeDays.toFixed(1)} days. Requesting upfront milestone deposits (e.g., 30-50%) can help improve your cash flow.`);
      } else if (avgPaymentTimeDays > 0 && avgPaymentTimeDays <= 5) {
        insights.push(`Invoices are settled quickly, averaging just ${avgPaymentTimeDays.toFixed(1)} days to payment. Keep up the prompt invoicing cadence!`);
      }
    }

    return NextResponse.json({
      range,
      startDate,
      endDate,
      kpis: {
        totalRevenue: { value: totalRevenue, growth: revenueGrowth },
        outstandingRevenue: { value: outstandingRevenue, growth: null },
        activeClients: { value: activeClients, growth: clientsGrowth },
        completedProjects: { value: completedProjects, growth: completedProjectsGrowth },
        avgProjectValue: { value: avgProjectValue, growth: avgProjectValueGrowth },
        winRate: { value: winRate, growth: winRateGrowth },
        collectionRate: { value: collectionRate, growth: collectionRateGrowth },
        avgInvoiceValue: { value: avgInvoiceValue, growth: avgInvoiceValueGrowth },
        avgPaymentTimeDays: { value: avgPaymentTimeDays, growth: null },
      },
      insights,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load overview analytics";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
