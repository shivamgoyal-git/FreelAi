"use client";

import React, { useState, useEffect } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  User,
  Briefcase,
  Settings,
  Shield,
  CreditCard,
  Sparkles,
  Volume2,
  LogOut,
  TrendingUp,
  X,
} from "lucide-react";
import UserAvatar from "./UserAvatar";
import ProfileCompletion, { calculateProfileCompleteness } from "./ProfileCompletion";

interface AccountDropdownProps {
  userName: string;
  userInitial: string;
  userImage?: string | null;
  userEmail?: string | null;
}

export default function AccountDropdown({
  userName,
  userInitial,
  userImage,
  userEmail,
}: AccountDropdownProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [completeness, setCompleteness] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Load latest profile details for completeness rating
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
          setCompleteness(calculateProfileCompleteness(data.profile));
        }
      } catch (err) {
        console.error("Failed to load profile for dropdown:", err);
      }
    };
    loadProfile();
  }, []);

  // Handle responsive window resizing
  useEffect(() => {
    const checkRes = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkRes();
    window.addEventListener("resize", checkRes);
    return () => window.removeEventListener("resize", checkRes);
  }, []);

  const handleNavigate = (path: string) => {
    setMobileOpen(false);
    router.push(path);
  };

  const handleLogout = async () => {
    setMobileOpen(false);
    await signOut({ callbackUrl: "/login" });
  };

  // Profile metadata fields
  const personal = (profile?.personal || {}) as Record<string, unknown>;
  const finalName = (personal.fullName as string) || userName;
  const finalTitle = (personal.professionalTitle as string) || "Freelancer";
  const finalPhoto = (personal.profilePhoto as string) || userImage;
  const finalEmail = userEmail || "user@freelai.com";

  // Reusable mini profile card block
  const renderProfileCardMini = () => (
    <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <UserAvatar src={finalPhoto} name={finalName} initials={userInitial} size={38} hoverScale={false} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>
            {finalName}
          </h4>
          <p style={{ fontSize: "11px", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: "2px 0 0 0" }}>
            {finalTitle}
          </p>
          <p style={{ fontSize: "10.5px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: "1px 0 0 0" }}>
            {finalEmail}
          </p>
        </div>
      </div>
      <div style={{ marginTop: "4px" }}>
        <ProfileCompletion percentage={completeness} showProgressLine={true} size="sm" />
      </div>
    </div>
  );

  // Mobile Bottom Sheet / Drawer Layout
  if (isMobile) {
    return (
      <>
        <div onClick={() => setMobileOpen(true)} style={{ cursor: "pointer" }}>
          <UserAvatar src={finalPhoto} name={finalName} initials={userInitial} size={34} />
        </div>

        {mobileOpen && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end"
          }}>
            <div style={{
              background: "var(--surface-1)",
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
              padding: "20px",
              maxHeight: "85vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              borderTop: "1px solid var(--border-strong)",
              boxShadow: "0 -8px 24px rgba(0,0,0,0.15)"
            }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "var(--text-muted)" }}>Account Menu</span>
                <button onClick={() => setMobileOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                  <X size={18} />
                </button>
              </div>

              {renderProfileCardMini()}

              {/* Mobile Menu Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "10px", fontWeight: "bold", color: "var(--text-muted)", margin: "8px 0 4px 8px", textTransform: "uppercase" }}>Quick Actions</span>
                <button onClick={() => handleNavigate("/dashboard/profile")} style={mobileItemStyle}>
                  <User size={15} /> My Profile
                </button>
                <button onClick={() => handleNavigate("/dashboard/portfolio")} style={mobileItemStyle}>
                  <Briefcase size={15} /> Portfolio Manager
                </button>
                <button onClick={() => handleNavigate("/dashboard/settings/account")} style={mobileItemStyle}>
                  <Settings size={15} /> Account Settings
                </button>
                <button onClick={() => handleNavigate("/dashboard/settings/security")} style={mobileItemStyle}>
                  <Shield size={15} /> Security
                </button>
                <button disabled style={{ ...mobileItemStyle, opacity: 0.5, cursor: "not-allowed" }}>
                  <CreditCard size={15} /> Billing <span style={badgeStyle}>Soon</span>
                </button>
                <button disabled style={{ ...mobileItemStyle, opacity: 0.5, cursor: "not-allowed" }}>
                  <TrendingUp size={15} /> Upgrade Plan <span style={badgeStyle}>Soon</span>
                </button>

                <span style={{ fontSize: "10px", fontWeight: "bold", color: "var(--text-muted)", margin: "14px 0 4px 8px", textTransform: "uppercase" }}>AI Workspace</span>
                <button onClick={() => handleNavigate("/dashboard/profile/ai-preferences")} style={mobileItemStyle}>
                  <Sparkles size={15} /> AI Preferences
                </button>
                <button onClick={() => handleNavigate("/dashboard/proposals")} style={mobileItemStyle}>
                  <Volume2 size={15} /> Proposal Templates
                </button>

                <div style={{ height: "1px", background: "var(--border)", margin: "12px 0" }} />
                
                <button onClick={handleLogout} style={{ ...mobileItemStyle, color: "var(--error)" }}>
                  <LogOut size={15} /> Logout
                </button>
              </div>

            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop Radix DropdownMenu Layout
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild style={{ outline: "none" }}>
        <div>
          <UserAvatar src={finalPhoto} name={finalName} initials={userInitial} size={34} />
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius)",
            width: "250px",
            boxShadow: "var(--shadow-lg)",
            padding: "4px",
            zIndex: 9999,
            outline: "none",
            animation: "slideDown var(--dur-fast) ease"
          }}
        >
          {renderProfileCardMini()}

          {/* Quick Actions Group */}
          <div style={{ padding: "4px" }}>
            <span style={{ fontSize: "9.5px", fontWeight: "bold", color: "var(--text-muted)", margin: "6px 8px 4px", display: "block", textTransform: "uppercase" }}>Quick Actions</span>
            <DropdownMenu.Item onSelect={() => handleNavigate("/dashboard/profile")} style={itemStyle}>
              <User size={13} />
              <span style={{ flex: 1 }}>My Profile</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => handleNavigate("/dashboard/portfolio")} style={itemStyle}>
              <Briefcase size={13} />
              <span style={{ flex: 1 }}>Portfolio Manager</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => handleNavigate("/dashboard/settings/account")} style={itemStyle}>
              <Settings size={13} />
              <span style={{ flex: 1 }}>Account Settings</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => handleNavigate("/dashboard/settings/security")} style={itemStyle}>
              <Shield size={13} />
              <span style={{ flex: 1 }}>Security</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item disabled style={{ ...itemStyle, opacity: 0.5 }}>
              <CreditCard size={13} />
              <span style={{ flex: 1 }}>Billing</span>
              <span style={badgeStyle}>Soon</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item disabled style={{ ...itemStyle, opacity: 0.5 }}>
              <TrendingUp size={13} />
              <span style={{ flex: 1 }}>Upgrade Plan</span>
              <span style={badgeStyle}>Soon</span>
            </DropdownMenu.Item>
          </div>

          <DropdownMenu.Separator style={{ height: "1px", background: "var(--border)", margin: "4px" }} />

          {/* AI Workspace Group */}
          <div style={{ padding: "4px" }}>
            <span style={{ fontSize: "9.5px", fontWeight: "bold", color: "var(--text-muted)", margin: "4px 8px 4px", display: "block", textTransform: "uppercase" }}>AI Workspace</span>
            <DropdownMenu.Item onSelect={() => handleNavigate("/dashboard/profile/ai-preferences")} style={itemStyle}>
              <Sparkles size={13} />
              <span style={{ flex: 1 }}>AI Preferences</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => handleNavigate("/dashboard/proposals")} style={itemStyle}>
              <Volume2 size={13} />
              <span style={{ flex: 1 }}>Proposal Templates</span>
            </DropdownMenu.Item>
          </div>

          <DropdownMenu.Separator style={{ height: "1px", background: "var(--border)", margin: "4px" }} />

          {/* Session Group */}
          <div style={{ padding: "4px" }}>
            <DropdownMenu.Item onSelect={handleLogout} style={{ ...itemStyle, color: "var(--error)" }}>
              <LogOut size={13} />
              <span style={{ flex: 1 }}>Logout</span>
            </DropdownMenu.Item>
          </div>

        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

// Inline styling helpers
const itemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 10px",
  fontSize: "12.5px",
  color: "var(--text-secondary)",
  cursor: "pointer",
  borderRadius: "var(--radius-sm)",
  outline: "none",
  transition: "background var(--dur-fast), color var(--dur-fast)",
  userSelect: "none"
};

const mobileItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "12px 14px",
  fontSize: "14px",
  color: "var(--text-secondary)",
  background: "none",
  border: "none",
  width: "100%",
  textAlign: "left",
  borderRadius: "8px",
  cursor: "pointer",
  outline: "none"
};

const badgeStyle: React.CSSProperties = {
  fontSize: "8.5px",
  background: "var(--surface-3)",
  color: "var(--text-muted)",
  padding: "1px 5px",
  borderRadius: "4px",
  fontWeight: "bold",
  textTransform: "uppercase"
};
