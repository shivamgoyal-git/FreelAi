"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Sparkles,
  Zap,
  Code2,
  Terminal,
  Shield,
  FileText,
  DollarSign,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  HelpCircle,
  Hash,
  MessageSquare,
  Layers,
  Cpu,
  Bookmark,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

interface DocContentBlock {
  heading: string;
  body: string;
  codeSnippet?: {
    curl: string;
    typescript: string;
    python: string;
  };
  callout?: {
    type: "note" | "tip" | "warning";
    text: string;
  };
}

interface DocTopic {
  id: string;
  title: string;
  category: string;
  description: string;
  content: DocContentBlock[];
}

const DOC_CATEGORIES = [
  {
    name: "Getting Started",
    topics: [
      { id: "overview", label: "Overview & Architecture" },
      { id: "quickstart", label: "Quickstart Guide" },
      { id: "authentication", label: "Authentication & Keys" },
    ],
  },
  {
    name: "AI Proposal Engine",
    topics: [
      { id: "scoping-rules", label: "Scoping Rules & Prompts" },
      { id: "match-confidence", label: "Match Confidence Score" },
      { id: "export-formats", label: "Exporting Markdown & PDF" },
    ],
  },
  {
    name: "Client CRM & Invoicing",
    topics: [
      { id: "stripe-integration", label: "Stripe Billing & Escrow" },
      { id: "dunning-automations", label: "Dunning & Auto-Reminders" },
      { id: "client-health", label: "Client Health Signals" },
    ],
  },
  {
    name: "API & Developer Tools",
    topics: [
      { id: "rest-api", label: "REST API Reference" },
      { id: "webhooks", label: "Webhook Events" },
    ],
  },
];

