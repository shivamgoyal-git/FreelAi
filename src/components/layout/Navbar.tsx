"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { href: "#tour", label: "Product Tour" },
  { href: "#audience", label: "For Freelancers" },
  { href: "#ai-partner", label: "AI Business Partner" },
  { href: "#journey", label: "Workflow" },
  { href: "#pricing", label: "Pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="navbar"
      style={{
        boxShadow: scrolled ? "0 1px 0 var(--border-default)" : "none",
      }}
    >
      <div
        className="container-main"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            textDecoration: "none",
          }}
        >
          {/* Simple logo image */}
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
            style={{ fontSize: "18px", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Freel<span style={{ color: "var(--primary)" }}>Ai</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div
          className="desktop-nav"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="btn btn-ghost btn-sm"
              style={{ fontWeight: 500, fontSize: "14px" }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggle}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius)",
              border: "0.5px solid var(--border)",
              background: "transparent",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link href="/signup">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-primary)",
              padding: "4px",
            }}
            className="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div
          style={{
            borderTop: "1px solid var(--border-default)",
            padding: "16px 24px 20px",
            background: "var(--bg-surface)",
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block",
                padding: "11px 0",
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontWeight: 500,
                fontSize: "14px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              {link.label}
            </a>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "18px" }}>
            <Link href="/login">
              <Button variant="secondary" onClick={() => setMobileOpen(false)} style={{ width: "100%", justifyContent: "center" }}>
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" onClick={() => setMobileOpen(false)} style={{ width: "100%", justifyContent: "center" }}>
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      )}
      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
