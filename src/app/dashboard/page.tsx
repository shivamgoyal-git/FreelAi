"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProfileCompletionCard } from "@/components/dashboard/ProfileCompletionCard";
import { DailyBriefing } from "@/components/dashboard/DailyBriefing";
import { KpiCardsRow } from "@/components/dashboard/KpiCardsRow";
import { RevenueOverviewCard } from "@/components/dashboard/RevenueOverviewCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { TodaysTasksCard } from "@/components/dashboard/TodaysTasksCard";
import { ProjectTimelineCard } from "@/components/dashboard/ProjectTimelineCard";
import { TopClientsCard } from "@/components/dashboard/TopClientsCard";
import { UpcomingDeadlinesCard } from "@/components/dashboard/UpcomingDeadlinesCard";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { ActiveProjectsTable } from "@/components/dashboard/ActiveProjectsTable";
import { EarningsByCategoryCard } from "@/components/dashboard/EarningsByCategoryCard";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const userName = session?.user?.name || "Shivam";

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      } else {
        toast.error("Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
      toast.error("Network error while syncing dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const currencySymbol = dashboardData?.currencySymbol || "$";

  return (
    <div
      style={{
        maxWidth: "1440px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        position: "relative",
      }}
    >
      {/* ── HEADER ── */}
      <DashboardHeader userName={userName} />

      {/* ── LOADING SKELETON ── */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative", zIndex: 1 }}>
          <div className="skeleton" style={{ height: "64px", borderRadius: "12px", background: "var(--surface-1)" }} />
          <div className="skeleton" style={{ height: "40px", borderRadius: "10px", background: "var(--surface-1)" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton" style={{ height: "98px", borderRadius: "12px", background: "var(--surface-1)" }} />
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.1fr 1fr", gap: "14px" }}>
            <div className="skeleton" style={{ height: "250px", borderRadius: "12px", background: "var(--surface-1)" }} />
            <div className="skeleton" style={{ height: "250px", borderRadius: "12px", background: "var(--surface-1)" }} />
            <div className="skeleton" style={{ height: "250px", borderRadius: "12px", background: "var(--surface-1)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr", gap: "16px" }}>
            <div className="skeleton" style={{ height: "380px", borderRadius: "12px", background: "var(--surface-1)" }} />
            <div className="skeleton" style={{ height: "380px", borderRadius: "12px", background: "var(--surface-1)" }} />
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Profile Completion Card */}
          <ProfileCompletionCard progress={dashboardData?.profileCompleteness ?? 60} />

          {/* Daily Briefing */}
          <DailyBriefing items={dashboardData?.dailyBriefingItems} />

          {/* 5-Card KPI Row */}
          {dashboardData?.kpiSummary && (
            <KpiCardsRow kpi={dashboardData.kpiSummary} currencySymbol={currencySymbol} />
          )}

          {/* ── ROW 1: REVENUE OVERVIEW & RECENT ACTIVITY ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              gap: "14px",
              alignItems: "stretch",
            }}
            className="dashboard-row-1"
          >
            {/* Revenue Overview Chart (Span 7) */}
            <div style={{ gridColumn: "span 7" }} className="dash-col-revenue">
              <RevenueOverviewCard
                data={dashboardData?.chartData}
                currencySymbol={currencySymbol}
              />
            </div>

            {/* Recent Activity Feed (Span 5) */}
            <div style={{ gridColumn: "span 5" }} className="dash-col-activity">
              <RecentActivityCard activities={dashboardData?.activities || []} />
            </div>
          </div>

          {/* ── MAIN WORKSPACE SECTION ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 2.7fr) minmax(280px, 1fr)",
              gap: "14px",
              alignItems: "flex-start",
            }}
            className="dashboard-main-grid"
          >
            {/* LEFT COLUMN: Tasks + Timeline + Active Projects */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", minWidth: 0 }}>
              {/* Row 2: Today's Tasks & Project Timeline */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.3fr",
                  gap: "14px",
                }}
                className="dashboard-row-tasks-timeline"
              >
                <TodaysTasksCard initialTasks={dashboardData?.tasks || []} />
                <ProjectTimelineCard projects={dashboardData?.timelineProjects || []} />
              </div>

              {/* Row 3: Active Projects Table */}
              <ActiveProjectsTable
                projects={dashboardData?.recentProjects || []}
                currencySymbol={currencySymbol}
              />
            </div>

            {/* RIGHT COLUMN: Client, Deadline, Streak, Category Breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", minWidth: 0 }}>
              <TopClientsCard
                clients={dashboardData?.topClients || []}
                currencySymbol={currencySymbol}
              />
              <UpcomingDeadlinesCard
                deadlines={dashboardData?.upcomingDeadlines || []}
              />
              <StreakCard
                days={dashboardData?.streak?.days ?? 12}
                activeDays={dashboardData?.streak?.activeDays}
              />
              <EarningsByCategoryCard
                categories={dashboardData?.earningsByCategory || []}
                currencySymbol={currencySymbol}
              />
            </div>
          </div>
        </motion.div>
      )}

      <style jsx global>{`
        @media (max-width: 1200px) {
          .dashboard-row-1 {
            grid-template-columns: 1fr 1fr !important;
          }
          .dash-col-revenue {
            grid-column: span 12 !important;
          }
          .dash-col-activity {
            grid-column: span 6 !important;
          }
          .dash-col-copilot {
            grid-column: span 6 !important;
          }
        }

        @media (max-width: 992px) {
          .dashboard-main-grid {
            grid-template-columns: 1fr !important;
          }
          .dash-col-activity,
          .dash-col-copilot {
            grid-column: span 12 !important;
          }
          .dashboard-row-tasks-timeline {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .kpi-grid-container {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
