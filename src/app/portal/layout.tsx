"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ClientSidebar } from "@/components/portal/ClientSidebar";
import { ClientTopbar } from "@/components/portal/ClientTopbar";

function PortalLayoutInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const previewClientId = searchParams.get("previewClientId");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clientData, setClientData] = useState<{
    name: string;
    company?: string;
    avatar?: string;
    freelancerName?: string;
    freelancerEmail?: string;
    isPreview?: boolean;
  }>({
    name: "Client",
    company: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const url = previewClientId
          ? `/api/portal/settings?previewClientId=${previewClientId}`
          : `/api/portal/settings`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.client) {
            setClientData({
              name: data.client.name,
              company: data.client.company,
              avatar: data.client.avatar,
              freelancerName: data.freelancer?.name,
              freelancerEmail: data.freelancer?.email,
              isPreview: !!previewClientId,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load client profile in layout:", err);
      }
    };
    fetchProfile();
  }, [previewClientId]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--color-void, #08090a)",
        color: "var(--color-bone, #e5e5e6)",
      }}
    >
      {/* Sidebar */}
      <ClientSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        freelancerName={clientData.freelancerName}
        freelancerEmail={clientData.freelancerEmail}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          background: "var(--color-void, #08090a)",
        }}
      >
        <ClientTopbar
          onMenuClick={() => setSidebarOpen(true)}
          clientName={clientData.name}
          clientCompany={clientData.company}
          clientAvatar={clientData.avatar}
          isPreview={!!previewClientId}
          previewClientId={previewClientId}
        />

        <main
          style={{
            flex: 1,
            padding: "24px 32px",
            maxWidth: "1280px",
            width: "100%",
            margin: "0 auto",
          }}
          className="portal-main-content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "var(--color-void, #08090a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-fog, #8a8f98)",
          }}
        >
          Loading portal...
        </div>
      }
    >
      <PortalLayoutInner>{children}</PortalLayoutInner>
    </Suspense>
  );
}
