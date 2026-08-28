"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#blog", label: "Blog" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      setMobileOpen(false);
      const targetId = href.substring(1);
      const elem = document.getElementById(targetId);
      if (elem) {
        const top = elem.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: scrolled ? "rgba(5, 7, 5, 0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        transition: "all 0.25s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Left: FreeLAI Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            textDecoration: "none",
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
              priority
              style={{ objectFit: "contain" }}
            />
          </div>
          <Image
            src="/wordmark.png"
            alt="FreeLAI"
            width={95}
            height={21}
            priority
            style={{ height: "20px", width: "auto", objectFit: "contain" }}
          />
        </Link>

        {/* Center: Desktop Nav Links */}
        <div className="desktop-nav-links">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              style={{
                fontSize: "13.5px",
                fontWeight: 500,
                color: "var(--text-secondary)",
                textDecoration: "none",
                transition: "color 0.15s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: CTA + Mobile Menu */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Primary CTA */}
          <Link
            href="/signup"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--color-brand)",
              color: "var(--color-on-brand)",
              padding: "8px 18px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              transition: "transform 0.15s ease, background 0.15s ease",
              boxShadow: "0 2px 8px rgba(139, 207, 53, 0.25)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--color-brand-hover)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--color-brand)";
            }}
          >
            <span>Get Started Free</span>
            <ArrowRight size={14} />
          </Link>

          {/* Mobile Menu Toggle Button (Visible only on mobile/tablet <= 768px) */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div
          style={{
            background: "var(--surface-1)",
            borderBottom: "1px solid var(--border)",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
          className="md:hidden"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--text-secondary)",
                textDecoration: "none",
                padding: "8px 0",
              }}
            >
              {link.label}
            </a>
          ))}
          <div style={{ paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
            <Link
              href="/login"
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--text-muted)",
                textDecoration: "none",
                display: "block",
                padding: "8px 0",
              }}
            >
              Log In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
