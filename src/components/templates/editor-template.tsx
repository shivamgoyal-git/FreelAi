"use client";

import * as React from "react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";

interface EditorTemplateProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  
  // Left form panel content
  inputForm: React.ReactNode;
  
  // Right preview panel tabs
  previewContent: React.ReactNode;
  analysisContent: React.ReactNode;
  suggestionsContent: React.ReactNode;
  
  // Optional side version panel
  versionSidebar?: React.ReactNode;
}

export function EditorTemplate({
  title,
  subtitle,
  actions,
  inputForm,
  previewContent,
  analysisContent,
  suggestionsContent,
  versionSidebar,
}: EditorTemplateProps) {
  const [mobileTab, setMobileTab] = useState("input");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", height: "100%" }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: "12px" }}>
        <div>
          <h1 className="page-header-title">{title}</h1>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
        {actions && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {actions}
          </div>
        )}
      </div>

      {/* Desktop view: Left input form, Right output preview/tabs */}
      <div className="desktop-only" style={{ display: "grid", gridTemplateColumns: versionSidebar ? "300fr 450fr 250fr" : "380fr 620fr", gap: "20px", alignItems: "start" }}>
        {/* Left Side: Input Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
          {inputForm}
        </div>

        {/* Center / Right Side: Preview Tabs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
          <Tabs defaultValue="preview" style={{ width: "100%" }}>
            <TabsList style={{ marginBottom: "12px" }}>
              <TabsTrigger value="preview">Proposal Preview</TabsTrigger>
              <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
              <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
            </TabsList>
            <TabsContent value="preview">{previewContent}</TabsContent>
            <TabsContent value="analysis">{analysisContent}</TabsContent>
            <TabsContent value="suggestions">{suggestionsContent}</TabsContent>
          </Tabs>
        </div>

        {/* Optional Right Version History Sidebar */}
        {versionSidebar && (
          <div style={{ minWidth: 0 }}>
            {versionSidebar}
          </div>
        )}
      </div>

      {/* Mobile view: Swipeable / Tab-based UX (Input, Preview, Analysis, Suggestions) */}
      <div className="mobile-only" style={{ width: "100%" }}>
        <Tabs value={mobileTab} onValueChange={setMobileTab} style={{ width: "100%" }}>
          <TabsList style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", marginBottom: "16px" }}>
            <TabsTrigger value="input" style={{ fontSize: "11px", padding: "8px 0" }}>Input</TabsTrigger>
            <TabsTrigger value="preview" style={{ fontSize: "11px", padding: "8px 0" }}>Preview</TabsTrigger>
            <TabsTrigger value="analysis" style={{ fontSize: "11px", padding: "8px 0" }}>Analysis</TabsTrigger>
            <TabsTrigger value="suggestions" style={{ fontSize: "11px", padding: "8px 0" }}>Tips</TabsTrigger>
          </TabsList>
          <TabsContent value="input">{inputForm}</TabsContent>
          <TabsContent value="preview">{previewContent}</TabsContent>
          <TabsContent value="analysis">{analysisContent}</TabsContent>
          <TabsContent value="suggestions">{suggestionsContent}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default EditorTemplate;
