"use client";

import Link from "next/link";
import { Globe, Mail, ExternalLink } from "lucide-react";



const footerLinks = {
  Platform: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Changelog", href: "#" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Community", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Status", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Licenses", href: "#" },
  ],
};

const socialLinks = [
  { Icon: Globe, href: "#", label: "Twitter / X" },
  { Icon: ExternalLink, href: "#", label: "LinkedIn" },
  { Icon: Mail, href: "#", label: "Email" },
];


export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-default)",
        paddingTop: "64px",
        paddingBottom: "32px",
      }}
    >
      <div className="container-main">
        {/* Top Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
            gap: "48px",
            marginBottom: "56px",
          }}
        >
          {/* Brand */}
          <div style={{ gridColumn: "span 1" }}>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                textDecoration: "none",
                marginBottom: "16px",
              }}
            >
              <img
                src="/logo.png"
                alt="FreelAi Logo"
                style={{
                  width: "38px",
                  height: "38px",
                  margin: "-4px -6px -4px -4px",
                  borderRadius: "8px",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <span
                className="font-heading"
                style={{ fontSize: "18px", color: "var(--text-primary)" }}
              >
                Freel<span style={{ color: "var(--primary)" }}>Ai</span>
              </span>
            </Link>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.7", maxWidth: "220px" }}>
              The AI-powered platform built for creative freelancers to work smarter and earn bigger.
            </p>
            {/* Socials */}
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              {socialLinks.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--primary)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-default)";
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "16px",
                }}
              >
                {category}
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      style={{
                        fontSize: "14px",
                        color: "var(--text-muted)",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--primary)")}
                      onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--text-muted)")}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid var(--border-default)",
            paddingTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p style={{ fontSize: "13px", color: "var(--text-subtle)" }}>
            © {new Date().getFullYear()} FreelAi, Inc. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  fontSize: "13px",
                  color: "var(--text-subtle)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--primary)")}
                onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--text-subtle)")}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
