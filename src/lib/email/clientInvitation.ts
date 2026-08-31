import nodemailer from "nodemailer";

export interface ProjectMilestoneSummary {
  id?: string;
  title: string;
  dueDate?: string;
  completed: boolean;
}

export interface ProjectSummary {
  id?: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  budget?: number;
  currency?: string;
  progress?: number;
  startDate?: string;
  dueDate?: string;
  milestones?: ProjectMilestoneSummary[];
}

export interface ClientInvitationEmailData {
  freelancerName: string;
  freelancerEmail: string;
  freelancerCompany?: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  invitationUrl: string;
  expiresAt: Date | string;
  project?: ProjectSummary;
  projects?: ProjectSummary[];
}

/**
 * Format currency with fallback
 */
function formatMoney(amount?: number, currency = "USD"): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency || "$"} ${amount.toLocaleString()}`;
  }
}

/**
 * Format date nicely
 */
function formatDate(dateInput?: string | Date): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Generate human readable project status
 */
function formatStatus(status?: string): { label: string; bg: string; text: string } {
  const s = (status || "active").toLowerCase();
  switch (s) {
    case "completed":
      return { label: "Completed", bg: "rgba(39, 166, 68, 0.2)", text: "#22c55e" };
    case "in_progress":
    case "active":
      return { label: "Active", bg: "rgba(34, 197, 94, 0.15)", text: "#22c55e" };
    case "in_review":
      return { label: "In Review", bg: "rgba(234, 179, 8, 0.15)", text: "#fbbf24" };
    case "on_hold":
      return { label: "On Hold", bg: "rgba(249, 115, 22, 0.15)", text: "#f97316" };
    default:
      return { label: s.charAt(0).toUpperCase() + s.slice(1), bg: "rgba(148, 163, 184, 0.15)", text: "#94a3b8" };
  }
}

/**
 * Generate the FreeAI-branded HTML email template
 */
export function generateClientInvitationHtml(data: ClientInvitationEmailData): string {
  const currentYear = new Date().getFullYear();
  const expirationFormatted = formatDate(data.expiresAt) || "7 days from now";
  const displayFreelancer = data.freelancerCompany
    ? `${data.freelancerName} (${data.freelancerCompany})`
    : data.freelancerName;
  const displayClient = data.clientCompany || data.clientName;

  // Single Project View
  const targetProject = data.project || (data.projects && data.projects.length === 1 ? data.projects[0] : null);
  const multiProjects = !targetProject && data.projects && data.projects.length > 1 ? data.projects : null;

  // Project HTML Block
  let projectSectionHtml = "";
  if (targetProject) {
    const statusInfo = formatStatus(targetProject.status);
    const budgetStr = targetProject.budget ? formatMoney(targetProject.budget, targetProject.currency) : "";
    const deadlineStr = formatDate(targetProject.dueDate);
    const progressVal = typeof targetProject.progress === "number" ? targetProject.progress : null;

    projectSectionHtml = `
      <!-- PROJECT DETAILS BLOCK -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #121824; border: 1px solid #232c3d; border-radius: 12px; margin-top: 24px; padding: 24px;">
        <tr>
          <td>
            <div style="font-size: 11px; font-weight: 700; color: #22c55e; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px;">
              PROJECT DETAILS
            </div>
            <div style="font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">
              ${escapeHtml(targetProject.title)}
            </div>
            ${
              targetProject.description
                ? `<div style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 16px;">
                    ${escapeHtml(targetProject.description)}
                   </div>`
                : ""
            }

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 12px; border-top: 1px solid #1e2638; padding-top: 16px;">
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #64748b;" width="35%">Status:</td>
                <td style="padding: 6px 0; font-size: 13px; color: #f1f5f9;">
                  <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background-color: ${statusInfo.bg}; color: ${statusInfo.text};">
                    ${statusInfo.label}
                  </span>
                </td>
              </tr>
              ${
                deadlineStr
                  ? `<tr>
                      <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Deadline:</td>
                      <td style="padding: 6px 0; font-size: 13px; color: #f1f5f9; font-weight: 500;">${deadlineStr}</td>
                    </tr>`
                  : ""
              }
              ${
                budgetStr
                  ? `<tr>
                      <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Budget:</td>
                      <td style="padding: 6px 0; font-size: 13px; color: #22c55e; font-weight: 600;">${budgetStr}</td>
                    </tr>`
                  : ""
              }
              ${
                progressVal !== null
                  ? `<tr>
                      <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Progress:</td>
                      <td style="padding: 6px 0; font-size: 13px; color: #f1f5f9;">
                        <span style="font-weight: 600;">${progressVal}%</span>
                        <div style="background-color: #1e293b; height: 6px; border-radius: 3px; width: 100%; margin-top: 6px; overflow: hidden;">
                          <div style="background-color: #22c55e; height: 6px; width: ${Math.min(100, Math.max(0, progressVal))}%;"></div>
                        </div>
                      </td>
                    </tr>`
                  : ""
              }
            </table>
          </td>
        </tr>
      </table>
    `;

    // Milestones block if available
    if (targetProject.milestones && targetProject.milestones.length > 0) {
      const milestoneRows = targetProject.milestones
        .map((m) => {
          const statusText = m.completed ? "Completed" : "In Progress";
          const statusColor = m.completed ? "#22c55e" : "#fbbf24";
          const dueDateText = m.dueDate ? ` · Due ${formatDate(m.dueDate)}` : "";
          return `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #1a2233; font-size: 13px; color: #e2e8f0;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${statusColor}; margin-right: 8px;"></span>
                <span style="font-weight: 600;">${escapeHtml(m.title)}</span>
              </td>
              <td align="right" style="padding: 10px 0; border-bottom: 1px solid #1a2233; font-size: 12px; color: #94a3b8;">
                <span style="color: ${statusColor}; font-weight: 500;">${statusText}</span>${dueDateText}
              </td>
            </tr>
          `;
        })
        .join("");

      projectSectionHtml += `
        <!-- MILESTONES BLOCK -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #121824; border: 1px solid #232c3d; border-radius: 12px; margin-top: 16px; padding: 20px 24px;">
          <tr>
            <td>
              <div style="font-size: 11px; font-weight: 700; color: #22c55e; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px;">
                PROJECT MILESTONES
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                ${milestoneRows}
              </table>
            </td>
          </tr>
        </table>
      `;
    }
  } else if (multiProjects) {
    const projectCards = multiProjects
      .map((p) => {
        const pStatus = formatStatus(p.status);
        const pDue = formatDate(p.dueDate);
        return `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #1e2638;">
              <div style="font-size: 14px; font-weight: 600; color: #ffffff;">${escapeHtml(p.title)}</div>
              <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
                <span style="color: ${pStatus.text}; font-weight: 500;">${pStatus.label}</span>
                ${typeof p.progress === "number" ? ` · ${p.progress}% complete` : ""}
                ${pDue ? ` · Due ${pDue}` : ""}
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    projectSectionHtml = `
      <!-- MULTIPLE PROJECTS BLOCK -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #121824; border: 1px solid #232c3d; border-radius: 12px; margin-top: 24px; padding: 20px 24px;">
        <tr>
          <td>
            <div style="font-size: 11px; font-weight: 700; color: #22c55e; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px;">
              YOUR ACTIVE PROJECTS
            </div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              ${projectCards}
            </table>
          </td>
        </tr>
      </table>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to FreeAI Client Portal</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0f17;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #f1f5f9;
    }
    table {
      border-collapse: collapse;
    }
    a {
      color: #22c55e;
      text-decoration: none;
    }
    @media only screen and (max-width: 620px) {
      .email-container {
        width: 100% !important;
        padding: 16px !important;
      }
      .email-content {
        padding: 24px 16px !important;
      }
      .button-cta {
        width: 100% !important;
        display: block !important;
        text-align: center !important;
        box-sizing: border-box !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <center style="width: 100%; background-color: #0b0f17; padding: 40px 10px;">
    <!-- CONTAINER -->
    <table role="presentation" class="email-container" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; margin: 0 auto; text-align: left;">
      
      <!-- HEADER LOGO -->
      <tr>
        <td align="center" style="padding-bottom: 24px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="vertical-align: middle;">
                <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); width: 36px; height: 36px; border-radius: 8px; text-align: center; line-height: 36px; color: #ffffff; font-weight: 900; font-size: 18px; display: inline-block;">
                  F
                </div>
              </td>
              <td style="vertical-align: middle; padding-left: 10px;">
                <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">Free<span style="color: #22c55e;">AI</span></span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- MAIN CARD -->
      <tr>
        <td class="email-content" style="background-color: #0f141e; border: 1px solid #1e2538; border-radius: 16px; padding: 36px 32px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);">
          
          <!-- INVITATION PILL -->
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="display: inline-block; background-color: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px;">
              CLIENT PORTAL INVITATION
            </span>
          </div>

          <!-- HEADLINE -->
          <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; text-align: center; margin: 0 0 12px 0; line-height: 1.3; letter-spacing: -0.02em;">
            You're invited to collaborate with<br/>
            <span style="color: #22c55e;">${escapeHtml(displayFreelancer)}</span>
          </h1>

          <p style="font-size: 15px; color: #94a3b8; text-align: center; margin: 0 0 28px 0; line-height: 1.6;">
            Hello ${escapeHtml(data.clientName || displayClient)}, you've been invited to access your dedicated FreeAI Client Portal to view project progress, approve deliverables, and manage payments.
          </p>

          <!-- MAIN CTA BUTTON -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
            <tr>
              <td align="center">
                <a href="${data.invitationUrl}" class="button-cta" target="_blank" style="display: inline-block; background-color: #22c55e; color: #0b0f17; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 8px; letter-spacing: 0.02em; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.35);">
                  Accept Invitation →
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top: 10px; font-size: 12px; color: #64748b;">
                Invitation expires: <strong style="color: #94a3b8;">${expirationFormatted}</strong>
              </td>
            </tr>
          </table>

          ${projectSectionHtml}

          <!-- WHAT YOU CAN DO BLOCK -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #121824; border: 1px solid #232c3d; border-radius: 12px; margin-top: 24px; padding: 24px;">
            <tr>
              <td>
                <div style="font-size: 11px; font-weight: 700; color: #22c55e; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 14px;">
                  WHAT YOU CAN DO IN THE CLIENT PORTAL
                </div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #cbd5e1;">• <strong>Track Real-Time Progress:</strong> Follow active milestones and schedules.</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #cbd5e1;">• <strong>Review Deliverables:</strong> Inspect submissions, approve assets, or request revisions.</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #cbd5e1;">• <strong>Direct Messaging:</strong> Keep all discussions and file exchanges unified in one place.</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #cbd5e1;">• <strong>Invoices & Payments:</strong> View invoices and manage payments transparently.</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #cbd5e1;">• <strong>Centralized File Repository:</strong> Access approved designs, contracts, and code.</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- INVITATION RECAP -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 24px; border-top: 1px solid #1e2538; padding-top: 20px;">
            <tr>
              <td style="padding: 4px 0; font-size: 12px; color: #64748b;" width="35%">Invited By:</td>
              <td style="padding: 4px 0; font-size: 12px; color: #f1f5f9; font-weight: 500;">${escapeHtml(displayFreelancer)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 12px; color: #64748b;">Client / Company:</td>
              <td style="padding: 4px 0; font-size: 12px; color: #f1f5f9; font-weight: 500;">${escapeHtml(displayClient)}</td>
            </tr>
            ${
              targetProject
                ? `<tr>
                    <td style="padding: 4px 0; font-size: 12px; color: #64748b;">Project:</td>
                    <td style="padding: 4px 0; font-size: 12px; color: #f1f5f9; font-weight: 500;">${escapeHtml(targetProject.title)}</td>
                   </tr>`
                : ""
            }
            <tr>
              <td style="padding: 4px 0; font-size: 12px; color: #64748b;">Invited Email:</td>
              <td style="padding: 4px 0; font-size: 12px; color: #22c55e; font-weight: 500;">${escapeHtml(data.clientEmail)}</td>
            </tr>
          </table>

          <!-- SECONDARY CTA -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 28px;">
            <tr>
              <td align="center">
                <a href="${data.invitationUrl}" class="button-cta" target="_blank" style="display: inline-block; background-color: #1e293b; border: 1px solid #334155; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
                  Access Client Portal →
                </a>
              </td>
            </tr>
          </table>

        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="padding: 24px 16px; text-align: center; font-size: 12px; color: #64748b; line-height: 1.6;">
          <p style="margin: 0 0 6px 0;">
            This invitation was intended for <span style="color: #94a3b8;">${escapeHtml(data.clientEmail)}</span>.
          </p>
          <p style="margin: 0 0 12px 0;">
            If you were not expecting this invitation, you can safely ignore this email.
          </p>
          <p style="margin: 0; color: #475569;">
            © ${currentYear} FreeAI. All rights reserved.
          </p>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text fallback for email clients
 */
export function generateClientInvitationText(data: ClientInvitationEmailData): string {
  const currentYear = new Date().getFullYear();
  const displayFreelancer = data.freelancerCompany
    ? `${data.freelancerName} (${data.freelancerCompany})`
    : data.freelancerName;
  const targetProject = data.project || (data.projects && data.projects.length === 1 ? data.projects[0] : null);

  let text = `FREEAI CLIENT PORTAL INVITATION\n\n`;
  text += `You've been invited by ${displayFreelancer} to access your dedicated FreeAI Client Portal.\n\n`;
  text += `Accept Invitation: ${data.invitationUrl}\n\n`;
  text += `Invitation expires: ${formatDate(data.expiresAt) || "in 7 days"}\n\n`;

  if (targetProject) {
    text += `----------------------------------------\n`;
    text += `PROJECT DETAILS\n`;
    text += `Title: ${targetProject.title}\n`;
    if (targetProject.description) text += `Description: ${targetProject.description}\n`;
    if (targetProject.status) text += `Status: ${targetProject.status}\n`;
    if (targetProject.dueDate) text += `Deadline: ${formatDate(targetProject.dueDate)}\n`;
    if (targetProject.budget) text += `Budget: ${formatMoney(targetProject.budget, targetProject.currency)}\n`;
    if (typeof targetProject.progress === "number") text += `Progress: ${targetProject.progress}%\n`;
    text += `----------------------------------------\n\n`;

    if (targetProject.milestones && targetProject.milestones.length > 0) {
      text += `PROJECT MILESTONES:\n`;
      for (const m of targetProject.milestones) {
        text += `- ${m.title} [${m.completed ? "Completed" : "In Progress"}]${m.dueDate ? ` (Due: ${formatDate(m.dueDate)})` : ""}\n`;
      }
      text += `\n`;
    }
  }

  text += `WHAT YOU CAN DO IN THE CLIENT PORTAL:\n`;
  text += `- Track project progress\n`;
  text += `- Review and approve deliverables\n`;
  text += `- Directly communicate with your freelancer\n`;
  text += `- View invoices and manage payments\n`;
  text += `- Access shared project files\n\n`;

  text += `Accept Invitation link:\n${data.invitationUrl}\n\n`;
  text += `This invitation is intended for ${data.clientEmail}. If you were not expecting it, you can safely ignore this email.\n`;
  text += `© ${currentYear} FreeAI\n`;

  return text;
}

