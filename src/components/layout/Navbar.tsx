"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, Sparkles } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
  { href: "/docs", label: "Docs" },
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
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--surface-1)",
        borderBottom: "0.5px solid var(--border)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="container-main"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "58px",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
          }}
        >
          <img
            src="/logo.png"
            alt="FreelAi Logo"
            style={{
              width: "36px",
              height: "36px",
              margin: "-3px -4px -3px -3px",
              borderRadius: "8px",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          <span
            className="font-heading"
            style={{
              fontSize: "16px",
              fontWeight: 590,
              color: "var(--text-primary)",
              letterSpacing: "-0.015em",
            }}
          >
            Freel<span style={{ color: "var(--color-brand)" }}>AI</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div
          className="desktop-nav"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => {
                if (link.href.includes("#")) {
                  const hash = link.href.split("#")[1];
                  const target = document.getElementById(hash);
                  if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: "smooth" });
                  }
                }
              }}
              style={{
                fontSize: "12.5px",
                fontWeight: 510,
                color: "var(--text-secondary)",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "var(--radius-buttons)",
                transition: "color var(--dur-fast), background var(--dur-fast)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
                (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
              }}
            >
              {link.label}
            </Link>
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
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-buttons)",
              border: "0.5px solid var(--border)",
              background: "transparent",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background var(--dur-fast)",
            }}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <Link href="/signup">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>

          {/* Mobile menu button */}
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
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
