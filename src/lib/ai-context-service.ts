import { prisma } from "@/lib/prisma";

export class AiContextService {
  /**
   * Fetch freelancer profile directly from Database
   */
  static async getProfile(userId: string): Promise<any | null> {
    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId },
    });
    return profile;
  }

  /**
   * Delete freelancer profile
   */
  static async deleteProfile(userId: string): Promise<boolean> {
    try {
      await prisma.freelancerProfile.delete({
        where: { userId },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Update or create freelancer profile, and calculate completeness
   */
  static async saveProfile(userId: string, data: any): Promise<any> {
    const completeness = this.calculateCompleteness(data);
    data.profileCompleteness = completeness;

    const profile = await prisma.freelancerProfile.upsert({
      where: { userId },
      update: {
        personal: data.personal || data.personalInfo || {},
        business: data.business || data.businessInfo || {},
        professional: data.professional || data.professionalInfo || {},
        pricing: data.pricing || data.pricingInfo || {},
        workPreferences: data.workPreferences || {},
        aiPreferences: data.aiPreferences || {},
        brandVoice: data.brandVoice || {},
        aiNotes: data.aiNotes || "",
        availability: data.availability || "Available",
        socialLinks: data.socialLinks || {},
        preferences: data.preferences || {},
        profileCompleteness: completeness,
      },
      create: {
        userId,
        personal: data.personal || data.personalInfo || {},
        business: data.business || data.businessInfo || {},
        professional: data.professional || data.professionalInfo || {},
        pricing: data.pricing || data.pricingInfo || {},
        workPreferences: data.workPreferences || {},
        aiPreferences: data.aiPreferences || {},
        brandVoice: data.brandVoice || {},
        aiNotes: data.aiNotes || "",
        availability: data.availability || "Available",
        socialLinks: data.socialLinks || {},
        preferences: data.preferences || {},
        profileCompleteness: completeness,
      },
    });

    return profile;
  }

  /**
   * Calculate profile completeness score (0-100) based on weighted field checks
   */
  static calculateCompleteness(data: any): number {
    let score = 0;

    const personal = data.personal || data.personalInfo;
    const professional = data.professional || data.professionalInfo;
    const pricing = data.pricing || data.pricingInfo;
    const socialLinks = data.socialLinks || {};

    // 1. Basic Info (20%): Name & Professional Title
    if (personal?.fullName && personal?.professionalTitle) {
      score += 20;
    }
    // 2. Skills (20%): At least one skill
    if (professional?.skills && professional.skills.length > 0) {
      score += 20;
    }
    // 3. Services (20%): At least one service
    if (professional?.services && professional.services.length > 0) {
      score += 20;
    }
    // 4. Portfolio (20%): At least one portfolio/social link
    if (socialLinks.website || socialLinks.github || socialLinks.linkedin || socialLinks.behance || socialLinks.dribbble) {
      score += 20;
    }
    // 5. Pricing (20%): Hourly rate greater than 0 and pricing model
    if (pricing?.hourlyRate && pricing.hourlyRate > 0 && pricing?.pricingModel) {
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

    const personal = profile.personal as any || {};
    const business = profile.business as any || {};
    const professional = profile.professional as any || {};
    const pricing = profile.pricing as any || {};
    const brandVoice = profile.brandVoice as any || {};
    const aiNotes = profile.aiNotes || "";
    const socialLinks = profile.socialLinks as any || {};

    // Build skills text
    const skillsText = Array.isArray(professional.skills) ? professional.skills.join(", ") : "N/A";

    // Build services text
    const servicesText = Array.isArray(professional.services)
      ? professional.services
          .map((svc: any) => `- **${svc.name}** (${svc.category}): Starting at $${svc.startingPrice}. ${svc.description}. Details: ${svc.features?.join(", ") || "N/A"}`)
          .join("\n")
      : "N/A";

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
- **Full Name**: ${personal.fullName || "Freelancer"}
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
