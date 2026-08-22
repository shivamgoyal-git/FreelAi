"use client";

import React from "react";

/**
 * GlowArc — Recreates the atmospheric glowing horizon from SCREENSHOT 2.
 *
 * 3-Layer Concentrated Radiance:
 * - Layer 1: Crisp 1.5px bright green horizon line (strongest in center).
 * - Layer 2: Tight, vibrant local halo hugging the line (stdDeviation: 4.5).
 * - Layer 3: Soft atmospheric center bloom (stdDeviation: 15).
 * - Atmosphere: Concentrated elliptical radial light directly behind the center of the horizon.
 * - Star Points: Sparse, soft luminous points providing atmospheric depth.
 */
export default function GlowArc() {
  return (
    <div
      className="glow-arc-wrapper"
      aria-hidden="true"
      style={{
        position: "absolute",
        top: "-45px",
        left: 0,
        width: "100%",
        height: "220px",
        overflowX: "clip",
        overflowY: "visible",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {/* Ambient center atmosphere illumination (soft radial light behind horizon) */}
      <div className="glow-arc-ambient-atmosphere" />

      {/* Horizon Star Field (subtle atmospheric depth) */}
      <div className="star-point" style={{ top: "34px", left: "18%", width: "2.5px", height: "2.5px" }} />
      <div className="star-point" style={{ top: "18px", left: "32%", width: "2px", height: "2px", animationDelay: "1.2s" }} />
      <div className="star-point" style={{ top: "15px", right: "30%", width: "2.5px", height: "2.5px", animationDelay: "0.7s" }} />
      <div className="star-point" style={{ top: "30px", right: "16%", width: "2px", height: "2px", animationDelay: "1.9s" }} />
      <div className="star-point" style={{ top: "68px", left: "8%", width: "2px", height: "2px", animationDelay: "2.4s" }} />
      <div className="star-point" style={{ top: "62px", right: "7%", width: "2px", height: "2px", animationDelay: "1.5s" }} />
      <div className="star-point" style={{ top: "45px", left: "42%", width: "1.5px", height: "1.5px", animationDelay: "0.5s" }} />
      <div className="star-point" style={{ top: "40px", right: "44%", width: "1.5px", height: "1.5px", animationDelay: "1.7s" }} />

      <svg
        viewBox="0 0 1920 220"
        preserveAspectRatio="none"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          overflow: "visible",
        }}
      >
        <defs>
          {/* Main Line Gradient: very bright in center, smooth fade at edges */}
          <linearGradient id="horizonMainGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0" />
            <stop offset="12%" stopColor="var(--color-brand)" stopOpacity="0.3" />
            <stop offset="35%" stopColor="var(--color-brand)" stopOpacity="0.8" />
            <stop offset="50%" stopColor="var(--color-brand)" stopOpacity="1" />
            <stop offset="65%" stopColor="var(--color-brand)" stopOpacity="0.8" />
            <stop offset="88%" stopColor="var(--color-brand)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
          </linearGradient>

          {/* Local Horizon Glow Gradient */}
          <linearGradient id="horizonLocalGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0" />
            <stop offset="20%" stopColor="var(--color-brand)" stopOpacity="0.25" />
            <stop offset="40%" stopColor="var(--color-brand)" stopOpacity="0.75" />
            <stop offset="50%" stopColor="var(--color-brand)" stopOpacity="0.95" />
            <stop offset="60%" stopColor="var(--color-brand)" stopOpacity="0.75" />
            <stop offset="80%" stopColor="var(--color-brand)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
          </linearGradient>

          {/* Broad Center Bloom Gradient */}
          <linearGradient id="horizonBloomGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0" />
            <stop offset="25%" stopColor="var(--color-brand)" stopOpacity="0.15" />
            <stop offset="42%" stopColor="var(--color-brand)" stopOpacity="0.6" />
            <stop offset="50%" stopColor="var(--color-brand)" stopOpacity="0.85" />
            <stop offset="58%" stopColor="var(--color-brand)" stopOpacity="0.6" />
            <stop offset="75%" stopColor="var(--color-brand)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
          </linearGradient>

          {/* Layer 2: Tight Gaussian Blur */}
          <filter id="blurLocalGlow" x="-10%" y="-300%" width="120%" height="700%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" />
          </filter>

          {/* Layer 3: Broad Soft Center Atmospheric Bloom */}
          <filter id="blurAtmosphericBloom" x="-10%" y="-400%" width="120%" height="900%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" />
          </filter>
        </defs>

        {/* LAYER 3: Broad Soft Center Atmospheric Bloom */}
        <path
          d="M -150 160 C 520 20, 1400 20, 2070 160"
          fill="none"
          stroke="url(#horizonBloomGrad)"
          strokeWidth="18"
          filter="url(#blurAtmosphericBloom)"
          className="glow-arc-layer3"
        />

        {/* LAYER 2: Local Horizon Glow (Concentrated Halo) */}
        <path
          d="M -150 160 C 520 20, 1400 20, 2070 160"
          fill="none"
          stroke="url(#horizonLocalGlowGrad)"
          strokeWidth="5"
          filter="url(#blurLocalGlow)"
          className="glow-arc-layer2"
        />

        {/* LAYER 1: Crisp Bright 1.5px Main Horizon Line */}
        <path
          d="M -150 160 C 520 20, 1400 20, 2070 160"
          fill="none"
          stroke="url(#horizonMainGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="glow-arc-layer1"
        />
      </svg>
    </div>
  );
}