const DOC_TOPICS_DATA: Record<string, DocTopic> = {
  overview: {
    id: "overview",
    title: "Overview & Architecture",
    category: "Getting Started",
    description: "Learn how FreelAI integrates proposal scoping, client CRM management, and Stripe dunning into a unified command center.",
    content: [
      {
        heading: "What is FreelAI?",
        body: "FreelAI is a specialized AI-powered SaaS operating system for technical freelancers, senior software consultants, and boutique agencies. It combines multi-tiered proposal generation with automated invoice collection and contract intelligence.",
      },
      {
        heading: "Core System Pillars",
        body: "The platform operates across three interconnected layers: 1) The AI Proposal Engine, which parses RFPs and outputs client-ready Markdown scopes; 2) The Client CRM, which tracks contract lifetime value (LTV) and relationship health; and 3) The Dunning & Invoicing Engine, which connects directly to Stripe.",
        callout: {
          type: "tip",
          text: "Pro Tip: Link your GitHub or portfolio case studies in Profile Settings to let the AI auto-match past technical projects into pitch briefs.",
        },
      },
    ],
  },
  quickstart: {
    id: "quickstart",
    title: "Quickstart Guide",
    category: "Getting Started",
    description: "Get up and running with your first AI-generated proposal in under two minutes.",
    content: [
      {
        heading: "Step 1: Set Up Profile Skills",
        body: "Navigate to Dashboard > Profile and configure your primary discipline (e.g. Full-Stack Engineering, Mobile UX Audit) along with your standard rate card.",
      },
      {
        heading: "Step 2: Generate Your First Proposal",
        body: "Go to the Proposal Studio, paste any Upwork description or client RFP brief, select your target budget, and click 'Generate Proposal'.",
        codeSnippet: {
          curl: `curl -X POST https://api.freelai.com/v1/proposals/generate \\\n  -H 'Authorization: Bearer fl_live_9981273x' \\\n  -H 'Content-Type: application/json' \\\n  -d '{"jobPost": "Build Next.js 15 SaaS dashboard", "budget": 12000}'`,
          typescript: `import { FreelAI } from '@freelai/sdk';\n\nconst freelai = new FreelAI({ apiKey: process.env.FREELAI_API_KEY });\n\nconst proposal = await freelai.proposals.generate({\n  clientName: "Aether Capital",\n  jobPost: "Build Next.js 15 SaaS dashboard",\n  budget: 12000,\n});`,
          python: `from freelai import FreelAI\n\nclient = FreelAI(api_key="fl_live_9981273x")\nproposal = client.proposals.generate(\n    client_name="Aether Capital",\n    job_post="Build Next.js 15 SaaS dashboard",\n    budget=12000\n)`,
        },
      },
    ],
  },
  authentication: {
    id: "authentication",
    title: "Authentication & Keys",
    category: "Getting Started",
    description: "Securely authenticate API requests using secret API tokens.",
    content: [
      {
        heading: "API Key Management",
        body: "Generate production API keys from your Dashboard Settings. Always keep secret keys secure in server-side environment variables (`.env.local`).",
        codeSnippet: {
          curl: `curl https://api.freelai.com/v1/user/profile \\\n  -H "Authorization: Bearer fl_live_key_99812"`,
          typescript: `// Load secret key in Next.js Server Components\nconst apiKey = process.env.FREELAI_API_KEY;`,
          python: `import os\napi_key = os.environ.get("FREELAI_API_KEY")`,
        },
      },
    ],
  },
  "scoping-rules": {
    id: "scoping-rules",
    title: "Scoping Rules & Prompts",
    category: "AI Proposal Engine",
    description: "Understand how FreelAI structures multi-tiered proposals and calculates scope boundaries.",
    content: [
      {
        heading: "3-Tiered Scope Architecture",
        body: "Every proposal compiled by FreelAI generates three distinct tiers (Basic, Standard, and Premium) to give clients options while protecting your profit margins.",
      },
      {
        heading: "Customizing Scope Prompts",
        body: "You can adjust proposal tone (Professional, Confident, Casual, Minimal) in the Studio parameters. The AI automatically formats deliverables into Markdown sections.",
        codeSnippet: {
          curl: `# Query proposal scope options\ncurl https://api.freelai.com/v1/proposals/templates`,
          typescript: `const template = await freelai.templates.get('saas-development');`,
          python: `template = client.templates.get('saas-development')`,
        },
      },
    ],
  },
  "match-confidence": {
    id: "match-confidence",
    title: "Match Confidence Score",
    category: "AI Proposal Engine",
    description: "How FreelAI verifies client alignment and calculates portfolio match percentages.",
    content: [
      {
        heading: "Confidence Score Formula",
        body: "Match confidence (0-100%) measures tech stack overlap, client budget feasibility, and past portfolio proof. A score above 85% indicates strong proposal alignment.",
        callout: {
          type: "note",
          text: "High-confidence proposals (>85%) achieve a 42% higher win rate on platforms like Upwork and LinkedIn.",
        },
      },
    ],
  },
  "export-formats": {
    id: "export-formats",
    title: "Exporting Markdown & PDF",
    category: "AI Proposal Engine",
    description: "Export clean proposal documents into standard Markdown (.md) or print formatted PDFs.",
    content: [
      {
        heading: "Export Formats",
        body: "Proposal documents can be copied directly to clipboard, downloaded as UTF-8 Markdown files, or formatted into print-ready PDF client pitches.",
      },
    ],
  },
  "stripe-integration": {
    id: "stripe-integration",
    title: "Stripe Billing & Escrow",
    category: "Client CRM & Invoicing",
    description: "Connect your Stripe account to trigger automated deposit collection and milestone invoicing.",
    content: [
      {
        heading: "Direct Stripe Webhooks",
        body: "FreelAI connects directly to your Stripe merchant account. When an invoice status updates to paid, your dashboard settled revenue metrics update instantly in real time.",
        callout: {
          type: "tip",
          text: "FreelAI never takes transaction fees from your invoices. 100% of your earnings go to your Stripe account.",
        },
      },
    ],
  },
  "dunning-automations": {
    id: "dunning-automations",
    title: "Dunning & Auto-Reminders",
    category: "Client CRM & Invoicing",
    description: "Automate polite email payment reminders for overdue balances.",
    content: [
      {
        heading: "Dunning Rules",
        body: "Automated reminders send at 3 days before due date, on due date, and at 7 days overdue with professional followup templates.",
      },
    ],
  },
  "client-health": {
    id: "client-health",
    title: "Client Health Signals",
    category: "Client CRM & Invoicing",
    description: "Monitor client relationship scores, communication velocity, and invoice promptness.",
    content: [
      {
        heading: "Health Signals",
        body: "Accounts are tagged Healthy, Pending, or At Risk based on payment velocity and active project timelines.",
      },
    ],
  },
  "rest-api": {
    id: "rest-api",
    title: "REST API Reference",
    category: "API & Developer Tools",
    description: "Integrate FreelAI proposal generation into your custom CLI or internal agency tools.",
    content: [
      {
        heading: "Endpoints Overview",
        body: "All API requests return standardized JSON responses with HTTP status codes.",
        codeSnippet: {
          curl: `curl https://api.freelai.com/v1/proposals \\\n  -H "Authorization: Bearer fl_live_key"`,
          typescript: `const list = await freelai.proposals.list();`,
          python: `proposals = client.proposals.list()`,
        },
      },
    ],
  },
  webhooks: {
    id: "webhooks",
    title: "Webhook Events",
    category: "API & Developer Tools",
    description: "Listen for real-time events like proposal.won or invoice.paid.",
    content: [
      {
        heading: "Supported Webhook Events",
        body: "Configure HTTPS endpoints to receive JSON payloads whenever milestone events occur in your workflow.",
        codeSnippet: {
          curl: `# Test webhook signature\ncurl -X POST https://your-server.com/api/freelai-webhook \\\n  -H 'X-FreelAI-Signature: sha256=...'`,
          typescript: `// Next.js Route Handler for Webhooks\nexport async function POST(req: Request) {\n  const event = await req.json();\n  if (event.type === 'proposal.won') {\n    console.log('Contract won!', event.data);\n  }\n  return Response.json({ received: true });\n}`,
          python: `@app.route('/webhook', methods=['POST'])\ndef webhook():\n    event = request.json\n    if event['type'] == 'proposal.won':\n        print('Contract won!')\n    return {'status': 'success'}`,
        },
      },
    ],
  },
};

