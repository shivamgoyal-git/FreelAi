import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import Deliverable from "@/models/Deliverable";
import Invoice from "@/models/Invoice";
import Activity from "@/models/Activity";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, previewClientId } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, client, freelancerUser } = authCtx;
    await connectDB();

    // 1. Fetch strictly client-scoped data
    const [projects, deliverables, invoices, activities] = await Promise.all([
      Project.find({ clientId }).lean(),
      Deliverable.find({ clientId }).lean(),
      Invoice.find({ clientId, status: { $ne: "draft" } }).lean(),
      Activity.find({ clientId }).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    const activeProjects = projects.filter(
      (p) => p.status === "active" || p.status === "in_review"
    );
    const pendingDeliverables = deliverables.filter(
      (d) => d.status === "pending_review"
    );
    const pendingInvoices = invoices.filter(
      (i) => i.status === "sent" || i.status === "partially_paid" || i.status === "overdue"
    );

    const clientContext = {
      clientName: client.name,
      company: client.company || "",
      freelancerName: freelancerUser?.name || "Your Freelancer",
      activeProjectsCount: activeProjects.length,
      projects: projects.map((p) => ({
        id: p._id.toString(),
        title: p.title,
        status: p.status,
        progress: `${p.progress}%`,
        budget: `${p.currency || "INR"} ${p.budget?.toLocaleString()}`,
        paid: `${p.currency || "INR"} ${p.paid?.toLocaleString()}`,
        dueDate: p.dueDate || "Not set",
        milestones: p.milestones?.map((m: any) => ({
          title: m.title,
          completed: m.completed,
          dueDate: m.dueDate,
        })),
      })),
      pendingDeliverables: pendingDeliverables.map((d) => ({
        title: d.title,
        version: d.version,
        uploadedAt: d.createdAt,
        status: d.status,
      })),
      pendingInvoices: pendingInvoices.map((i) => ({
        invoiceNumber: i.invoiceNumber,
        total: `${i.currency || "INR"} ${i.total?.toLocaleString()}`,
        remaining: `${i.currency || "INR"} ${(i.remainingAmount || i.total)?.toLocaleString()}`,
        dueDate: i.dueDate,
        status: i.status,
      })),
      recentActivity: activities.map((a) => ({
        title: a.title,
        description: a.description,
        date: a.createdAt,
      })),
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `You are FreeAI Client Assistant, a helpful, polite, and professional AI embedded inside the FreeAI Client Portal for client "${client.name}".
You ONLY have access to the following project data for this specific client:

CLIENT CONTEXT:
${JSON.stringify(clientContext, null, 2)}

CLIENT'S QUESTION:
"${message}"

INSTRUCTIONS:
1. Answer the client's question accurately using ONLY the provided data.
2. Be concise, polite, professional, and clear.
3. If they ask about project status, summarize progress percentage, current milestones, and any blockers.
4. If they ask about deliverables, highlight items awaiting their review/approval.
5. If they ask about invoices or payments, summarize pending amounts and due dates.
6. Do NOT mention internal database IDs or any information outside this client's scope.
7. Return a direct, well-formatted response with bullet points if helpful.`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const geminiRes = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const reply =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return NextResponse.json({ reply: reply.trim() });
          }
        }
      } catch (err) {
        console.warn("[ClientAI] Gemini API error, falling back to local reasoning:", err);
      }
    }

    // Local deterministic reasoning fallback (ensures 100% reliable responses)
    const qLower = message.toLowerCase();
    let reply = "";

    if (qLower.includes("status") || qLower.includes("progress")) {
      if (projects.length === 0) {
        reply = `Hello ${client.name}, there are currently no active projects created yet. Please check with your freelancer (${freelancerUser?.name || "your freelancer"}).`;
      } else {
        const pSummary = projects
          .map(
            (p) =>
              `• **${p.title}**: Status is **${p.status.toUpperCase()}** with **${p.progress}%** completion. (Budget: ${p.currency || "INR"} ${p.budget?.toLocaleString()})`
          )
          .join("\n");
        reply = `Here is the current status of your projects:\n\n${pSummary}\n\n${
          pendingDeliverables.length > 0
            ? `⚠️ You have **${pendingDeliverables.length} deliverable(s)** waiting for your review.`
            : `All submitted deliverables are up to date.`
        }`;
      }
    } else if (qLower.includes("milestone") || qLower.includes("deadline") || qLower.includes("next")) {
      const milestonesList: string[] = [];
      projects.forEach((p) => {
        const upcoming = p.milestones?.filter((m: any) => !m.completed) || [];
        if (upcoming.length > 0) {
          milestonesList.push(
            `• **${p.title}**: Next milestone is **${upcoming[0].title}**${
              upcoming[0].dueDate ? ` (Due: ${new Date(upcoming[0].dueDate).toLocaleDateString()})` : ""
            }`
          );
        }
      });
      reply = milestonesList.length > 0
        ? `Here are your upcoming milestones:\n\n${milestonesList.join("\n")}`
        : `All scheduled milestones for your active projects are currently marked complete or in progress.`;
    } else if (qLower.includes("invoice") || qLower.includes("pay") || qLower.includes("bill") || qLower.includes("outstanding")) {
      if (pendingInvoices.length === 0) {
        reply = `Great news! You have no outstanding or overdue invoices at this moment.`;
      } else {
        const invList = pendingInvoices
          .map(
            (i) =>
              `• **Invoice #${i.invoiceNumber}**: ${i.currency || "INR"} ${(i.remainingAmount || i.total).toLocaleString()} (${i.status.toUpperCase()}) - Due: ${new Date(i.dueDate).toLocaleDateString()}`
          )
          .join("\n");
        reply = `You have **${pendingInvoices.length} pending invoice(s)**:\n\n${invList}\n\nYou can review and pay directly under the **Invoices** tab.`;
      }
    } else if (qLower.includes("deliverable") || qLower.includes("approval") || qLower.includes("review")) {
      if (pendingDeliverables.length === 0) {
        reply = `You do not have any deliverables awaiting approval right now. All previous submissions have been reviewed.`;
      } else {
        const delivList = pendingDeliverables
          .map((d) => `• **${d.title}** (${d.version}) - Awaiting your review.`)
          .join("\n");
        reply = `You have **${pendingDeliverables.length} deliverable(s)** awaiting your feedback or approval:\n\n${delivList}\n\nPlease check the project **Deliverables** tab to preview, approve, or request changes.`;
      }
    } else if (qLower.includes("activity") || qLower.includes("recent") || qLower.includes("update") || qLower.includes("summary")) {
      if (activities.length === 0) {
        reply = `No recent project activity logged yet.`;
      } else {
        const actList = activities
          .slice(0, 5)
          .map((a) => `• ${a.title}: ${a.description}`)
          .join("\n");
        reply = `Here is a summary of recent project activity:\n\n${actList}`;
      }
    } else {
      reply = `Hello ${client.name}! I am your FreeAI Assistant for your workspace with ${freelancerUser?.name || "your freelancer"}.\n\nYou have **${projects.length} project(s)**, **${pendingDeliverables.length} deliverable(s)** needing review, and **${pendingInvoices.length} pending invoice(s)**.\n\nHow can I help you today? You can ask me about:\n• Project progress & milestones\n• Deliverables awaiting review\n• Invoices & payment status\n• Recent activity summary`;
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("[POST /api/portal/ai] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process AI request" },
      { status: error.status || 500 }
    );
  }
}
