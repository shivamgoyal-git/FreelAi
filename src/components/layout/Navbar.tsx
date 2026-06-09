"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Testimonials" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
            gap: "10px",
            textDecoration: "none",
          }}
        >
          {/* Simple amber square logo */}
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 7L7 13L1 7L7 1Z" fill="var(--text-on-primary)" />
            </svg>
          </div>
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
          <Link href="/login" className="btn btn-ghost btn-sm">
            Log In
          </Link>
          <Link href="/signup" className="btn btn-primary btn-sm">
            Get Started
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
            <Link href="/login" className="btn btn-secondary" onClick={() => setMobileOpen(false)}>
              Log In
            </Link>
            <Link href="/signup" className="btn btn-primary" onClick={() => setMobileOpen(false)}>
              Get Started Free
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