export default function DocsPage() {
  const [activeTopicId, setActiveTopicId] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLang, setActiveLang] = useState<"curl" | "typescript" | "python">("typescript");
  const [copiedCode, setCopiedCode] = useState(false);
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);

  const activeTopic = DOC_TOPICS_DATA[activeTopicId] || DOC_TOPICS_DATA.overview;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", color: "var(--text-primary)", fontFamily: "var(--font-inter-variable), sans-serif" }}>
      <Navbar />

      {/* Docs Header Banner */}
      <div style={{ background: "var(--surface-1)", borderBottom: "0.5px solid var(--border)", padding: "20px 24px" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <BookOpen size={15} color="var(--color-brand)" />
              <span style={{ fontSize: "11px", fontWeight: 590, fontFamily: "var(--font-berkeley-mono), monospace", color: "var(--color-brand)" }}>
                FREELAI DOCUMENTATION & API MANUAL
              </span>
            </div>
            <h1 className="font-heading" style={{ fontSize: "22px", fontWeight: 590, letterSpacing: "-0.015em", color: "var(--text-primary)", margin: "4px 0 0 0" }}>
              Developer Guides, API Specs & Architecture
            </h1>
          </div>

          {/* Interactive Search Box with ⌘K Badge */}
          <div style={{ position: "relative", width: "300px" }}>
            <Search size={13} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation..."
              style={{
                width: "100%",
                height: "36px",
                paddingLeft: "34px",
                paddingRight: "44px",
                background: "var(--bg-base)",
                border: "0.5px solid var(--border)",
                borderRadius: "var(--radius-inputs)",
                fontSize: "12px",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "10px",
                fontFamily: "var(--font-berkeley-mono), monospace",
                background: "var(--surface-2)",
                border: "0.5px solid var(--border)",
                color: "var(--text-muted)",
                padding: "1px 5px",
                borderRadius: "4px",
              }}
            >
              ⌘K
            </span>
          </div>
        </div>
      </div>

      {/* Docs Main Layout: 3 Columns (Left Navigation | Main Article | Right TOC) */}
      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "220px 1fr 200px", gap: "28px", alignItems: "start" }} className="grid-responsive-3">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "18px", position: "sticky", top: "74px" }}>
          {DOC_CATEGORIES.map((cat) => (
            <div key={cat.name} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "10.5px", fontWeight: 590, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                {cat.name}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {cat.topics
                  .filter((t) => !searchQuery || t.label.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTopicId(t.id)}
                      style={{
                        padding: "5px 10px",
                        fontSize: "12px",
                        fontWeight: activeTopicId === t.id ? 510 : 400,
                        textAlign: "left",
                        background: activeTopicId === t.id ? "var(--surface-2)" : "transparent",
                        color: activeTopicId === t.id ? "var(--color-brand)" : "var(--text-secondary)",
                        border: "none",
                        borderRadius: "var(--radius-buttons)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all var(--dur-fast)",
                      }}
                    >
                      <span>{t.label}</span>
                      {activeTopicId === t.id && <ChevronRight size={12} color="var(--color-brand)" />}
                    </button>
                  ))}
              </div>
            </div>
          ))}

          {/* Direct Studio Links */}
          <div style={{ paddingTop: "12px", borderTop: "0.5px solid var(--border)", display: "flex", flexDirection: "column", gap: "6px" }}>
            <Link href="/dashboard" style={{ fontSize: "11.5px", color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
              <Zap size={12} color="var(--color-brand)" /> Dashboard
            </Link>
            <Link href="/dashboard/proposals" style={{ fontSize: "11.5px", color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
              <FileText size={12} color="var(--color-pulse-green)" /> Proposal Studio
            </Link>
          </div>
        </aside>

        {/* CENTER MAIN CONTENT ARTICLE */}
        <main style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 }}>
          
          {/* Breadcrumb Header */}
          <div style={{ borderBottom: "0.5px solid var(--border)", paddingBottom: "14px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <span>Docs</span>
              <span>/</span>
              <span style={{ color: "var(--text-secondary)" }}>{activeTopic.category}</span>
            </div>
            <h2 className="font-heading" style={{ fontSize: "26px", fontWeight: 590, letterSpacing: "-0.018em", color: "var(--text-primary)", margin: 0 }}>
              {activeTopic.title}
            </h2>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", marginTop: "6px", lineHeight: 1.5, margin: "6px 0 0 0" }}>
              {activeTopic.description}
            </p>
          </div>

          {/* Article Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {activeTopic.content.map((block, idx) => (
              <div key={idx} id={`section-${idx}`} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <h3 className="font-heading" style={{ fontSize: "17px", fontWeight: 510, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.012em" }}>
                  {block.heading}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  {block.body}
                </p>

                {/* Callout Container */}
                {block.callout && (
                  <div
                    style={{
                      padding: "12px 14px",
                      background: block.callout.type === "tip" ? "rgba(228,242,34,0.06)" : "rgba(99,102,241,0.06)",
                      border: `0.5px solid ${block.callout.type === "tip" ? "var(--color-brand)" : "var(--color-iris-violet)"}`,
                      borderLeft: `3px solid ${block.callout.type === "tip" ? "var(--color-brand)" : "var(--color-iris-violet)"}`,
                      borderRadius: "var(--radius-inputs)",
                      fontSize: "12px",
                      color: "var(--text-primary)",
                      lineHeight: 1.5,
                    }}
                  >
                    {block.callout.text}
                  </div>
                )}

                {/* Multi-Language Code Snippet Container */}
                {block.codeSnippet && (
                  <div
                    style={{
                      background: "var(--surface-1)",
                      border: "0.5px solid var(--border)",
                      borderRadius: "var(--radius-cards)",
                      overflow: "hidden",
                      margin: "6px 0",
                    }}
                  >
                    {/* Header Code Language Selector */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 12px", background: "var(--bg-base)", borderBottom: "0.5px solid var(--border)" }}>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {(["typescript", "curl", "python"] as const).map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setActiveLang(lang)}
                            style={{
                              padding: "2px 8px",
                              fontSize: "10.5px",
                              fontFamily: "var(--font-berkeley-mono), monospace",
                              fontWeight: 590,
                              borderRadius: "4px",
                              border: "none",
                              background: activeLang === lang ? "var(--surface-2)" : "transparent",
                              color: activeLang === lang ? "var(--color-brand)" : "var(--text-muted)",
                              cursor: "pointer",
                              textTransform: "uppercase",
                            }}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handleCopyCode(block.codeSnippet![activeLang])}
                        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}
                      >
                        {copiedCode ? <Check size={11} color="var(--color-pulse-green)" /> : <Copy size={11} />}
                        <span>{copiedCode ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    {/* Monospaced Code Text area */}
                    <pre
                      style={{
                        padding: "14px",
                        margin: 0,
                        fontSize: "11.5px",
                        fontFamily: "var(--font-berkeley-mono), monospace",
                        lineHeight: 1.55,
                        color: "var(--text-secondary)",
                        overflowX: "auto",
                      }}
                    >
                      {block.codeSnippet[activeLang]}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Helpful Feedback Footer */}
          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "0.5px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Was this page helpful?</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => setFeedback("yes")}
                style={{
                  padding: "4px 10px",
                  fontSize: "11.5px",
                  background: feedback === "yes" ? "rgba(39,166,68,0.12)" : "transparent",
                  color: feedback === "yes" ? "var(--color-pulse-green)" : "var(--text-secondary)",
                  border: "0.5px solid var(--border)",
                  borderRadius: "var(--radius-buttons)",
                  cursor: "pointer",
                }}
              >
                Yes
              </button>
              <button
                onClick={() => setFeedback("no")}
                style={{
                  padding: "4px 10px",
                  fontSize: "11.5px",
                  background: feedback === "no" ? "rgba(235,87,87,0.12)" : "transparent",
                  color: feedback === "no" ? "var(--color-coral-red)" : "var(--text-secondary)",
                  border: "0.5px solid var(--border)",
                  borderRadius: "var(--radius-buttons)",
                  cursor: "pointer",
                }}
              >
                No
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR TABLE OF CONTENTS */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "12px", position: "sticky", top: "74px" }}>
          <span style={{ fontSize: "10.5px", fontWeight: 590, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
            On this page
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderLeft: "0.5px solid var(--border)", paddingLeft: "10px" }}>
            {activeTopic.content.map((block, idx) => (
              <a
                key={idx}
                href={`#section-${idx}`}
                style={{
                  fontSize: "11.5px",
                  color: "var(--text-muted)",
                  textDecoration: "none",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {block.heading}
              </a>
            ))}
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
}
