"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { IProposalIntelligence } from "@/lib/proposal-intelligence";

interface ProposalRadarChartProps {
  intelligence: IProposalIntelligence;
  height?: number;
}

const DIM_LABELS: Record<string, string> = {
  professionalism: "Professional",
  personalization: "Personal",
  readability: "Readable",
  confidence: "Confidence",
  structure: "Structure",
  grammar: "Grammar",
  callToAction: "CTA",
  valueProp: "Value",
  clientFocus: "Client Focus",
  pricingClarity: "Pricing",
  communicationStyle: "Comm.",
  completeness: "Complete",
};

export function ProposalRadarChart({ intelligence, height = 300 }: ProposalRadarChartProps) {
  const data = Object.entries(intelligence.sectionScores).map(([key, field]) => ({
    dimension: DIM_LABELS[key] ?? key,
    score: field.score,
    fullMark: 100,
  }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 11, fill: "var(--text-muted)", fontWeight: 600 }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="var(--color-brand)"
            fill="var(--color-brand)"
            fillOpacity={0.18}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface-2)",
              border: "0.5px solid var(--border)",
              borderRadius: "var(--radius)",
              fontSize: "12px",
              color: "var(--text-primary)",
            }}
            formatter={(value) => [`${value}/100`, "Score"]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
