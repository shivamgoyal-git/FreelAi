import connectDB from "./mongodb";
import FreelancerProfile, { IFreelancerProfile } from "@/models/FreelancerProfile";

export class AiContextService {
  /**
   * Fetch freelancer profile directly from Database
   */
  static async getProfile(userId: string): Promise<IFreelancerProfile | null> {
    await connectDB();
    return await FreelancerProfile.findOne({ userId });
  }

  /**
   * Delete freelancer profile
   */
  static async deleteProfile(userId: string): Promise<boolean> {
    await connectDB();
    const result = await FreelancerProfile.deleteOne({ userId });
    return result.deletedCount > 0;
  }

  /**
   * Update or create freelancer profile, and calculate completeness
   */
  static async saveProfile(userId: string, data: Partial<IFreelancerProfile>): Promise<IFreelancerProfile> {
    await connectDB();

    // Compute completeness
    const completeness = this.calculateCompleteness(data);
    data.profileCompleteness = completeness;

    const existing = await FreelancerProfile.findOne({ userId });
    if (existing) {
      Object.assign(existing, data);
      return await existing.save();
    } else {
      const newProfile = new FreelancerProfile({
        userId,
        ...data,
      });
      return await newProfile.save();
    }
  }

  /**
   * Calculate profile completeness score (0-100) based on weighted field checks
   */
  static calculateCompleteness(data: Partial<IFreelancerProfile>): number {
    let score = 0;

    // 1. Basic Info (20%): Name & Professional Title
    if (data.personal?.fullName && data.personal?.professionalTitle) {
      score += 20;
    }
    // 2. Skills (20%): At least one skill
    if (data.professional?.skills && data.professional.skills.length > 0) {
      score += 20;
    }
    // 3. Services (20%): At least one service
    if (data.professional?.services && data.professional.services.length > 0) {
      score += 20;
    }
    // 4. Portfolio (20%): At least one portfolio/social link
    const s = data.socialLinks || {};
    if (s.website || s.github || s.linkedin || s.behance || s.dribbble) {
      score += 20;
    }
    // 5. Pricing (20%): Hourly rate greater than 0 and pricing model
    if (data.pricing?.hourlyRate && data.pricing.hourlyRate > 0 && data.pricing?.pricingModel) {
      score += 20;
    }

    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Compile Profile parameters into an aggregated context block consumed by LLMs.
   */
  static async getAiSystemContext(userId: string): Promise<string> {
    const profile = await this.getProfile(userId);
    if (!profile) {
      return "No freelancer identity context is available. Direct the generation based on the inputs provided.";
    }

    const { personal, business, professional, pricing, brandVoice, aiNotes, socialLinks } = profile;

    // Build skills text
    const skillsText = professional.skills.join(", ");

    // Build services text
    const servicesText = professional.services
      .map((svc) => `- **${svc.name}** (${svc.category}): Starting at $${svc.startingPrice}. ${svc.description}. Details: ${svc.features?.join(", ") || "N/A"}`)
      .join("\n");

    // Build brand voice descriptors
    const voiceText = brandVoice.voiceDescriptors && brandVoice.voiceDescriptors.length > 0
      ? brandVoice.voiceDescriptors.join(", ")
      : "Professional, outcome-driven";

    // Build social references
    const links: string[] = [];
    if (socialLinks.website) links.push(`Website: ${socialLinks.website}`);
    if (socialLinks.github) links.push(`GitHub: ${socialLinks.github}`);
    if (socialLinks.linkedin) links.push(`LinkedIn: ${socialLinks.linkedin}`);
    if (socialLinks.behance) links.push(`Behance: ${socialLinks.behance}`);
    if (socialLinks.dribbble) links.push(`Dribbble: ${socialLinks.dribbble}`);

    const context = `
=== FREELANCER IDENTITY LAYER CONTEXT ===
You are writing on behalf of:
- **Full Name**: ${personal.fullName}
- **Professional Title**: ${personal.professionalTitle || "Freelancer"}
- **Years of Experience**: ${professional.yearsOfExperience || 0} years
- **Bio**: "${professional.bio || "N/A"}"
- **Country**: ${personal.country || "N/A"} (Timezone: ${personal.timezone || "N/A"})
- **Business Structure**: ${business.companyName || "Independent"} ${business.structure ? `(${business.structure})` : ""}

**Skills & Expertise**:
${skillsText}

**Offered Services**:
${servicesText}

**Pricing Parameters**:
- Hourly Rate: $${pricing.hourlyRate || 0} / hr (Preferred currency: ${pricing.currency || "USD"})
- Primary Pricing Model: ${pricing.pricingModel || "Hourly"}

**Social & Portfolio Reference Links**:
${links.length > 0 ? links.join("\n") : "None provided"}

**Brand Voice & Writing Constraints**:
- **Tone keywords**: ${voiceText}
- **Jargon Level**: ${brandVoice.jargonLevel || "moderate"}
- **Sentence Structure Goal**: ${brandVoice.sentenceStructure || "Clear, brief and outcome-driven"}
- **Forbidden Phrases to Avoid**: [${brandVoice.forbiddenPhrases?.join(", ") || "None"}]
- **Key Custom Phrases to Include**: [${brandVoice.customPhrases?.join(", ") || "None"}]

**Custom AI Behavior Directives (AI Notes)**:
"${aiNotes || "Always draft proposals in a clear, persuasive format focusing on client outcomes."}"
=========================================
`;
    return context.trim();
  }
}
