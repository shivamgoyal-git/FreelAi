import connectDB from "./mongodb";
import PortfolioProject, { IPortfolioProject } from "@/models/PortfolioProject";
import type { JobAnalysis } from "./job-analyzer";
// Also accepts JobIntelligence from the new pipeline (duck-typed: same required fields)
type JobLike = Pick<JobAnalysis, "requiredSkills" | "technologies" | "importantKeywords" | "clientTone" | "communicationStyle" | "deliverables">;

export interface IMatchedPortfolioProject {
  project: {
    _id: string;
    title: string;
    description: string;
    skills: string[];
    link: string;
  };
  matchScore: number; // 0–100
  matchReason: string;
  /** Skills from the freelancer's portfolio that matched the job requirements */
  skillsMatched: string[];
  /** Technologies from the portfolio that matched the job requirements */
  technologiesMatched: string[];
}

export class PortfolioMatcher {
  /**
   * Stage 2: Automatically find the most relevant portfolio projects.
   */
  static async findTopMatches(
    userId: string,
    jobAnalysis: JobLike,
    limit: number = 3
  ): Promise<IMatchedPortfolioProject[]> {
    await connectDB();

    const projects = await PortfolioProject.find({ userId });
    if (projects.length === 0) {
      return [];
    }

    const matched: IMatchedPortfolioProject[] = [];

    for (const proj of projects) {
      const projSkills = proj.skills.map((s) => s.toLowerCase());
      const jobSkills = jobAnalysis.requiredSkills.map((s) => s.toLowerCase());
      const jobTech = jobAnalysis.technologies.map((t) => t.toLowerCase());
      const importantKws = jobAnalysis.importantKeywords?.map((k) => k.toLowerCase()) || [];
      const projDesc = proj.description.toLowerCase();
      const projTitle = proj.title.toLowerCase();

      // Check skill or keyword overlap
      const hasSkillOverlap = projSkills.some((ps) => 
        jobSkills.some((js) => js.includes(ps) || ps.includes(js)) ||
        jobTech.some((jt) => jt.includes(ps) || ps.includes(jt))
      );

      const hasKeywordOverlap = importantKws.some((kw) => 
        projDesc.includes(kw) || projTitle.includes(kw)
      );

      // CRITICAL PORTFOLIO FILTER: Reject portfolio project if it has zero skill and keyword overlap
      if (!hasSkillOverlap && !hasKeywordOverlap) {
        console.log(`[PortfolioMatcher] Rejecting project "${proj.title}" due to zero skill or keyword overlap.`);
        continue;
      }

      const score = this.calculateWeightedScore(proj, jobAnalysis);
      
      // Reject if matchScore is below threshold (45%)
      if (score < 45) {
        console.log(`[PortfolioMatcher] Rejecting project "${proj.title}" due to low match score (${Math.round(score)}%).`);
        continue;
      }

      const reason = this.generateMatchReason(proj, jobAnalysis, score);

      // Compute matched skills and technologies for blueprint builder
      const projSkillsLower = proj.skills.map((s) => s.toLowerCase());
      const jobSkillsLower = jobAnalysis.requiredSkills.map((s) => s.toLowerCase());
      const jobTechLower = jobAnalysis.technologies.map((t) => t.toLowerCase());

      const matchedSkills = proj.skills.filter((ps) =>
        jobSkillsLower.some((js) => js.includes(ps.toLowerCase()) || ps.toLowerCase().includes(js))
      );
      const matchedTechs = proj.skills.filter((ps) =>
        jobTechLower.some((jt) => jt.includes(ps.toLowerCase()) || ps.toLowerCase().includes(jt))
      );

      matched.push({
        project: {
          _id: String(proj._id),
          title: proj.title,
          description: proj.description,
          skills: proj.skills,
          link: proj.link,
        },
        matchScore: Math.round(score),
        matchReason: reason,
        skillsMatched: matchedSkills,
        technologiesMatched: matchedTechs,
      });
    }

    // Sort by score descending and return top limit
    return matched.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
  }

  /**
   * Weighted scoring formula:
   *  - Skill Match: 35%
   *  - Industry Match: 25%
   *  - Technology Match: 20%
   *  - Deliverable Match: 15%
   *  - Featured Portfolio Bonus: 5%
   */
  private static calculateWeightedScore(proj: IPortfolioProject, job: JobLike): number {
    let skillScore = 0;
    let industryScore = 0;
    let techScore = 0;
    let deliverableScore = 0;
    let featuredBonus = 0;

    const projSkills = proj.skills.map((s) => s.toLowerCase());
    const jobSkills = job.requiredSkills.map((s) => s.toLowerCase());
    const jobTech = job.technologies.map((t) => t.toLowerCase());
    const projDesc = proj.description.toLowerCase();
    const projTitle = proj.title.toLowerCase();

    // 1. Skill Match (35%)
    if (jobSkills.length > 0) {
      const matchCount = projSkills.filter((ps) => jobSkills.some((js) => js.includes(ps) || ps.includes(js))).length;
      skillScore = (matchCount / jobSkills.length) * 100;
    } else {
      skillScore = 50; // Neutral default
    }

    // 2. Industry / Category Match (25%)
    const industries = ["saas", "mobile", "e-commerce", "ecommerce", "marketing", "corporate", "branding", "audit", "ux", "design", "development", "video", "editing", "storytelling"];
    const matchedIndustries = industries.filter((ind) => {
      const inJob = job.clientTone.toLowerCase().includes(ind) || job.communicationStyle.toLowerCase().includes(ind) || job.requiredSkills.some((s) => s.toLowerCase().includes(ind));
      const inProj = projDesc.includes(ind) || projTitle.includes(ind);
      return inJob && inProj;
    });
    industryScore = matchedIndustries.length > 0 ? 100 : 40;

    // 3. Technology Match (20%)
    if (jobTech.length > 0) {
      const matchCount = projSkills.filter((ps) => jobTech.some((jt) => jt.includes(ps) || ps.includes(jt))).length;
      techScore = (matchCount / jobTech.length) * 100;
    } else {
      techScore = 50;
    }

    // 4. Deliverable Match (15%)
    const matchedDeliverables = job.deliverables.filter((del) => {
      const delWords = del.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
      return delWords.some((word) => projDesc.includes(word));
    });
    deliverableScore = job.deliverables.length > 0 ? (matchedDeliverables.length / job.deliverables.length) * 100 : 50;

    // 5. Featured Portfolio Bonus (5%)
    if (projDesc.includes("featured") || projDesc.includes("live") || projDesc.includes("production") || (proj.link && proj.link.length > 10)) {
      featuredBonus = 100;
    }

    // Weighted average
    const finalScore =
      skillScore * 0.35 +
      industryScore * 0.25 +
      techScore * 0.20 +
      deliverableScore * 0.15 +
      featuredBonus * 0.05;

    return Math.min(100, Math.max(0, finalScore));
  }

  private static generateMatchReason(proj: IPortfolioProject, job: JobLike, score: number): string {
    const projSkills = proj.skills.map((s) => s.toLowerCase());
    const jobSkills = job.requiredSkills.map((s) => s.toLowerCase());
    const matches = projSkills.filter((ps) => jobSkills.some((js) => js.includes(ps) || ps.includes(js)));

    if (matches.length > 0) {
      const displaySkills = matches.slice(0, 3).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(", ");
      return `Matches your skills in ${displaySkills}.`;
    }

    return `Aligned on project deliverables (${Math.round(score)}%).`;
  }
}
