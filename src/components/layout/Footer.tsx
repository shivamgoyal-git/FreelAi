"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, Clock } from "lucide-react";

const footerColumns = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Integrations", href: "#" },
    { label: "Changelog", href: "#" },
  ],
  Resources: [
    { label: "Blog", href: "#blog" },
    { label: "Help Center", href: "#" },
    { label: "Templates", href: "#" },
    { label: "Guides", href: "#" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

function LinkedInIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.9 0-1.63.73-1.63 1.63 0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.63-1.63-1.63Z" />
    </svg>
  );
}

function TwitterIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

const socialIcons = [
  { Icon: LinkedInIcon, href: "https://linkedin.com", label: "LinkedIn" },
  { Icon: TwitterIcon, href: "https://twitter.com", label: "Twitter" },
  { Icon: InstagramIcon, href: "https://instagram.com", label: "Instagram" },
  { Icon: YoutubeIcon, href: "https://youtube.com", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg-base)",
        borderTop: "1px solid var(--border)",
        paddingTop: "64px",
        paddingBottom: "32px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Main Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1.2fr",
            gap: "36px",
            marginBottom: "52px",
          }}
          className="grid-responsive-footer"
        >
          {/* Brand Info */}
          <div>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "9px",
                textDecoration: "none",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  src="/logo.png"
                  alt="FreeLAI Logo"
                  width={34}
                  height={34}
                  style={{ objectFit: "contain" }}
                />
              </div>
              <Image
                src="/wordmark.png"
                alt="FreeLAI"
                width={95}
                height={21}
                style={{ height: "20px", width: "auto", objectFit: "contain" }}
              />
            </Link>

            <p
              style={{
                fontSize: "13px",
                color: "var(--text-muted)",
                lineHeight: 1.6,
                maxWidth: "260px",
                margin: "0 0 20px 0",
              }}
            >
              The all-in-one AI platform for freelancers. Manage, automate, and grow your business with ease.
            </p>

            {/* Social Links */}
            <div style={{ display: "flex", gap: "10px" }}>
              {socialIcons.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    background: "var(--surface-1)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-brand)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--color-brand)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
                  }}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "16px",
              }}
            >
              Product
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {footerColumns.Product.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      textDecoration: "none",
                      transition: "color 0.15s ease",
                    }}
                    onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--text-primary)")}
                    onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--text-muted)")}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "16px",
              }}
            >
              Resources
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {footerColumns.Resources.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      textDecoration: "none",
                      transition: "color 0.15s ease",
                    }}
                    onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--text-primary)")}
                    onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--text-muted)")}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "16px",
              }}
            >
              Company
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {footerColumns.Company.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      textDecoration: "none",
                      transition: "color 0.15s ease",
                    }}
                    onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--text-primary)")}
                    onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--text-muted)")}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "16px",
              }}
            >
              Contact
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Mail size={14} color="var(--color-brand)" />
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>hello@freelai.com</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Phone size={14} color="var(--color-brand)" />
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>+91 98765 43210</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={14} color="var(--color-brand)" />
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Available 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: 0 }}>
            © 2026 FreeLAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