/**
 * Generate Subject Line based on project or freelancer
 */
export function generateClientInvitationSubject(data: ClientInvitationEmailData): string {
  const targetProject = data.project || (data.projects && data.projects.length === 1 ? data.projects[0] : null);
  if (targetProject?.title) {
    return `You're invited to collaborate on ${targetProject.title} via FreeAI`;
  }
  return `${data.freelancerName} invited you to the FreeAI Client Portal`;
}

/**
 * Core function to send the invitation email
 */
export async function sendClientInvitationEmail(
  data: ClientInvitationEmailData
): Promise<{ success: boolean; mode: "resend" | "smtp" | "dev_logged"; messageId?: string; error?: string }> {
  const subject = generateClientInvitationSubject(data);
  const html = generateClientInvitationHtml(data);
  const text = generateClientInvitationText(data);

  const fromEmail = process.env.EMAIL_FROM || "FreeAI <invitations@resend.dev>";
  const replyTo = data.freelancerEmail || undefined;

  // 1. Resend API support
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [data.clientEmail],
          reply_to: replyTo,
          subject,
          html,
          text,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("[sendClientInvitationEmail] Resend API error:", errorData);
        return {
          success: false,
          mode: "resend",
          error: errorData.message || "Failed to send email via Resend",
        };
      }

      const resData = await res.json();
      return {
        success: true,
        mode: "resend",
        messageId: resData.id,
      };
    } catch (err: any) {
      console.error("[sendClientInvitationEmail] Resend exception:", err);
      return {
        success: false,
        mode: "resend",
        error: err.message || "Network error while sending email",
      };
    }
  }

  // 2. SMTP support
  if (process.env.SMTP_HOST) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS || "",
            }
          : undefined,
      });

      const info = await transporter.sendMail({
        from: fromEmail,
        to: data.clientEmail,
        replyTo,
        subject,
        html,
        text,
      });

      return {
        success: true,
        mode: "smtp",
        messageId: info.messageId,
      };
    } catch (err: any) {
      console.error("[sendClientInvitationEmail] SMTP exception:", err);
      return {
        success: false,
        mode: "smtp",
        error: err.message || "Failed to send email via SMTP",
      };
    }
  }

  // 3. Local Development Fallback
  console.log(`\n======================================================`);
  console.log(`✉️  [FREEAI EMAIL SERVICE - LOCAL DEV SIMULATION]`);
  console.log(`------------------------------------------------------`);
  console.log(`To:        ${data.clientEmail}`);
  console.log(`From:      ${fromEmail}`);
  console.log(`Reply-To:  ${replyTo || "N/A"}`);
  console.log(`Subject:   ${subject}`);
  console.log(`Invite URL: ${data.invitationUrl}`);
  console.log(`Expires:   ${data.expiresAt}`);
  if (data.project) {
    console.log(`Project:   ${data.project.title} (${data.project.status || "active"})`);
  }
  console.log(`======================================================\n`);

  return {
    success: true,
    mode: "dev_logged",
    messageId: `dev_${Date.now()}`,
  };
}

function escapeHtml(str?: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
