"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import ProductShowcase from "@/components/landing/ProductShowcase";
import FeaturesSection from "@/components/landing/FeaturesSection";
import AIIntelligenceSection from "@/components/landing/AIIntelligenceSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FinalCTASection from "@/components/landing/FinalCTASection";

export default function LandingPage() {
  return (
    <div
      style={{
        background: "var(--bg-base)",
        minHeight: "100vh",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body), sans-serif",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Top Sticky Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Product Showcase Centerpiece */}
      <ProductShowcase />

      {/* 6-Card Features / Capabilities */}
      <FeaturesSection />

      {/* AI Business Intelligence & Analytics Section */}
      <AIIntelligenceSection />

      {/* How FreelAI Works (5-Step Process + Planet Testimonial) */}
      <HowItWorksSection />

      {/* Final Action Banner */}
      <FinalCTASection />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
