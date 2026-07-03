import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Proposal from "@/models/Proposal";
import { getDateRange } from "@/utils/analyticsHelper";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "month";
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");

    const { startDate, endDate, prevStartDate, prevEndDate } = getDateRange(range, start, end);

    // Run parallel aggregation pipelines
    const [invoiceData, clientData, projectData, proposalData] = await Promise.all([
      Invoice.aggregate([
        {
          $facet: {
            current: [
              { $match: { userId, status: { $ne: "cancelled" }, issueDate: { $gte: startDate, $lte: endDate } } },
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: "$amountPaid" },
                  outstandingRevenue: { $sum: "$remainingAmount" },
                  totalBilled: { $sum: "$total" },
                  avgInvoiceValue: { $avg: "$total" },
                  totalInvoices: { $sum: 1 },
                },
              },
            ],
            previous: [
              { $match: { userId, status: { $ne: "cancelled" }, issueDate: { $gte: prevStartDate, $lte: prevEndDate } } },
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: "$amountPaid" },
                  totalBilled: { $sum: "$total" },
                  avgInvoiceValue: { $avg: "$total" },
                },
              },
            ],
            paymentTime: [
              { $match: { userId, status: "paid", issueDate: { $gte: startDate, $lte: endDate } } },
              {
                $project: {
                  durationMs: { $subtract: ["$updatedAt", "$issueDate"] },
                },
              },
              {
                $group: {
                  _id: null,
                  avgDurationMs: { $avg: "$durationMs" },
                },
              },
            ],
          },
        },
      ]),

      Client.aggregate([
        {
          $facet: {
            totalActive: [
              { $match: { userId, status: "active" } },
              { $count: "count" },
            ],
            previousActive: [
              { $match: { userId, status: "active", createdAt: { $lte: prevEndDate } } },
              { $count: "count" },
            ],
          },
        },
      ]),

      Project.aggregate([
        {
          $facet: {
            current: [
              { $match: { userId, status: { $ne: "cancelled" }, createdAt: { $gte: startDate, $lte: endDate } } },
              {
                $group: {
                  _id: null,
                  totalProjects: { $sum: 1 },
                  completedProjects: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
                  avgBudget: { $avg: "$budget" },
                  totalBudget: { $sum: "$budget" },
                },
              },
            ],
            previous: [
              { $match: { userId, status: { $ne: "cancelled" }, createdAt: { $gte: prevStartDate, $lte: prevEndDate } } },
              {
                $group: {
                  _id: null,
                  totalProjects: { $sum: 1 },
                  completedProjects: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
                  avgBudget: { $avg: "$budget" },
                },
              },
            ],
          },
        },
      ]),

      Proposal.aggregate([
        {
          $facet: {
            current: [
              { $match: { userId, createdAt: { $gte: startDate, $lte: endDate } } },
              {
                $group: {
                  _id: null,
                  totalProposals: { $sum: 1 },
                  wonProposals: { $sum: { $cond: [{ $eq: ["$status", "won"] }, 1, 0] } },
                  lostProposals: { $sum: { $cond: [{ $eq: ["$status", "lost"] }, 1, 0] } },
                  sentProposals: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
                },
              },
            ],
            previous: [
              { $match: { userId, createdAt: { $gte: prevStartDate, $lte: prevEndDate } } },
              {
                $group: {
                  _id: null,
                  totalProposals: { $sum: 1 },
                  wonProposals: { $sum: { $cond: [{ $eq: ["$status", "won"] }, 1, 0] } },
                  lostProposals: { $sum: { $cond: [{ $eq: ["$status", "lost"] }, 1, 0] } },
                  sentProposals: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
                },
              },
            ],
          },
        },
      ]),
    ]);

    // Extract invoice stats
    const currInv = invoiceData[0]?.current[0] || { totalRevenue: 0, outstandingRevenue: 0, totalBilled: 0, avgInvoiceValue: 0, totalInvoices: 0 };
    const prevInv = invoiceData[0]?.previous[0] || { totalRevenue: 0, totalBilled: 0, avgInvoiceValue: 0 };
    const payTime = invoiceData[0]?.paymentTime[0]?.avgDurationMs || 0;

    // Extract client stats
    const activeClientsCount = clientData[0]?.totalActive[0]?.count || 0;
    const prevActiveClientsCount = clientData[0]?.previousActive[0]?.count || 0;

    // Extract project stats
    const currProj = projectData[0]?.current[0] || { totalProjects: 0, completedProjects: 0, avgBudget: 0, totalBudget: 0 };
    const prevProj = projectData[0]?.previous[0] || { totalProjects: 0, completedProjects: 0, avgBudget: 0 };

    // Extract proposal stats
    const currProp = proposalData[0]?.current[0] || { totalProposals: 0, wonProposals: 0, lostProposals: 0, sentProposals: 0 };
    const prevProp = proposalData[0]?.previous[0] || { totalProposals: 0, wonProposals: 0, lostProposals: 0, sentProposals: 0 };

    // Calculate core metrics
    const totalRevenue = currInv.totalRevenue;
    const outstandingRevenue = currInv.outstandingRevenue;
    const activeClients = activeClientsCount;
    const completedProjects = currProj.completedProjects;
    const avgProjectValue = currProj.avgBudget;

    // Win Rate Calculation (won / (won + lost + sent))
    const currDenom = currProp.wonProposals + currProp.lostProposals + currProp.sentProposals;
    const winRate = currDenom > 0 ? (currProp.wonProposals / currDenom) * 100 : 0;

    const prevDenom = prevProp.wonProposals + prevProp.lostProposals + prevProp.sentProposals;
    const prevWinRate = prevDenom > 0 ? (prevProp.wonProposals / prevDenom) * 100 : 0;

    // Collection Rate (paid / billed)
    const collectionRate = currInv.totalBilled > 0 ? (currInv.totalRevenue / currInv.totalBilled) * 100 : 0;
    const prevCollectionRate = prevInv.totalBilled > 0 ? (prevInv.totalRevenue / prevInv.totalBilled) * 100 : 0;

    // Average Invoice Value
    const avgInvoiceValue = currInv.avgInvoiceValue;

    // Average Payment Time (Days)
    const avgPaymentTimeDays = payTime > 0 ? payTime / (1000 * 60 * 60 * 24) : 0;

    // Growth calculation helper
    const calcGrowth = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    const revenueGrowth = calcGrowth(totalRevenue, prevInv.totalRevenue);
    const clientsGrowth = calcGrowth(activeClients, prevActiveClientsCount);
    const completedProjectsGrowth = calcGrowth(completedProjects, prevProj.completedProjects);
    const avgProjectValueGrowth = calcGrowth(avgProjectValue, prevProj.avgBudget);
    const winRateGrowth = winRate - prevWinRate; // absolute difference for rates
    const collectionRateGrowth = collectionRate - prevCollectionRate; // absolute difference
    const avgInvoiceValueGrowth = calcGrowth(avgInvoiceValue, prevInv.avgInvoiceValue);

    // Business Insights generation
    const insights: string[] = [];
    if (currInv.totalInvoices === 0 && currProj.totalProjects === 0 && currProp.totalProposals === 0) {
      insights.push("Welcome! Your workspace is currently empty. Use the 'Generate Demo Workspace' action to preview the analytics engine with simulated data.");
    } else {
      // Revenue & Billing insight
      if (collectionRate < 75 && outstandingRevenue > 1000) {
        insights.push(`Your collection rate is currently ${collectionRate.toFixed(1)}%. Consider setting up automated reminders for your $${outstandingRevenue.toLocaleString()} outstanding payments.`);
      } else if (collectionRate >= 90) {
        insights.push("Excellent collection efficiency! You are recovering over 90% of billed revenue within the period.");
      }

      // Concentration/Revenue growth insight
      if (revenueGrowth > 15) {
        insights.push(`Strong financial performance! Revenue increased by ${revenueGrowth.toFixed(1)}% compared to the previous period.`);
      } else if (revenueGrowth < -10) {
        insights.push(`Revenue has decreased by ${Math.abs(revenueGrowth).toFixed(1)}% compared to the prior period. Try pitching new proposals or checking outstanding invoices.`);
      }

      // Proposal conversions
      if (winRate > 60) {
        insights.push(`Outstanding proposal win rate of ${winRate.toFixed(0)}%! Your value proposition is hitting the mark with prospective clients.`);
      } else if (winRate > 0 && winRate < 35) {
        insights.push(`Proposal win rate is at ${winRate.toFixed(0)}%. Consider reviewing client briefs or utilizing AI Boost to optimize your next proposal pitch.`);
      }

      // Average payment time
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
        outstandingRevenue: { value: outstandingRevenue, growth: null }, // no logical direct growth comparison
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
